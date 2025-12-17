from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
import re
import uuid

router = APIRouter()

# Memoria súper simple en RAM por sesión
SESSIONS: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def compute_risk(tx: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(tx.get("amount", 0))
    attempts_10min = int(tx.get("attempts_10min", 1))
    is_new_device = bool(tx.get("is_new_device", False))
    hour = int(tx.get("hour", 12))
    channel = str(tx.get("channel", "web")).lower()
    country = str(tx.get("country", "GT")).lower()

    score = 0

    # reglas simples
    if amount >= 2000: score += 35
    elif amount >= 800: score += 20
    elif amount >= 300: score += 10

    if attempts_10min >= 6: score += 35
    elif attempts_10min >= 3: score += 20

    if is_new_device: score += 15
    if hour <= 5: score += 10
    if channel == "web": score += 5
    if country in {"unknown", "xx"}: score += 20

    score = min(score, 100)

    if score >= 70:
        decision = "BLOQUEAR"
        advice = "Riesgo alto. Bloquear y escalar a monitoreo/prevención."
    elif score >= 40:
        decision = "REVISAR"
        advice = "Riesgo medio. Pedir verificación (OTP/3DS) o revisión manual."
    else:
        decision = "APROBAR"
        advice = "Riesgo bajo. Aprobar y monitorear."

    return {"risk_score": score, "decision": decision, "advice": advice}

def try_extract_tx_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Intenta parsear comandos tipo:
    tx amount=3500 attempts=7 new_device=yes hour=2 channel=web country=XX
    """
    if not text.lower().startswith("tx"):
        return None

    tx = {}
    # pares key=value
    pairs = re.findall(r"(\w+)\s*=\s*([^\s]+)", text)
    for k, v in pairs:
        k = k.lower()
        v_raw = v.strip()

        if k in {"amount"}:
            tx[k] = float(v_raw)
        elif k in {"attempts", "attempts_10min"}:
            tx["attempts_10min"] = int(v_raw)
        elif k in {"new_device", "is_new_device"}:
            tx["is_new_device"] = v_raw.lower() in {"1", "true", "yes", "si", "s"}
        elif k in {"hour"}:
            tx["hour"] = int(v_raw)
        elif k in {"channel"}:
            tx["channel"] = v_raw
        elif k in {"country"}:
            tx["country"] = v_raw
        elif k in {"tx_id", "id"}:
            tx["tx_id"] = v_raw
        elif k in {"user_id", "user"}:
            tx["user_id"] = v_raw

    # defaults mínimos
    tx.setdefault("country", "GT")
    tx.setdefault("channel", "web")
    tx.setdefault("attempts_10min", 1)
    tx.setdefault("is_new_device", False)
    tx.setdefault("hour", 12)
    tx.setdefault("amount", 0.0)
    return tx

@router.post("/chat")
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    state = SESSIONS.setdefault(session_id, {"history": []})

    msg = req.message.strip()
    state["history"].append({"user": msg})

    lower = msg.lower()

    # ayuda
    if lower in {"help", "ayuda", "menu"}:
        reply = (
            "Comandos:\n"
            "1) 'tx amount=... attempts=... new_device=yes/no hour=.. channel=web/app country=GT'\n"
            "2) 'estado' para ver la sesión\n"
            "3) 'reset' para limpiar la sesión\n"
            "O envíame un JSON de transacción pegado como texto (si tu front lo manda así)."
        )
        return {"session_id": session_id, "reply": reply}

    if lower == "reset":
        SESSIONS[session_id] = {"history": []}
        return {"session_id": session_id, "reply": "Sesión reiniciada."}

    if lower == "estado":
        return {"session_id": session_id, "history": state["history"][-10:]}

    # intento de transacción desde texto
    tx = try_extract_tx_from_text(msg)
    if tx:
        result = compute_risk(tx)
        reply = (
            f"Analicé la transacción.\n"
            f"Score: {result['risk_score']}/100\n"
            f"Decisión: {result['decision']}\n"
            f"Recomendación: {result['advice']}"
        )
        return {"session_id": session_id, "tx": tx, "result": result, "reply": reply}

    # conversación simple
    if "fraude" in lower:
        reply = (
            "Puedo ayudarte a evaluar riesgo. "
            "Escribe 'help' para ver el formato o envía una transacción con: "
            "tx amount=950 attempts=3 new_device=yes hour=22 channel=web country=GT"
        )
        return {"session_id": session_id, "reply": reply}

    reply = "No entendí del todo. Escribe 'help' o envía una transacción con el comando 'tx ...'."
    return {"session_id": session_id, "reply": reply}

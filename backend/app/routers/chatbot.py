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

    # Saludos cordiales
    greetings = {
        "hola": "¡Hola! 👋 Bienvenido al sistema de detección de fraude. ¿En qué puedo ayudarte?",
        "buenos días": "¡Buenos días! 🌅 Espero que tengas un excelente día. ¿Necesitas evaluar alguna transacción?",
        "buenas tardes": "¡Buenas tardes! ☀️ ¿Cómo estás? Estoy listo para ayudarte con el análisis de fraude.",
        "buenas noches": "¡Buenas noches! 🌙 Gracias por contar conmigo. ¿Hay algo en lo que pueda asistirte?",
        "hey": "¡Hey! 😊 ¿Qué necesitas hoy?",
        "hi": "Hi there! 👋 How can I help you with fraud detection?",
        "hello": "Hello! 🎯 Ready to analyze transactions for fraud?",
    }

    # Revisar saludos exactos o muy similares
    for greeting, response in greetings.items():
        if lower == greeting or (lower.startswith(greeting) and len(lower) <= len(greeting) + 5):
            return {"session_id": session_id, "reply": response}

    # Respuestas a preguntas específicas PRIMERO (antes de las generales)
    # IMPORTANTE: Verificar preguntas complejas ANTES de palabras cortas
    
    # Preguntas sobre cómo funciona
    if any(word in lower for word in ["funciona", "funciono", "trabajo", "funcionamiento"]) and any(word in lower for word in ["qué", "que", "cual", "cuál", "como", "cómo"]):
        reply = (
            "**¿CÓMO FUNCIONA FRAUDSHIELDAI?**\n\n"
            "**El Sistema tiene 3 partes principales:**\n\n"
            "**FRONTEND (La Interfaz)**\n"
            "   Es lo que ves en la pantalla. Aquí ingresas\n"
            "   los datos de la transacción que quieres\n"
            "   verificar (monto, país, hora, etc.)\n\n"
            "**MODELO AI (La Inteligencia Artificial)**\n"
            "   Es quien realmente analiza el riesgo.\n"
            "   Mira 6 factores clave de tu transacción\n"
            "   y genera un score de riesgo.\n\n"
            "**LOS 6 FACTORES QUE ANALIZO:**\n"
            "Cantidad de dinero de la transacción\n"
            "Número de intentos\n"
            "**RESULTADO:**\n"
            "🟢 BAJO RIESGO = Transacción segura\n"
            "🟡 RIESGO MEDIO = Verificar con OTP\n"
            "🔴 ALTO RIESGO = Bloquear\n\n"
            "¿Quieres que analice una transacción?"
        )
        return {"session_id": session_id, "reply": reply}

    # Preguntas sobre información del sistema
    if any(word in lower for word in ["información", "informacion", "info", "detalles", "details"]) and any(word in lower for word in ["qué", "que", "cual", "cuál"]):
        reply = (
            "ℹ️ **Información del Sistema:**\n\n"
            "Soy **FraudShield AI**, un sistema inteligente de detección de fraude.\n\n"
            "🔍 **Mis Capacidades:**\n"
            "✓ Análisis en tiempo real de transacciones\n"
            "✓ Evaluación de riesgo automática\n"
            "✓ Recomendaciones de acción (Bloquear/Revisar/Aprobar)\n"
            "✓ Historial de sesión\n"
            "✓ Soporte en español e inglés\n\n"
            "🛡️ **Objetivo:**\n"
            "Proteger transacciones de comercio electrónico identificando patrones sospechosos y reduciendo pérdidas por fraude.\n\n"
            "¿Necesitas ayuda con algo específico?"
        )
        return {"session_id": session_id, "reply": reply}

    # Preguntas generales (menos específicas)
    if any(word in lower for word in ["como estás", "cómo estás", "qué tal", "como vas", "cómo vas"]):
        reply = "¡Estoy funcionando perfectamente! 😊 Listo para analizar transacciones y detectar fraudes. ¿Tienes algo en mente?"
        return {"session_id": session_id, "reply": reply}

    if any(word in lower for word in ["gracias", "thanks", "thank you"]):
        reply = "¡De nada! 🙌 Es un placer asistirte. ¿Necesitas algo más?"
        return {"session_id": session_id, "reply": reply}

    if any(word in lower for word in ["adiós", "adios", "bye", "hasta luego", "chao"]):
        reply = "¡Hasta pronto! 👋 Que tengas un excelente día. No dudes en volver si necesitas más análisis."
        return {"session_id": session_id, "reply": reply}

    # ayuda
    if lower in {"help", "ayuda", "menu", "menú"}:
        reply = (
            "📋 **Comandos disponibles:**\n\n"
            "1️⃣ **Analizar Transacción:**\n"
            "   `tx amount=3500 attempts=7 new_device=yes hour=2 channel=web country=GT`\n\n"
            "2️⃣ **Ver Sesión:**\n"
            "   `estado`\n\n"
            "3️⃣ **Limpiar Sesión:**\n"
            "   `reset`\n\n"
            "💬 También puedo responder preguntas sobre fraude de manera natural."
        )
        return {"session_id": session_id, "reply": reply}

    if lower == "reset":
        SESSIONS[session_id] = {"history": []}
        return {"session_id": session_id, "reply": "✅ Sesión reiniciada. ¡Comenzamos de nuevo!"}

    if lower == "estado":
        history_str = "\n".join([f"- {h.get('user', '')}" for h in state["history"][-5:]])
        return {"session_id": session_id, "reply": f"📊 **Últimos 5 mensajes de tu sesión:**\n{history_str}"}

    # intento de transacción desde texto
    tx = try_extract_tx_from_text(msg)
    if tx:
        result = compute_risk(tx)
        reply = (
            f"🔍 **Análisis de Transacción**\n\n"
            f"📊 Score de Riesgo: **{result['risk_score']}/100**\n"
            f"🎯 Decisión: **{result['decision']}**\n"
            f"💡 Recomendación: {result['advice']}"
        )
        return {"session_id": session_id, "tx": tx, "result": result, "reply": reply}

    # conversación sobre fraude
    if any(word in lower for word in ["fraude", "fraud", "sospechosa", "suspicious", "riesgo", "risk", "seguridad", "security"]):
        reply = (
            "🛡️ ¡Excelente pregunta! Puedo ayudarte a evaluar el riesgo de fraude.\n\n"
            "Envíame los datos de una transacción con este formato:\n"
            "`tx amount=950 attempts=3 new_device=yes hour=22 channel=web country=GT`\n\n"
            "O escribe 'help' para ver todos los comandos. 📚"
        )
        return {"session_id": session_id, "reply": reply}

    # Default: mensaje amigable que pida clarificación
    reply = (
        "🤔 No estoy seguro de lo que preguntaste.\n\n"
        "Puedo ayudarte con:\n"
        "✅ Analizar transacciones para detectar fraude\n"
        "✅ Responder preguntas sobre seguridad\n\n"
        "Escribe 'help' para ver los comandos o envía una transacción para analizar. 📊"
    )
    return {"session_id": session_id, "reply": reply}

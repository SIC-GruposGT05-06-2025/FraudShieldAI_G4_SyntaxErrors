from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
import re
import uuid

router = APIRouter()

# Memoria en RAM por sesión
SESSIONS: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

def compute_risk(tx: Dict[str, Any]) -> Dict[str, Any]:
    """Calcula el riesgo basado en monto y número de intentos"""
    amount = float(tx.get("amount", 0))
    attempts_10min = int(tx.get("attempts_10min", 1))

    score = 0

    # Reglas de riesgo por monto
    if amount >= 2000:
        score += 50
    elif amount >= 800:
        score += 30
    elif amount >= 300:
        score += 15

    # Reglas de riesgo por intentos
    if attempts_10min >= 6:
        score += 50
    elif attempts_10min >= 3:
        score += 25

    score = min(score, 100)

    # Decisión basada en el score
    if score >= 70:
        decision = "BLOQUEAR"
        advice = "Riesgo alto detectado. Se recomienda bloquear la transacción y escalar a revisión."
    elif score >= 40:
        decision = "REVISAR"
        advice = "Riesgo medio. Se requiere verificación adicional (OTP, 2FA) antes de aprobar."
    else:
        decision = "APROBAR"
        advice = "Riesgo bajo. La transacción puede procesarse normalmente."

    return {"risk_score": score, "decision": decision, "advice": advice}

def try_extract_tx_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extrae datos de transacción del texto.
    Formato esperado: tx amount=3500 attempts=7
    """
    if not text.lower().startswith("tx"):
        return None

    tx = {}
    pairs = re.findall(r"(\w+)\s*=\s*([^\s]+)", text)
    
    for k, v in pairs:
        k = k.lower()
        v_raw = v.strip()

        if k in {"amount", "monto"}:
            try:
                tx["amount"] = float(v_raw)
            except ValueError:
                continue
        elif k in {"attempts", "attempts_10min", "intentos"}:
            try:
                tx["attempts_10min"] = int(v_raw)
            except ValueError:
                continue

    # Valores por defecto
    tx.setdefault("amount", 0.0)
    tx.setdefault("attempts_10min", 1)
    
    return tx

@router.post("/chat")
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    state = SESSIONS.setdefault(session_id, {"history": []})

    msg = req.message.strip()
    state["history"].append({"user": msg})

    lower = msg.lower()

    # Saludos
    greetings = {
        "hola": "Bienvenido al sistema de detección de fraude FraudShield AI. ¿En qué puedo asistirle?",
        "buenos días": "Buenos días. ¿Necesita evaluar alguna transacción?",
        "buenas tardes": "Buenas tardes. Estoy disponible para analizar transacciones sospechosas.",
        "buenas noches": "Buenas noches. ¿Cómo puedo ayudarle?",
        "hi": "Welcome to FraudShield AI. How can I assist you?",
        "hello": "Hello. Ready to analyze transactions for potential fraud.",
    }

    for greeting, response in greetings.items():
        if lower == greeting or (lower.startswith(greeting) and len(lower) <= len(greeting) + 5):
            return {"session_id": session_id, "reply": response}

    # Preguntas sobre funcionamiento
    if any(word in lower for word in ["funciona", "trabajo", "funcionamiento"]) and any(word in lower for word in ["qué", "que", "cómo", "como"]):
        reply = (
            "**SISTEMA DE DETECCIÓN DE FRAUDE**\n\n"
            "El sistema analiza transacciones evaluando dos factores principales:\n\n"
            "1. **Monto de la transacción**: Montos elevados incrementan el nivel de riesgo\n"
            "2. **Intentos recientes**: Múltiples intentos en corto tiempo son señal de alerta\n\n"
            "**Resultados posibles:**\n"
            "• BAJO RIESGO: Transacción puede procesarse\n"
            "• RIESGO MEDIO: Requiere verificación adicional\n"
            "• ALTO RIESGO: Debe bloquearse\n\n"
            "Para analizar una transacción, use el formato:\n"
            "`tx amount=1500 attempts=3`"
        )
        return {"session_id": session_id, "reply": reply}

    # Información del sistema
    if any(word in lower for word in ["información", "informacion", "info", "detalles"]):
        reply = (
            "**FRAUDSHIELD AI - SISTEMA DE DETECCIÓN**\n\n"
            "**Capacidades:**\n"
            "• Análisis automático de riesgo en tiempo real\n"
            "• Evaluación basada en monto y patrones de intento\n"
            "• Recomendaciones de acción específicas\n"
            "• Historial de sesión para seguimiento\n\n"
            "**Objetivo:**\n"
            "Proteger transacciones identificando patrones sospechosos\n"
            "y reduciendo pérdidas por fraude.\n\n"
            "Escriba 'help' para ver los comandos disponibles."
        )
        return {"session_id": session_id, "reply": reply}

    # Respuestas generales
    if any(word in lower for word in ["como estás", "cómo estás", "qué tal"]):
        return {"session_id": session_id, "reply": "Sistema operativo. Disponible para analizar transacciones."}

    if any(word in lower for word in ["gracias", "thanks"]):
        return {"session_id": session_id, "reply": "A su servicio. ¿Necesita analizar otra transacción?"}

    if any(word in lower for word in ["adiós", "adios", "bye", "hasta luego"]):
        return {"session_id": session_id, "reply": "Sesión finalizada. Que tenga un buen día."}

    # Menú de ayuda
    if lower in {"help", "ayuda", "menu", "menú"}:
        reply = (
            "**COMANDOS DISPONIBLES**\n\n"
            "**Analizar transacción:**\n"
            "`tx amount=1500 attempts=3`\n\n"
            "Parámetros:\n"
            "• amount: Monto de la transacción\n"
            "• attempts: Intentos en los últimos 10 minutos\n\n"
            "**Otros comandos:**\n"
            "• `estado` - Ver historial de sesión\n"
            "• `reset` - Reiniciar sesión"
        )
        return {"session_id": session_id, "reply": reply}

    # Reset de sesión
    if lower == "reset":
        SESSIONS[session_id] = {"history": []}
        return {"session_id": session_id, "reply": "Sesión reiniciada correctamente."}

    # Ver estado
    if lower == "estado":
        history_str = "\n".join([f"- {h.get('user', '')}" for h in state["history"][-5:]])
        return {"session_id": session_id, "reply": f"**Últimos 5 mensajes:**\n{history_str}"}

    # Analizar transacción
    tx = try_extract_tx_from_text(msg)
    if tx:
        result = compute_risk(tx)
        reply = (
            f"**ANÁLISIS DE TRANSACCIÓN**\n\n"
            f"Score de Riesgo: {result['risk_score']}/100\n"
            f"Decisión: **{result['decision']}**\n"
            f"Recomendación: {result['advice']}"
        )
        return {"session_id": session_id, "tx": tx, "result": result, "reply": reply}

    # Consultas sobre fraude
    if any(word in lower for word in ["fraude", "fraud", "sospechosa", "riesgo", "seguridad"]):
        reply = (
            "Para evaluar el riesgo de fraude, proporcione los datos en este formato:\n\n"
            "`tx amount=950 attempts=3`\n\n"
            "Escriba 'help' para ver todos los comandos disponibles."
        )
        return {"session_id": session_id, "reply": reply}

    # Mensaje por defecto
    reply = (
        "Comando no reconocido.\n\n"
        "Para analizar transacciones use:\n"
        "`tx amount=1500 attempts=3`\n\n"
        "Escriba 'help' para ver todos los comandos."
    )
    return {"session_id": session_id, "reply": reply}
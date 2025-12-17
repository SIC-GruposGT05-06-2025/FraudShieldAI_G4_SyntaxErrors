"use client"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { sendChatMessage } from "@/lib/api"
import type { ChatResponse } from "@/lib/types"

interface Message {
  type: "user" | "bot"
  content: string
  timestamp: Date
  transaction?: any
  result?: {
    risk_score: number
    decision: string
    advice: string
  }
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ])

    try {
      const response: ChatResponse = await sendChatMessage(userMessage, sessionId)

      if (!sessionId) {
        setSessionId(response.session_id)
      }

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: response.reply,
          timestamp: new Date(),
          transaction: response.tx,
          result: response.result,
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Error al comunicarse con el chatbot. Intenta nuevamente.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600"
    if (score >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "BLOQUEAR":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "REVISAR":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "APROBAR":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Bienvenido al Chatbot</h2>
              <p className="text-gray-600 text-sm mb-4">
                Puedo ayudarte a evaluar el riesgo de fraude de transacciones. Escribe 'help' para comenzar.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs ${
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-lg rounded-tr-none"
                      : "bg-white border border-gray-200 rounded-lg rounded-tl-none"
                  } p-4 shadow-sm`}
                >
                  <p className={message.type === "user" ? "text-white text-sm" : "text-gray-900 text-sm"}>
                    {message.content}
                  </p>

                  {/* Transaction Result */}
                  {message.result && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        {getDecisionIcon(message.result.decision)}
                        <span className="font-semibold text-gray-900">{message.result.decision}</span>
                      </div>
                      <div className={`text-lg font-bold ${getRiskColor(message.result.risk_score)}`}>
                        Score: {message.result.risk_score}/100
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{message.result.advice}</p>
                    </div>
                  )}

                  {/* Transaction Data */}
                  {message.transaction && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-700">
                      <p>
                        <strong>Monto:</strong> ${message.transaction.amount?.toFixed(2) || "N/A"}
                      </p>
                      <p>
                        <strong>Intentos (10min):</strong> {message.transaction.attempts_10min || 1}
                      </p>
                      <p>
                        <strong>Nuevo dispositivo:</strong> {message.transaction.is_new_device ? "Sí" : "No"}
                      </p>
                      <p>
                        <strong>Hora:</strong> {message.transaction.hour}:00
                      </p>
                      <p>
                        <strong>Canal:</strong> {message.transaction.channel || "web"}
                      </p>
                      <p>
                        <strong>País:</strong> {message.transaction.country || "GT"}
                      </p>
                    </div>
                  )}

                  <span className={`text-xs mt-2 block ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-3 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          <p>💡 Ej: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">tx amount=3500 attempts=7 new_device=yes</code></p>
        </div>
      </div>
    </div>
  )
}

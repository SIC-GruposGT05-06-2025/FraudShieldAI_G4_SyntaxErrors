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

    setMessages((prev) => [
      ...prev,
      { type: "user", content: userMessage, timestamp: new Date() },
    ])

    try {
      const response: ChatResponse = await sendChatMessage(userMessage, sessionId)

      if (!sessionId) setSessionId(response.session_id)

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
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Error al comunicarse con el sistema. Intenta nuevamente.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400"
    if (score >= 40) return "text-amber-400"
    return "text-emerald-400"
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 70) return "bg-red-500/10 border-red-500/20"
    if (score >= 40) return "bg-amber-500/10 border-amber-500/20"
    return "bg-emerald-500/10 border-emerald-500/20"
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "BLOQUEAR":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "REVISAR":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case "APROBAR":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#050b08]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-emerald-100">Sistema de Detección</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Analiza transacciones y evalúa riesgos de fraude en tiempo real.
              </p>
              <div className="mt-4 px-4 py-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg inline-block">
                <code className="text-xs text-emerald-300">Escribe 'help' para comenzar</code>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-md p-4 transition-all ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white rounded-2xl rounded-tr-md shadow-lg shadow-emerald-900/30"
                      : "bg-[#0b1410] border border-emerald-900/40 text-gray-100 rounded-2xl rounded-tl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

                  {message.result && (
                    <div className={`mt-3 p-3 rounded-lg border ${getRiskBgColor(message.result.risk_score)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getDecisionIcon(message.result.decision)}
                        <span className="font-semibold text-sm">{message.result.decision}</span>
                      </div>
                      <div className={`text-2xl font-bold ${getRiskColor(message.result.risk_score)}`}>
                        {message.result.risk_score}
                        <span className="text-sm text-gray-400">/100</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{message.result.advice}</p>
                    </div>
                  )}

                  {message.transaction && (
                    <div className="mt-3 space-y-1.5 text-xs bg-black/40 p-3 rounded-lg border border-emerald-900/30">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monto</span>
                        <span className="font-semibold text-gray-200">${message.transaction.amount?.toFixed(2) || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Intentos (10min)</span>
                        <span className="font-semibold text-gray-200">{message.transaction.attempts_10min || 1}</span>
                      </div>
                    </div>
                  )}

                  <span className={`text-xs mt-2 block ${message.type === "user" ? "text-emerald-200" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-[#0b1410] border border-emerald-900/40 rounded-2xl rounded-tl-md p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-emerald-900/40 bg-[#050b08]/95 backdrop-blur-sm p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 text-sm bg-[#0b1410] border-emerald-900/40 text-gray-100 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 hover:from-emerald-500 hover:to-green-700 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}

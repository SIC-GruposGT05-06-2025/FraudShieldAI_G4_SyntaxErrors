"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChatInterface } from "@/components/chatbot/chat-interface"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-700 to-green-800 rounded-full blur-xl opacity-40 animate-pulse-glow" />

          {/* Button */}
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full
              bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800
              hover:from-emerald-500 hover:via-emerald-600 hover:to-green-700
              text-white shadow-2xl shadow-emerald-900/40
              transition-all duration-300 hover:scale-110 active:scale-95"
            title="Abrir chatbot"
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
          </Button>
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full md:w-[500px] p-0 flex flex-col h-full gap-0
            bg-[#050b08] border-l border-emerald-900/40"
        >
          <SheetHeader className="px-4 py-4 border-b border-emerald-900/40 shrink-0 bg-[#050b08]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-emerald-100 text-base">FraudShield AI</SheetTitle>
                  <p className="text-xs text-emerald-400/80 font-normal mt-0.5">
                    Sistema de detección
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.55; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

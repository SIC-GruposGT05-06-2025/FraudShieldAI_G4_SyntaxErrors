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
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all z-40 w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white animate-pulse-slow"
        title="Abrir chatbot"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
      </Button>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full md:w-[500px] p-0 flex flex-col h-full gap-0">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <SheetTitle>Fraud Chatbot</SheetTitle>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-normal mt-1">
              Escribe 'help' para comandos
            </p>
          </SheetHeader>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ChatInterface />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

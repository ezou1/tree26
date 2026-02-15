"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  Send,
  Bot,
} from "lucide-react"
import type { ChatMessage, ChatAction } from "@/lib/types"

interface ResearchPanelProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  onActionClick: (action: ChatAction) => void
  isInputEnabled: boolean
  inputPlaceholder?: string
}

export function ResearchPanel({
  messages,
  onSendMessage,
  onActionClick,
  isInputEnabled,
  inputPlaceholder = "Ask a question...",
}: ResearchPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-focus input when enabled
  useEffect(() => {
    if (isInputEnabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isInputEnabled])

  const handleSubmit = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || !isInputEnabled) return
    onSendMessage(trimmed)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Research Assistant
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : msg.role === "system"
                      ? "border border-primary/20 bg-primary/5 text-muted-foreground"
                      : "border border-border bg-card text-foreground"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1.5">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">
                      Assistant
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-xs leading-relaxed">
                  {msg.content}
                </p>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {msg.actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => onActionClick(action)}
                        className={`rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                          action.variant === "primary"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : action.variant === "secondary"
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              : "border border-border bg-card text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="group relative rounded-lg border border-border bg-secondary/50 transition-colors focus-within:border-primary/50">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            disabled={!isInputEnabled}
            rows={2}
            className="w-full resize-none bg-transparent p-3 pb-8 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="absolute bottom-2 right-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || !isInputEnabled}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
              aria-label="Send message"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

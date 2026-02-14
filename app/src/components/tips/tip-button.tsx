"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { sendTip, TIP_AMOUNTS } from "@/lib/data/tips"

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

interface TipButtonProps {
  creatorId: string
  creatorName: string
  mashupId?: string
  className?: string
}

export function TipButton({
  creatorId,
  creatorName,
  mashupId,
  className,
}: TipButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const amountCents =
    customAmount && Number(customAmount) >= 1
      ? Math.round(Number(customAmount) * 100)
      : selectedAmount

  async function handleSend() {
    if (amountCents < 100) return
    setSending(true)
    try {
      await sendTip({
        creatorId,
        mashupId,
        amountCents,
        message: message || undefined,
        isPublic: true,
      })
      setSent(true)
      setTimeout(() => {
        setOpen(false)
        setSent(false)
        setMessage("")
        setCustomAmount("")
        setSelectedAmount(500)
      }, 1500)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5 rounded-full", className)}
        >
          <Heart className="h-3.5 w-3.5 text-pink-500" />
          Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a tip to {creatorName}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <p className="text-2xl">🎉</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              Tip sent!
            </p>
            <p className="text-sm text-muted-foreground">
              {formatMoney(amountCents)} sent to {creatorName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Select amount
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount("")
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      selectedAmount === amount && !customAmount
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted",
                    )}
                  >
                    {formatMoney(amount)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Custom amount (min $1.00)
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Message (optional)
              </p>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                rows={2}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || amountCents < 100}
              className="w-full rounded-full"
            >
              {sending
                ? "Sending..."
                : `Send ${formatMoney(amountCents)} Tip`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

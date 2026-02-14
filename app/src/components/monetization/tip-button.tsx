"use client"

import { useState } from "react"
import { Heart, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  sendTip,
  TIP_PRESETS,
  TIP_MESSAGES,
  MIN_TIP_AMOUNT,
  MAX_TIP_AMOUNT,
  formatTipAmount,
  type Tip,
} from "@/lib/data/tipping"

interface TipButtonProps {
  recipientId: string
  recipientName: string
  recipientAvatar?: string
  variant?: "default" | "outline" | "ghost" | "compact"
  size?: "default" | "sm" | "lg"
  className?: string
  showLabel?: boolean
  onTipSent?: (tip: Tip) => void
}

export function TipButton({
  recipientId,
  recipientName,
  recipientAvatar,
  variant = "outline",
  size = "default",
  className,
  showLabel = true,
  onTipSent,
}: TipButtonProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(100)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePresetSelect = (presetAmount: number) => {
    setAmount(presetAmount)
    setCustomAmount("")
  }

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value)
    const num = parseFloat(value) * 100 // Convert to cents
    if (!isNaN(num)) {
      setAmount(num)
    }
  }

  const handleSendTip = async () => {
    setIsSending(true)
    setError(null)

    const result = await sendTip("current_user", recipientId, amount, {
      message,
      isAnonymous,
      isPublic,
      paymentMethod: "card",
    })

    setIsSending(false)

    if (result.success && result.tip) {
      setSuccess(true)
      onTipSent?.(result.tip)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setMessage("")
        setAmount(100)
        setCustomAmount("")
      }, 2000)
    } else {
      setError(result.error || "Failed to send tip")
    }
  }

  const platformFee = Math.round(amount * 0.05)
  const recipientGets = amount - platformFee

  const isValidAmount = amount >= MIN_TIP_AMOUNT && amount <= MAX_TIP_AMOUNT

  // Compact variant - just a heart button
  if (variant === "compact") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 text-muted-foreground hover:text-pink-500", className)}
          >
            <Heart className="h-4 w-4" />
            {showLabel && <span className="text-xs">Tip</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <TipDialogContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          <Heart className="h-4 w-4 text-pink-500" />
          {showLabel && <span>Support</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <TipDialogContent />
      </DialogContent>
    </Dialog>
  )

  function TipDialogContent() {
    if (success) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-green-500 fill-current" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Tip Sent!</h3>
          <p className="text-muted-foreground">
            {recipientName} received {formatTipAmount(recipientGets)}
          </p>
        </div>
      )
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            Support {recipientName}
          </DialogTitle>
          <DialogDescription>
            Send a tip to show your appreciation for their work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipient */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Avatar>
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{recipientName}</p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>

          {/* Amount Presets */}
          <div className="space-y-2">
            <Label>Choose Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIP_PRESETS.map((preset) => (
                <button
                  key={preset.amount}
                  onClick={() => handlePresetSelect(preset.amount)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    amount === preset.amount && !customAmount
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl mb-1">{preset.emoji}</div>
                  <div className="font-semibold">{formatTipAmount(preset.amount)}</div>
                  <div className="text-xs text-muted-foreground">{preset.label}</div>
                  {preset.isPopular && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Popular
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter custom amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="custom-amount"
                type="number"
                min={MIN_TIP_AMOUNT / 100}
                max={MAX_TIP_AMOUNT / 100}
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a nice message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              className="min-h-[80px]"
            />
            <div className="flex flex-wrap gap-2">
              {TIP_MESSAGES.slice(0, 4).map((msg) => (
                <button
                  key={msg}
                  onClick={() => setMessage(msg)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous" className="text-sm">Send anonymously</Label>
                <p className="text-xs text-muted-foreground">Your name won&apos;t be shown</p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public" className="text-sm">Show on profile</Label>
                <p className="text-xs text-muted-foreground">Display this tip publicly</p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tip amount</span>
              <span>{formatTipAmount(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform fee (5%)</span>
              <span>-{formatTipAmount(platformFee)}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>{recipientName} receives</span>
              <span className="text-green-600">{formatTipAmount(recipientGets)}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            disabled={!isValidAmount || isSending}
            onClick={handleSendTip}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2 fill-current" />
                Send {formatTipAmount(amount)} Tip
              </>
            )}
          </Button>
        </div>
      </>
    )
  }
}

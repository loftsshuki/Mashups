"use client"

import { useState } from "react"
import { Wallet, Plus, Trash2, Check, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createRevenueSplit,
  splitTemplates,
  updateRecipientWallet,
  formatWalletAddress,
  getChainName,
  type RevenueSplit,
  type RevenueRecipient,
} from "@/lib/data/revenue-splits"

interface SplitManagerProps {
  mashupId: string
  mashupTitle: string
  existingSplit?: RevenueSplit
  className?: string
}

export function SplitManager({
  mashupId,
  mashupTitle,
  existingSplit,
  className,
}: SplitManagerProps) {
  const [split, setSplit] = useState<RevenueSplit | undefined>(existingSplit)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [recipients, setRecipients] = useState<
    Array<{ userId: string; displayName: string; percentage: number; role: RevenueRecipient["role"] }>
  >([
    { userId: "current_user", displayName: "You", percentage: 85, role: "creator" },
  ])

  const handleCreateSplit = async () => {
    setIsCreating(true)
    
    const result = await createRevenueSplit(
      mashupId,
      mashupTitle,
      recipients.map(r => ({
        userId: r.userId,
        displayName: r.displayName,
        walletAddress: "",
        percentage: r.percentage,
        role: r.role,
      })),
      { frequency: "monthly" }
    )
    
    if (result.success) {
      setSplit(result.split)
      setShowCreateDialog(false)
    }
    
    setIsCreating(false)
  }

  const addRecipient = () => {
    setRecipients([...recipients, { userId: "", displayName: "", percentage: 0, role: "collaborator" }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, updates: Partial<typeof recipients[0]>) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], ...updates }
    setRecipients(updated)
  }

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0)
  const isValid = totalPercentage === 100

  if (split) {
    return <SplitDetails split={split} className={className} />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Revenue Split
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">No Revenue Split Set Up</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a smart contract to automatically distribute earnings
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create Revenue Split</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Revenue Split</DialogTitle>
                <DialogDescription>
                  Set up automatic revenue distribution for &quot;{mashupTitle}&quot;
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Templates */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Templates</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(splitTemplates).map(([key, template]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => {
                          setRecipients(
                            template.recipients.map((r, i) => ({
                              userId: i === 0 ? "current_user" : `user_${i}`,
                              displayName: i === 0 ? "You" : `Collaborator ${i}`,
                              percentage: r.percentage,
                              role: r.role as RevenueRecipient["role"],
                            }))
                          )
                        }}
                      >
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Recipients</label>
                    <Badge variant={isValid ? "default" : "destructive"}>
                      {totalPercentage}% / 100%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Name"
                          value={recipient.displayName}
                          onChange={(e) => updateRecipient(index, { displayName: e.target.value })}
                          className="flex-1"
                        />
                        <Select
                          value={recipient.role}
                          onValueChange={(v) => updateRecipient(index, { role: v as RevenueRecipient["role"] })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="collaborator">Collaborator</SelectItem>
                            <SelectItem value="sample_owner">Sample Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="relative w-24">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={recipient.percentage}
                            onChange={(e) => updateRecipient(index, { percentage: parseInt(e.target.value) || 0 })}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                        {recipients.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRecipient(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={addRecipient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>
                </div>

                {!isValid && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Total percentage must equal 100%
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!isValid || isCreating}
                  onClick={handleCreateSplit}
                >
                  {isCreating ? "Deploying Contract..." : "Deploy Smart Contract"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

function SplitDetails({ split, className }: { split: RevenueSplit; className?: string }) {
  const [editingWallet, setEditingWallet] = useState<string | null>(null)
  const [walletInput, setWalletInput] = useState("")

  const handleUpdateWallet = async (recipientId: string) => {
    if (!walletInput) return
    
    await updateRecipientWallet(split.id, recipientId, walletInput)
    setEditingWallet(null)
    setWalletInput("")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Revenue Split
          </span>
          <Badge variant={split.status === "active" ? "default" : "secondary"}>
            {split.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Info */}
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://polygonscan.com/address/${split.contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              {formatWalletAddress(split.contractAddress || "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <span>{getChainName(split.chainId)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-medium">{split.totalRevenue.toFixed(2)} {split.currency}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Distributed</span>
            <span className="font-medium">{split.totalDistributed.toFixed(2)} {split.currency}</span>
          </div>
        </div>

        {/* Recipients */}
        <div>
          <h4 className="font-medium mb-3">Recipients ({split.recipients.length})</h4>
          <div className="space-y-3">
            {split.recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    recipient.verified ? "bg-green-500/10" : "bg-muted"
                  )}>
                    {recipient.verified ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{recipient.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {recipient.role} • {recipient.percentage}%
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {editingWallet === recipient.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="0x..."
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateWallet(recipient.id)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {recipient.walletAddress ? (
                        <p className="text-sm font-mono">
                          {formatWalletAddress(recipient.walletAddress)}
                        </p>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingWallet(recipient.id)}
                        >
                          Add Wallet
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {recipient.totalReceived.toFixed(2)} {split.currency} earned
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

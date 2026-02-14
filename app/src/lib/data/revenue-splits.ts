// Smart Contract Revenue Splits
// Blockchain-based auto-distribution system with wallet abstraction

export type SplitStatus = "pending" | "active" | "paused" | "completed"
export type PayoutFrequency = "instant" | "daily" | "weekly" | "monthly"
export type PayoutStatus = "pending" | "processing" | "completed" | "failed"

export interface RevenueRecipient {
  id: string
  userId: string
  displayName: string
  walletAddress: string // Abstracted - can be email-based custodial wallet
  percentage: number // 0-100
  role: "creator" | "collaborator" | "sample_owner" | "platform"
  verified: boolean
  totalReceived: number
  lastPayout?: string
}

export interface RevenueSplit {
  id: string
  mashupId: string
  mashupTitle: string
  status: SplitStatus
  createdAt: string
  activatedAt?: string
  
  // Recipients
  recipients: RevenueRecipient[]
  totalRecipients: number
  
  // Financials
  totalRevenue: number
  currency: string
  platformFee: number // percentage (e.g., 15)
  
  // Payout settings
  payoutFrequency: PayoutFrequency
  minimumPayout: number // minimum to trigger payout
  
  // Contract
  contractAddress?: string // on-chain contract
  transactionHash?: string // deployment tx
  chainId: number // e.g., 1 for Ethereum, 137 for Polygon
  
  // Totals
  totalDistributed: number
  totalPending: number
  lastDistribution?: string
  
  // Audit
  auditLog: SplitAuditEntry[]
}

export interface SplitAuditEntry {
  timestamp: string
  action: "created" | "updated" | "payout" | "recipient_added" | "recipient_removed"
  actor: string
  details: string
  transactionHash?: string
}

export interface PayoutTransaction {
  id: string
  splitId: string
  recipientId: string
  amount: number
  currency: string
  status: PayoutStatus
  transactionHash?: string
  processedAt?: string
  failureReason?: string
}

// Mock blockchain transactions
export interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  timestamp: string
  status: "confirmed" | "pending" | "failed"
}

// Default platform fee (15%)
const PLATFORM_FEE_PERCENT = 15

// Mock split templates
export const splitTemplates = {
  solo: {
    name: "Solo Creator",
    description: "100% to creator (minus platform fee)",
    recipients: [
      { role: "creator", percentage: 85 },
      { role: "platform", percentage: 15 },
    ],
  },
  equal_collab: {
    name: "Equal Collaboration",
    description: "50/50 split between two creators",
    recipients: [
      { role: "creator", percentage: 42.5 },
      { role: "collaborator", percentage: 42.5 },
      { role: "platform", percentage: 15 },
    ],
  },
  featuring: {
    name: "Featuring",
    description: "Main creator 70%, featured 15%",
    recipients: [
      { role: "creator", percentage: 70 },
      { role: "collaborator", percentage: 15 },
      { role: "platform", percentage: 15 },
    ],
  },
  sample_clearance: {
    name: "Sample Clearance",
    description: "Includes sample owner royalty",
    recipients: [
      { role: "creator", percentage: 65 },
      { role: "sample_owner", percentage: 20 },
      { role: "platform", percentage: 15 },
    ],
  },
}

// Create a new revenue split
export async function createRevenueSplit(
  mashupId: string,
  mashupTitle: string,
  recipients: Omit<RevenueRecipient, "id" | "verified" | "totalReceived">[],
  options: {
    frequency?: PayoutFrequency
    minimumPayout?: number
    chainId?: number
  } = {}
): Promise<{ split: RevenueSplit; success: boolean; error?: string }> {
  // Validate percentages sum to 100
  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0)
  if (totalPercentage !== 100) {
    return {
      split: null as unknown as RevenueSplit,
      success: false,
      error: `Percentages must sum to 100%, got ${totalPercentage}%`,
    }
  }

  // Check if platform fee is included
  const hasPlatformFee = recipients.some(r => r.role === "platform")
  if (!hasPlatformFee) {
    // Auto-add platform fee
    recipients.push({
      userId: "platform",
      displayName: "Mashups Platform",
      walletAddress: "0xplatform",
      percentage: PLATFORM_FEE_PERCENT,
      role: "platform",
    })
  }

  const split: RevenueSplit = {
    id: `split_${Date.now()}`,
    mashupId,
    mashupTitle,
    status: "pending",
    createdAt: new Date().toISOString(),
    recipients: recipients.map((r, i) => ({
      ...r,
      id: `recipient_${i}`,
      verified: false,
      totalReceived: 0,
    })),
    totalRecipients: recipients.length,
    totalRevenue: 0,
    currency: "USDC",
    platformFee: PLATFORM_FEE_PERCENT,
    payoutFrequency: options.frequency || "monthly",
    minimumPayout: options.minimumPayout || 10,
    chainId: options.chainId || 137, // Default to Polygon
    totalDistributed: 0,
    totalPending: 0,
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        action: "created",
        actor: "creator",
        details: `Revenue split created for "${mashupTitle}"`,
      },
    ],
  }

  // Simulate blockchain deployment
  await simulateDeployment(split)

  return { split, success: true }
}

async function simulateDeployment(split: RevenueSplit): Promise<void> {
  // Mock blockchain deployment delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  split.contractAddress = `0x${Math.random().toString(16).slice(2, 42)}`
  split.transactionHash = `0x${Math.random().toString(16).slice(2, 66)}`
  split.status = "active"
  split.activatedAt = new Date().toISOString()
  
  split.auditLog.push({
    timestamp: new Date().toISOString(),
    action: "created",
    actor: "system",
    details: `Smart contract deployed at ${split.contractAddress}`,
    transactionHash: split.transactionHash,
  })
}

// Distribute revenue
export async function distributeRevenue(
  splitId: string,
  amount: number
): Promise<{ success: boolean; transactions: PayoutTransaction[]; error?: string }> {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const split = await getSplitById(splitId)
  if (!split) {
    return { success: false, transactions: [], error: "Split not found" }
  }

  if (split.status !== "active") {
    return { success: false, transactions: [], error: "Split is not active" }
  }

  const transactions: PayoutTransaction[] = []
  const timestamp = new Date().toISOString()

  // Calculate payouts
  split.recipients.forEach(recipient => {
    const payoutAmount = (amount * recipient.percentage) / 100
    
    if (payoutAmount >= split.minimumPayout) {
      const tx: PayoutTransaction = {
        id: `tx_${Date.now()}_${recipient.id}`,
        splitId,
        recipientId: recipient.id,
        amount: payoutAmount,
        currency: split.currency,
        status: "completed",
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        processedAt: timestamp,
      }
      transactions.push(tx)
      
      // Update recipient totals
      recipient.totalReceived += payoutAmount
      recipient.lastPayout = timestamp
    }
  })

  // Update split totals
  split.totalRevenue += amount
  split.totalDistributed += transactions.reduce((sum, tx) => sum + tx.amount, 0)
  split.lastDistribution = timestamp
  
  split.auditLog.push({
    timestamp,
    action: "payout",
    actor: "system",
    details: `Distributed ${amount} USDC to ${transactions.length} recipients`,
  })

  return { success: true, transactions }
}

// Get split by ID (mock)
export async function getSplitById(id: string): Promise<RevenueSplit | null> {
  // Mock data
  return mockSplits.find(s => s.id === id) || null
}

// Get splits by mashup
export async function getSplitsByMashup(mashupId: string): Promise<RevenueSplit[]> {
  return mockSplits.filter(s => s.mashupId === mashupId)
}

// Get splits by user
export async function getSplitsByUser(userId: string): Promise<RevenueSplit[]> {
  return mockSplits.filter(s => 
    s.recipients.some(r => r.userId === userId)
  )
}

// Update recipient wallet
export async function updateRecipientWallet(
  splitId: string,
  recipientId: string,
  walletAddress: string
): Promise<boolean> {
  const split = await getSplitById(splitId)
  if (!split) return false
  
  const recipient = split.recipients.find(r => r.id === recipientId)
  if (!recipient) return false
  
  recipient.walletAddress = walletAddress
  recipient.verified = true
  
  split.auditLog.push({
    timestamp: new Date().toISOString(),
    action: "updated",
    actor: recipient.userId,
    details: `Wallet address updated for ${recipient.displayName}`,
  })
  
  return true
}

// Get earnings summary for user
export async function getEarningsSummary(userId: string): Promise<{
  totalEarned: number
  totalPending: number
  totalSplits: number
  recentTransactions: PayoutTransaction[]
}> {
  const userSplits = await getSplitsByUser(userId)
  
  let totalEarned = 0
  let totalPending = 0
  
  userSplits.forEach(split => {
    const recipient = split.recipients.find(r => r.userId === userId)
    if (recipient) {
      totalEarned += recipient.totalReceived
      // Calculate pending based on unpaid revenue
      const unpaidRevenue = split.totalRevenue - split.totalDistributed
      totalPending += (unpaidRevenue * recipient.percentage) / 100
    }
  })
  
  return {
    totalEarned,
    totalPending,
    totalSplits: userSplits.length,
    recentTransactions: [], // Would fetch from blockchain
  }
}

// Mock data for demonstration
const mockSplits: RevenueSplit[] = [
  {
    id: "split_001",
    mashupId: "mashup_001",
    mashupTitle: "Neon Nights Remix",
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    activatedAt: "2026-01-15T10:02:00Z",
    recipients: [
      {
        id: "rec_001",
        userId: "user_001",
        displayName: "DJ Neon",
        walletAddress: "0x1234567890abcdef",
        percentage: 70,
        role: "creator",
        verified: true,
        totalReceived: 350.50,
        lastPayout: "2026-02-01T00:00:00Z",
      },
      {
        id: "rec_002",
        userId: "user_002",
        displayName: "Sample King",
        walletAddress: "0xfedcba0987654321",
        percentage: 15,
        role: "sample_owner",
        verified: true,
        totalReceived: 75.10,
        lastPayout: "2026-02-01T00:00:00Z",
      },
      {
        id: "rec_003",
        userId: "platform",
        displayName: "Mashups Platform",
        walletAddress: "0xplatform",
        percentage: 15,
        role: "platform",
        verified: true,
        totalReceived: 75.10,
      },
    ],
    totalRecipients: 3,
    totalRevenue: 500.70,
    currency: "USDC",
    platformFee: 15,
    payoutFrequency: "monthly",
    minimumPayout: 10,
    contractAddress: "0xabc123def456",
    chainId: 137,
    totalDistributed: 500.70,
    totalPending: 0,
    lastDistribution: "2026-02-01T00:00:00Z",
    auditLog: [],
  },
]

// Wallet abstraction utilities
export function isValidWalletAddress(address: string): boolean {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base",
  }
  return chains[chainId] || "Unknown Chain"
}

export function getChainCurrency(chainId: number): string {
  const currencies: Record<number, string> = {
    1: "ETH",
    137: "MATIC",
    42161: "ETH",
    10: "ETH",
    8453: "ETH",
  }
  return currencies[chainId] || "ETH"
}

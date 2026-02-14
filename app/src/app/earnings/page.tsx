"use client"

import { useState, useEffect } from "react"
import {
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  getTipStats,
  getUserTips,
  formatTipAmount,
  type Tip,
  type TipStats,
} from "@/lib/data/tipping"

export default function EarningsPage() {
  const [tipStats, setTipStats] = useState<TipStats | null>(null)
  const [recentTips, setRecentTips] = useState<Tip[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const stats = await getTipStats("user_001")
    const tips = await getUserTips("user_001", "received", 10)
    setTipStats(stats)
    setRecentTips(tips)
  }

  const totalEarnings = (tipStats?.totalAmountReceived ?? 0) + 284000 // Mock other revenue
  const monthlyGoal = 50000 // $500 goal
  const progressToGoal = Math.min((totalEarnings / monthlyGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-500" />
                Earnings Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your revenue from tips, subscriptions, and splits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Wallet className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Earnings"
            value={formatTipAmount(totalEarnings)}
            change="+12%"
            trend="up"
            icon={DollarSign}
          />
          <StatCard
            title="Monthly Recurring"
            value={formatTipAmount(284000)}
            change="+5%"
            trend="up"
            icon={TrendingUp}
          />
          <StatCard
            title="Subscribers"
            value="346"
            change="+23"
            trend="up"
            icon={Users}
          />
          <StatCard
            title="Tips Received"
            value={tipStats?.totalTipsReceived.toString() ?? "0"}
            change="+8"
            trend="up"
            icon={Heart}
          />
        </div>

        {/* Monthly Goal */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">Monthly Goal</h3>
                <p className="text-sm text-muted-foreground">
                  {formatTipAmount(totalEarnings)} of {formatTipAmount(monthlyGoal)} earned
                </p>
              </div>
              <Badge variant={progressToGoal >= 100 ? "default" : "secondary"}>
                {progressToGoal >= 100 ? "Goal reached!" : `${Math.round(progressToGoal)}%`}
              </Badge>
            </div>
            <Progress value={progressToGoal} className="h-3" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tips">
              <Heart className="h-4 w-4 mr-2" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <Users className="h-4 w-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="splits">
              <Wallet className="h-4 w-4 mr-2" />
              Revenue Splits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Recent Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTips.slice(0, 5).map((tip) => (
                      <TipRow key={tip.id} tip={tip} />
                    ))}
                    {recentTips.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No tips received yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Supporters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Top Supporters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tipStats?.topSupporters.map((supporter, index) => (
                      <SupporterRow
                        key={supporter.userId}
                        supporter={supporter}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <CardTitle>Tip History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTips.map((tip) => (
                    <TipRow key={tip.id} tip={tip} showDate />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end gap-2">
                    {[40, 55, 45, 80, 65, 90, 85, 100, 120, 140, 160, 180].map((value, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                        style={{ height: `${(value / 200) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tier Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TierBreakdownRow
                    tier="Basic"
                    count={245}
                    revenue={735}
                    color="bg-blue-500"
                  />
                  <TierBreakdownRow
                    tier="Premium"
                    count={89}
                    revenue={890}
                    color="bg-purple-500"
                  />
                  <TierBreakdownRow
                    tier="VIP"
                    count={12}
                    revenue={300}
                    color="bg-yellow-500"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="splits">
            <Card>
              <CardHeader>
                <CardTitle>Active Revenue Splits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RevenueSplitRow
                    title="Neon Nights Remix"
                    status="active"
                    revenue={500.70}
                    recipients={3}
                    yourShare={70}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-sm">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface TipRowProps {
  tip: Tip
  showDate?: boolean
}

function TipRow({ tip, showDate }: TipRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={tip.senderAvatar} />
          <AvatarFallback>{tip.senderName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {tip.isAnonymous ? "Anonymous" : tip.senderName}
            {tip.isAnonymous && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Private
              </Badge>
            )}
          </p>
          {tip.message && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              &ldquo;{tip.message}&rdquo;
            </p>
          )}
          {showDate && (
            <p className="text-xs text-muted-foreground">
              {new Date(tip.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600">
          +{formatTipAmount(tip.amount)}
        </p>
        {tip.status === "completed" && (
          <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
        )}
      </div>
    </div>
  )
}

interface SupporterRowProps {
  supporter: {
    userId: string
    displayName: string
    avatarUrl: string
    totalTipped: number
    tipCount: number
    streakMonths: number
    badge?: string
  }
  rank: number
}

function SupporterRow({ supporter, rank }: SupporterRowProps) {
  const rankColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-gray-400",
    3: "text-amber-600",
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={cn("font-bold text-lg w-6", rankColors[rank] || "text-muted-foreground")}>
        #{rank}
      </div>
      <Avatar className="h-10 w-10">
        <AvatarImage src={supporter.avatarUrl} />
        <AvatarFallback>{supporter.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium">{supporter.displayName}</p>
        <p className="text-xs text-muted-foreground">
          {supporter.tipCount} tips • {supporter.streakMonths} month streak
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatTipAmount(supporter.totalTipped)}</p>
        {supporter.badge && (
          <Badge variant="secondary" className="text-xs">
            {supporter.badge}
          </Badge>
        )}
      </div>
    </div>
  )
}

interface TierBreakdownRowProps {
  tier: string
  count: number
  revenue: number
  color: string
}

function TierBreakdownRow({ tier, count, revenue, color }: TierBreakdownRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className={cn("w-3 h-3 rounded-full", color)} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{tier}</span>
          <span className="text-sm text-muted-foreground">{count} subscribers</span>
        </div>
        <p className="text-sm font-semibold">${revenue}/month</p>
      </div>
    </div>
  )
}

interface RevenueSplitRowProps {
  title: string
  status: string
  revenue: number
  recipients: number
  yourShare: number
}

function RevenueSplitRow({ title, status, revenue, recipients, yourShare }: RevenueSplitRowProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{title}</h4>
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {recipients} recipients • Your share: {yourShare}%
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">${revenue.toFixed(2)}</p>
        <p className="text-sm text-green-600">
          +${(revenue * (yourShare / 100)).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

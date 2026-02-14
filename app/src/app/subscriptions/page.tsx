"use client"

import { useState } from "react"
import { Heart, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TierCard, SubscriptionStatus } from "@/components/subscriptions/tier-card"
import { NeonHero, NeonPage } from "@/components/marketing/neon-page"
import {
  mockSubscriptionPlans,
  mockUserSubscriptions,
  cancelSubscription,
  formatPrice,
  type Subscription,
} from "@/lib/data/subscriptions"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockUserSubscriptions)
  
  const activeSubscriptions = subscriptions.filter(s => s.status === "active")
  const creatorPlans = mockSubscriptionPlans.filter(p => p.creatorId === "user_001")
  
  const handleSubscribe = async (planId: string) => {
    // Would open payment modal
    console.log("Subscribe to:", planId)
  }
  
  const handleCancel = async (subscriptionId: string) => {
    await cancelSubscription(subscriptionId)
    setSubscriptions(subs => 
      subs.map(s => 
        s.id === subscriptionId 
          ? { ...s, cancelAtPeriodEnd: true }
          : s
      )
    )
  }
  
  return (
    <NeonPage>
      <NeonHero
        eyebrow="Support Creators"
        title="Subscriptions"
        description="Subscribe to your favorite creators and unlock exclusive content, early access, and special perks."
      />
      
      <Tabs defaultValue="discover" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-subs">
            My Subscriptions ({activeSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="earnings">Creator Earnings</TabsTrigger>
        </TabsList>
        
        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creatorPlans.map((plan) => (
              <TierCard
                key={plan.id}
                plan={plan}
                isPopular={plan.isPopular}
                currentTier={activeSubscriptions.find(s => s.plan.creatorId === plan.creatorId)?.plan.tier}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
          
          {/* Comparison Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Compare Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      {creatorPlans.map(plan => (
                        <th key={plan.id} className="text-center py-3 px-4 capitalize">
                          {plan.tier}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Price</td>
                      {creatorPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 px-4 font-medium">
                          {formatPrice(plan.price, plan.currency)}/mo
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Exclusive Content</td>
                      {creatorPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {plan.exclusiveContent ? "✅" : "❌"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Early Access</td>
                      {creatorPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {plan.earlyAccess ? "✅" : "❌"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Direct Messaging</td>
                      {creatorPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {plan.directMessaging ? "✅" : "❌"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Discord Access</td>
                      {creatorPlans.map(plan => (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {plan.discordRole || "❌"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Subscriptions Tab */}
        <TabsContent value="my-subs" className="space-y-6">
          {activeSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No Active Subscriptions</h3>
                <p className="text-muted-foreground mt-2">
                  Subscribe to creators to support their work and unlock exclusive content.
                </p>
                <Button className="mt-4">
                  Discover Creators
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeSubscriptions.map(sub => (
                <Card key={sub.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={sub.plan.creatorAvatar}
                          alt={sub.plan.creatorName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{sub.plan.creatorName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="capitalize">{sub.plan.tier}</Badge>
                            <SubscriptionStatus 
                              status={sub.status}
                              nextBilling={sub.nextBillingDate}
                            />
                          </div>
                          {sub.cancelAtPeriodEnd && (
                            <p className="text-sm text-red-500 mt-1">
                              Cancels at end of period
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(sub.plan.price, sub.plan.currency)}/{sub.plan.interval}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total paid: {formatPrice(sub.totalPaid, sub.plan.currency)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          {!sub.cancelAtPeriodEnd && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancel(sub.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Creator Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Recurring Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatPrice(1075, "USD")}
                </p>
                <p className="text-sm text-green-500 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">346</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Across 3 tiers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Revenue Per User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatPrice(3.11, "USD")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Per month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creatorPlans.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.tier === "basic" ? "🌟" : plan.tier === "premium" ? "💎" : "👑"}</span>
                      <div>
                        <p className="font-medium capitalize">{plan.tier}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.subscriberCount} subscribers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(plan.price * plan.subscriberCount, plan.currency)}/mo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((plan.subscriberCount / 346) * 100)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </NeonPage>
  )
}

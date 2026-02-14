"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Users, Clock, Gift, ArrowLeft, Share2, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CountdownTimer } from "@/components/battles/countdown-timer"
import { BattleVoting } from "@/components/battles/battle-voting"
import { NeonPage } from "@/components/marketing/neon-page"
import {
  getBattleById,
  getBattleStatusDisplay,
  canSubmitToBattle,
  canVoteInBattle,
  type Battle,
  type BattleEntry,
} from "@/lib/data/battles"

// Mock entries for demo
const mockEntries: BattleEntry[] = [
  {
    id: "entry-001",
    mashupId: "mashup-001",
    mashup: {
      id: "mashup-001",
      title: "Neon Nights vs Cyber Dreams",
      description: "A synthwave mashup",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
      audioUrl: "",
      creator: {
        username: "djneon",
        displayName: "DJ Neon",
        avatarUrl: "",
      },
      duration: 180,
      bpm: 128,
      genre: "Synthwave",
      playCount: 5000,
      likeCount: 420,
      createdAt: "2026-02-05",
    },
    creatorId: "user-001",
    submittedAt: "2026-02-05T10:00:00Z",
    votes: 245,
    rank: 1,
    isWinner: true,
  },
  {
    id: "entry-002",
    mashupId: "mashup-002",
    mashup: {
      id: "mashup-002",
      title: "Midnight City Drive",
      description: "Dark synth mashup",
      coverUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400",
      audioUrl: "",
      creator: {
        username: "nightowl",
        displayName: "Night Owl",
        avatarUrl: "",
      },
      duration: 195,
      bpm: 125,
      genre: "Synthwave",
      playCount: 3200,
      likeCount: 280,
      createdAt: "2026-02-06",
    },
    creatorId: "user-002",
    submittedAt: "2026-02-06T14:30:00Z",
    votes: 189,
    rank: 2,
  },
  {
    id: "entry-003",
    mashupId: "mashup-003",
    mashup: {
      id: "mashup-003",
      title: "Retro Future Mix",
      description: "80s inspired",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
      audioUrl: "",
      creator: {
        username: "retrowave",
        displayName: "Retrowave Pro",
        avatarUrl: "",
      },
      duration: 210,
      bpm: 130,
      genre: "Synthwave",
      playCount: 2800,
      likeCount: 195,
      createdAt: "2026-02-07",
    },
    creatorId: "user-003",
    submittedAt: "2026-02-07T09:15:00Z",
    votes: 156,
    rank: 3,
  },
  {
    id: "entry-004",
    mashupId: "mashup-004",
    mashup: {
      id: "mashup-004",
      title: "Digital Horizon",
      description: "Futuristic blend",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
      audioUrl: "",
      creator: {
        username: "futurebeats",
        displayName: "Future Beats",
        avatarUrl: "",
      },
      duration: 175,
      bpm: 132,
      genre: "Synthwave",
      playCount: 1900,
      likeCount: 142,
      createdAt: "2026-02-08",
    },
    creatorId: "user-004",
    submittedAt: "2026-02-08T16:45:00Z",
    votes: 98,
    rank: 4,
  },
]

export default function BattleDetailPage() {
  const params = useParams()
  const battleId = params.id as string
  
  const [battle, setBattle] = useState<Battle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userVotesRemaining, setUserVotesRemaining] = useState(3)
  const [hasVoted, setHasVoted] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("entries")
  
  useEffect(() => {
    async function loadBattle() {
      setIsLoading(true)
      try {
        const data = await getBattleById(battleId)
        if (data) {
          // Add mock entries
          data.entries = mockEntries
          setBattle(data)
          setUserVotesRemaining(data.votesPerUser)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBattle()
  }, [battleId])
  
  const handleVote = async (entryId: string) => {
    if (userVotesRemaining <= 0) return
    
    // Mock API call
    console.log(`Voted for ${entryId}`)
    setUserVotesRemaining(prev => prev - 1)
    setHasVoted(true)
    
    // Update local battle data
    if (battle) {
      setBattle({
        ...battle,
        totalVotes: battle.totalVotes + 1,
      })
    }
  }
  
  const handleSubmitEntry = () => {
    // Navigate to create page with battle context
    window.location.href = `/create?battle=${battleId}`
  }
  
  if (isLoading) {
    return (
      <NeonPage>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </NeonPage>
    )
  }
  
  if (!battle) {
    return (
      <NeonPage>
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Battle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This battle doesn&apos;t exist or has been removed.
          </p>
          <Link href="/battles">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Battles
            </Button>
          </Link>
        </div>
      </NeonPage>
    )
  }
  
  const statusDisplay = getBattleStatusDisplay(battle.status)
  const canSubmit = canSubmitToBattle(battle) && !hasSubmitted
  const canVote = canVoteInBattle(battle)
  
  return (
    <NeonPage>
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/battles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Battles
        </Link>
        
        {/* Header Card */}
        <Card className="overflow-hidden mb-8">
          {/* Cover */}
          <div className="relative h-48 bg-gradient-to-br from-primary/30 via-primary/10 to-muted">
            {battle.coverUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${battle.coverUrl})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={statusDisplay.bgColor + " " + statusDisplay.color}>
                  {statusDisplay.label}
                </Badge>
                <Badge variant="outline">{battle.type === "1v1" ? "1v1 Duel" : "Tournament"}</Badge>
                {battle.themeValue && (
                  <Badge variant="secondary">{battle.themeValue}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{battle.title}</h1>
            </div>
          </div>
          
          <CardContent className="p-6">
            <p className="text-muted-foreground text-lg mb-6">{battle.description}</p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted">
                <Gift className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">${battle.prizePool}</p>
                <p className="text-xs text-muted-foreground">Prize Pool</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{battle.entries.length}</p>
                <p className="text-xs text-muted-foreground">Entries</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{battle.totalVotes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Votes</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{battle.votesPerUser}</p>
                <p className="text-xs text-muted-foreground">Votes Per User</p>
              </div>
            </div>
            
            {/* Countdown */}
            {(battle.status === "active" || battle.status === "voting") && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  {battle.status === "active" ? "Submissions close in:" : "Voting ends in:"}
                </p>
                <CountdownTimer 
                  targetDate={battle.status === "active" ? battle.submissionEnd : battle.votingEnd}
                  size="lg"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {canSubmit && (
                <Button size="lg" onClick={handleSubmitEntry}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit Entry
                </Button>
              )}
              {hasSubmitted && (
                <Button size="lg" variant="outline" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entry Submitted
                </Button>
              )}
              <Button size="lg" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Battle
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entries">
              Entries ({battle.entries.length})
            </TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>
          
          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-6">
            {canVote ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Voting is now open! Listen to entries and vote for your favorites. 
                  Artist names are hidden for fair judging.
                </AlertDescription>
              </Alert>
            ) : battle.status === "active" ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Submissions are open! Submit your mashup before the deadline to enter.
                </AlertDescription>
              </Alert>
            ) : null}
            
            <BattleVoting
              battle={battle}
              entries={battle.entries}
              userVotesRemaining={userVotesRemaining}
              hasVoted={hasVoted}
              onVote={handleVote}
              isBlind={battle.voteType === "blind"}
            />
          </TabsContent>
          
          {/* Rules Tab */}
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Battle Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {battle.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Rules</h3>
                  <ul className="space-y-2">
                    {battle.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Prizes Tab */}
          <TabsContent value="prizes">
            <Card>
              <CardHeader>
                <CardTitle>Prizes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-8 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <p className="text-4xl font-bold text-yellow-500">
                    ${battle.prizePool} {battle.prizeCurrency}
                  </p>
                  <p className="text-muted-foreground mt-2">Total Prize Pool</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Prize Breakdown</h3>
                  <p className="text-muted-foreground">{battle.prizeDescription}</p>
                </div>
                
                {battle.status === "completed" && battle.entries[0]?.isWinner && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Winner
                    </h3>
                    <Link 
                      href={`/mashup/${battle.entries[0].mashupId}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <img 
                        src={battle.entries[0].mashup.coverUrl} 
                        alt={battle.entries[0].mashup.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{battle.entries[0].mashup.title}</p>
                        <p className="text-sm text-muted-foreground">
                          by {battle.entries[0].mashup.creator.displayName}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NeonPage>
  )
}

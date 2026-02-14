"use client"

import { useState } from "react"
import { Play, Heart, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Battle, BattleEntry } from "@/lib/data/battles"
import { useAudio } from "@/lib/audio/audio-context"

interface BattleVotingProps {
  battle: Battle
  entries: BattleEntry[]
  userVotesRemaining: number
  hasVoted: boolean
  onVote: (entryId: string) => void
  isBlind?: boolean
}

export function BattleVoting({
  battle,
  entries,
  userVotesRemaining,
  hasVoted,
  onVote,
  isBlind = true,
}: BattleVotingProps) {
  const { state, playTrack } = useAudio()
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null)
  const [votingEntryId, setVotingEntryId] = useState<string | null>(null)
  
  // Sort entries by votes if voting has ended, otherwise random for blind voting
  const sortedEntries = hasVoted || battle.status === "completed"
    ? [...entries].sort((a, b) => b.votes - a.votes)
    : isBlind 
      ? [...entries].sort(() => Math.random() - 0.5) // Shuffle for blind voting
      : entries
  
  const totalVotes = entries.reduce((sum, e) => sum + e.votes, 0)
  const maxVotes = Math.max(...entries.map(e => e.votes), 1)
  
  const handleVote = async (entryId: string) => {
    if (userVotesRemaining <= 0 || hasVoted) return
    
    setVotingEntryId(entryId)
    await onVote(entryId)
    setVotingEntryId(null)
  }
  
  const handlePlay = (entry: BattleEntry) => {
    playTrack({
      id: entry.mashupId,
      title: entry.mashup.title,
      artist: entry.mashup.creator.displayName,
      coverUrl: entry.mashup.coverUrl,
      src: entry.mashup.audioUrl,
    })
  }
  
  return (
    <div className="space-y-4">
      {/* Voting Status */}
      <Alert className={hasVoted ? "bg-green-500/10 border-green-500/20" : undefined}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {hasVoted ? (
            "Thanks for voting! Results will be revealed when voting ends."
          ) : userVotesRemaining > 0 ? (
            <>
              You have <strong>{userVotesRemaining}</strong> vote{userVotesRemaining !== 1 ? "s" : ""} remaining. 
              {isBlind && " Artist names are hidden for fair judging."}
            </>
          ) : (
            "You've used all your votes for this battle."
          )}
        </AlertDescription>
      </Alert>
      
      {/* Entries List */}
      <div className="space-y-3">
        {sortedEntries.map((entry, index) => {
          const isPlaying = state.currentTrack?.id === entry.mashupId && state.isPlaying
          const isHovered = hoveredEntry === entry.id
          const votePercentage = totalVotes > 0 ? (entry.votes / totalVotes) * 100 : 0
          const showResults = hasVoted || battle.status === "completed"
          
          return (
            <Card
              key={entry.id}
              className={cn(
                "overflow-hidden transition-all",
                isHovered && "border-primary/50",
                entry.isWinner && "border-yellow-500/50 shadow-md"
              )}
              onMouseEnter={() => setHoveredEntry(entry.id)}
              onMouseLeave={() => setHoveredEntry(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  {showResults && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      entry.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                      entry.rank === 2 ? "bg-gray-300 text-gray-800" :
                      entry.rank === 3 ? "bg-amber-600 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      #{entry.rank || index + 1}
                    </div>
                  )}
                  
                  {/* Cover */}
                  <div 
                    className="relative w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 cursor-pointer group"
                    onClick={() => handlePlay(entry)}
                  >
                    <img
                      src={entry.mashup.coverUrl}
                      alt={entry.mashup.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                      isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                    {isPlaying && (
                      <div className="absolute bottom-1 right-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className="w-1 h-3 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {isBlind && !showResults ? `Entry #${index + 1}` : entry.mashup.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isBlind && !showResults 
                        ? "Anonymous submission" 
                        : `by ${entry.mashup.creator.displayName}`}
                    </p>
                    
                    {/* Vote Progress Bar */}
                    {showResults && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {entry.votes.toLocaleString()} votes
                          </span>
                          <span className="font-medium">{votePercentage.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(entry.votes / maxVotes) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Vote Button */}
                  {!showResults && userVotesRemaining > 0 && (
                    <Button
                      size="sm"
                      variant={hasVoted ? "outline" : "default"}
                      disabled={hasVoted || votingEntryId === entry.id}
                      onClick={() => handleVote(entry.id)}
                      className="shrink-0"
                    >
                      {votingEntryId === entry.id ? (
                        "..."
                      ) : hasVoted ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Voted
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-1" />
                          Vote
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Winner Badge */}
                  {entry.isWinner && (
                    <Badge className="bg-yellow-500 text-yellow-950 shrink-0">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Voting Stats */}
      {showResults && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>Total votes: {totalVotes.toLocaleString()}</span>
          <span>{battle.uniqueVoters.toLocaleString()} voters</span>
        </div>
      )}
    </div>
  )
}

// Matchup component for 1v1 battles
export function BattleMatchup({
  entry1,
  entry2,
  onVote,
  userVotesRemaining,
  hasVoted,
  showResults,
}: {
  entry1: BattleEntry
  entry2: BattleEntry
  onVote: (entryId: string) => void
  userVotesRemaining: number
  hasVoted: boolean
  showResults: boolean
}) {
  const { state, playTrack } = useAudio()
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  const handlePlay = (entry: BattleEntry) => {
    setPlayingId(entry.id)
    playTrack({
      id: entry.mashupId,
      title: entry.mashup.title,
      artist: entry.mashup.creator.displayName,
      coverUrl: entry.mashup.coverUrl,
      src: entry.mashup.audioUrl,
    })
  }
  
  const totalVotes = entry1.votes + entry2.votes
  const entry1Percent = totalVotes > 0 ? (entry1.votes / totalVotes) * 100 : 50
  const entry2Percent = totalVotes > 0 ? (entry2.votes / totalVotes) * 100 : 50
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Entry 1 */}
        <Card className={cn(
          "overflow-hidden transition-all",
          entry1.isWinner && "border-yellow-500/50"
        )}>
          <div className="aspect-square bg-muted relative">
            <img
              src={entry1.mashup.coverUrl}
              alt={entry1.mashup.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handlePlay(entry1)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Play className="h-12 w-12 text-white fill-white" />
            </button>
            {showResults && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/70 text-white">
                  {entry1Percent.toFixed(0)}%
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h4 className="font-medium truncate">{entry1.mashup.title}</h4>
            <p className="text-sm text-muted-foreground">
              by {entry1.mashup.creator.displayName}
            </p>
            {!showResults && userVotesRemaining > 0 && (
              <Button 
                className="w-full mt-3" 
                onClick={() => onVote(entry1.id)}
                disabled={hasVoted}
              >
                <Heart className="h-4 w-4 mr-1" />
                Vote
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* VS Divider */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg">
            VS
          </div>
        </div>
        
        {/* Entry 2 */}
        <Card className={cn(
          "overflow-hidden transition-all",
          entry2.isWinner && "border-yellow-500/50"
        )}>
          <div className="aspect-square bg-muted relative">
            <img
              src={entry2.mashup.coverUrl}
              alt={entry2.mashup.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handlePlay(entry2)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Play className="h-12 w-12 text-white fill-white" />
            </button>
            {showResults && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/70 text-white">
                  {entry2Percent.toFixed(0)}%
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h4 className="font-medium truncate">{entry2.mashup.title}</h4>
            <p className="text-sm text-muted-foreground">
              by {entry2.mashup.creator.displayName}
            </p>
            {!showResults && userVotesRemaining > 0 && (
              <Button 
                className="w-full mt-3" 
                onClick={() => onVote(entry2.id)}
                disabled={hasVoted}
              >
                <Heart className="h-4 w-4 mr-1" />
                Vote
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Bar */}
      {showResults && (
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all"
            style={{ width: `${entry1Percent}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-secondary transition-all"
            style={{ width: `${entry2Percent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
            {entry1.votes.toLocaleString()} vs {entry2.votes.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

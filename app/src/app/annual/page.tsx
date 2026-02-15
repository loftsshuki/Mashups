import { Music, TrendingUp, Users, Trophy, Sparkles, BarChart3 } from "lucide-react"

export const metadata = {
  title: "State of Mashups 2025 | Mashups.com",
  description: "The annual report on music mashup creation — top genres, most-used stems, fastest-growing creators, and predictions.",
  openGraph: {
    title: "State of Mashups 2025",
    description: "Discover the year in music mashups — trends, creators, and what's next.",
    type: "article",
  },
}

export default function AnnualReportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-16 text-center space-y-4">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Annual Report</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          State of Mashups
        </h1>
        <p className="text-lg text-muted-foreground">2025 in Review</p>
      </div>

      {/* Big number: Total mashups */}
      <div className="mb-16 text-center">
        <p className="text-6xl font-bold text-primary sm:text-7xl">247,831</p>
        <p className="text-lg text-muted-foreground mt-2">mashups created this year</p>
        <p className="text-sm text-primary mt-1">+182% from 2024</p>
      </div>

      {/* Top Genres */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Top Genres</h2>
        </div>
        <div className="space-y-3">
          {[
            { genre: "Electronic", percentage: 28, color: "bg-violet-500" },
            { genre: "Hip-Hop", percentage: 22, color: "bg-red-500" },
            { genre: "Lo-fi", percentage: 18, color: "bg-cyan-500" },
            { genre: "Pop", percentage: 14, color: "bg-pink-500" },
            { genre: "Synthwave", percentage: 10, color: "bg-indigo-500" },
            { genre: "Jazz Fusion", percentage: 8, color: "bg-amber-500" },
          ].map((g) => (
            <div key={g.genre} className="flex items-center gap-3">
              <span className="w-24 text-sm text-foreground">{g.genre}</span>
              <div className="flex-1 h-6 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full ${g.color} transition-all duration-700`}
                  style={{ width: `${g.percentage * 3}%` }}
                />
              </div>
              <span className="w-10 text-sm font-medium text-foreground text-right">{g.percentage}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Most-Used Stems */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Music className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Most-Used Stems</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: "808 Glide Bass", uses: 4720, instrument: "bass" },
            { title: "Soul Vocal Chop Pack", uses: 3890, instrument: "vocal" },
            { title: "Crisp Trap Hi-Hats", uses: 3450, instrument: "drums" },
            { title: "Ethereal Pad Wash", uses: 2980, instrument: "synth" },
          ].map((stem) => (
            <div key={stem.title} className="rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{stem.title}</p>
              <p className="text-xs text-muted-foreground">
                {stem.instrument} · Used in {stem.uses.toLocaleString()} mashups
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fastest-Growing Creators */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Fastest-Growing Creators</h2>
        </div>
        <div className="space-y-2">
          {[
            { name: "Crystal Beats", growth: "+2,400%", mashups: 87, genre: "Electronic" },
            { name: "Vinyl Whisper", growth: "+1,800%", mashups: 64, genre: "Lo-fi" },
            { name: "Bass Architect", growth: "+1,200%", mashups: 112, genre: "Bass" },
          ].map((creator, i) => (
            <div key={creator.name} className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <span className="text-2xl font-bold text-primary">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{creator.name}</p>
                <p className="text-xs text-muted-foreground">{creator.mashups} mashups · {creator.genre}</p>
              </div>
              <span className="text-sm font-bold text-primary">{creator.growth}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">By the Numbers</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Creators", value: "12,847" },
            { label: "Stems Uploaded", value: "89,420" },
            { label: "Total Plays", value: "34.2M" },
            { label: "Collaborations", value: "8,930" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 bg-card/50 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Most Remixed */}
      <section className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Most Remixed Track</p>
        <p className="text-xl font-bold text-foreground">Midnight Fusion</p>
        <p className="text-sm text-muted-foreground">by BeatAlchemist — 347 remixes</p>
      </section>

      {/* Predictions */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Predictions for 2026</h2>
        </div>
        <div className="space-y-3">
          {[
            "AI-generated stems will account for 30% of all new stems uploaded",
            "Cross-genre mashups will surpass single-genre mashups for the first time",
            "Real-time collaborative creation will become the default creation mode",
            "Stem royalties will create a new class of passive-income music creators",
          ].map((prediction, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <span className="text-primary font-bold shrink-0">{i + 1}.</span>
              <p className="text-sm text-foreground">{prediction}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>mashups.com — State of Mashups 2025</p>
      </div>
    </div>
  )
}

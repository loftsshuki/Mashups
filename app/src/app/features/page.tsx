import { DailyFlip } from "@/components/features/daily-flip"
import { LivePerformanceDeck } from "@/components/features/live-deck"
import { StemSwapper } from "@/components/features/stem-swapper"
import { AutoMashupPlayer } from "@/components/features/auto-mashup-player"

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 space-y-24">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center space-y-4">
                <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-pink-600 bg-clip-text text-transparent">
                    Mashups.com
                </h1>
                <p className="text-xl text-zinc-400">
                    New Feature Concepts — Q1 2026
                </p>
            </div>

            {/* 0. Thunderdome (LIVE) */}
            <section className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/40 to-black p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Phase 3: Live Now
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                        THUNDERDOME
                    </h2>

                    <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto font-light">
                        Real-time multiplayer production battles. <br />
                        <span className="text-red-400 font-medium">Glitch vs Glitch.</span> Winner takes the crowd.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-4">
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                            <div className="text-red-500 font-bold mb-1">Split-Screen</div>
                            <div className="text-xs text-zinc-500">Watch opponent moves in real-time via WebSocket sync.</div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                            <div className="text-red-500 font-bold mb-1">Crowd Control</div>
                            <div className="text-xs text-zinc-500">Twitch chat votes trigger arena hazards (Speed Up, Reverse).</div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                            <div className="text-red-500 font-bold mb-1">XP & Rank</div>
                            <div className="text-xs text-zinc-500">Climb from Bedroom Producer to Stadium Legend.</div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <a
                            href="/thunderdome"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-red-600 rounded-full hover:bg-red-700 hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                        >
                            Enter Arena
                        </a>
                    </div>
                </div>
            </section>

            {/* 1. Daily Flip */}
            <section className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-wider">
                        Phase 3: Community
                    </div>
                    <h2 className="text-3xl font-bold">The Daily Flip</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        A daily gamified challenge. Every day, 3 new stems drop.
                        Thousands of producers compete to make the best 30s flip.
                    </p>
                    <ul className="space-y-2 text-zinc-500">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Builds daily retention habit
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Solves "blank canvas" syndrome
                        </li>
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
                    <DailyFlip className="relative shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500" />
                </div>
            </section>

            {/* 2. Live Deck */}
            <section className="max-w-6xl mx-auto space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold uppercase tracking-wider">
                        Phase 1: Production
                    </div>
                    <h2 className="text-3xl font-bold">Live Performance Deck</h2>
                    <p className="text-zinc-400 text-lg">
                        Transform from linear editing to live performance.
                        Trigger clips, launch scenes, and perform FX in real-time.
                    </p>
                </div>

                <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 shadow-2xl overflow-hidden h-[600px]">
                    <LivePerformanceDeck />
                </div>
            </section>

            {/* 3. Stem Swapper */}
            <section className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative flex justify-center">
                    <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full" />
                    <StemSwapper />
                </div>
                <div className="order-1 md:order-2 space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider">
                        Phase 5: AI Magic
                    </div>
                    <h2 className="text-3xl font-bold">Smart Stem Swapping</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Generative timbre replacement. Keep the rhythm, change the sound.
                        Turn rock drums into techno drums instantly.
                    </p>
                    <ul className="space-y-2 text-zinc-500">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Rapid genre experimentation
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Non-destructive AI workflow
                        </li>
                    </ul>
                </div>
            </section>

            {/* Feature 4: AI Hook Generator */}
            <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 flex justify-center">
                    <AutoMashupPlayer />
                </div>
                <div className="space-y-6 order-1 md:order-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Phase 2: Viral Distribution
                    </div>
                    <h2 className="text-4xl font-bold">Auto-Mashup Engine</h2>
                    <p className="text-xl text-zinc-400">
                        Generate viral hooks in seconds. Our algorithmic engine analyzes tracks for key & bpm, then perfects the chop.
                    </p>
                    <ul className="space-y-3 text-zinc-300">
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Smart Chopping (Transient Detection)
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            3 Mixing Modes: Chop, Blend, Switch
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Instant BPM Sync
                        </li>
                    </ul>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-zinc-600 pb-12">
                <p>© 2026 Mashups.com - Confidential Internal Preview</p>
            </footer>
        </div>
    )
}

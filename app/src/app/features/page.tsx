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

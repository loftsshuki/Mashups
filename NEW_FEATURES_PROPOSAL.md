# New Feature Proposal - Q1 2026

This document outlines three high-impact features designed to increase user retention, unlock new creative workflows, and differentiate Mashups.com from traditional DAWs.

## 1. The Daily Flip (Gamified Retention)
**Goal:** Create a daily habit-forming loop for creators. Think "Wordle for Music Producers."

### Core Concept
Every day at midnight (UTC), the platform releases a "Daily Pack" containing 3 distinct, high-quality stems (e.g., a Motown vocal, a Trap hi-hat loop, and an ambient synth pad). Users have 24 hours to create a <30s mashup using at least these three stems.

### User Flow
1.  **Notification:** User receives a push notification/email: "Today's Flip is live! 🎵 Motown x Trap."
2.  **Challenge Interface:** A dedicated "Daily Flip" page shows the 3 stems visually.
3.  **Creation:** One-click "Start Flipping" opens the DAW with stems pre-loaded on tracks 1-3.
4.  **Submission:** Users publish their flip to the "Daily Leaderboard."
5.  **Voting:** Community listens and upvotes. Top 3 flips get a "Daily Winner" badge and 100 credits.

### Technical Requirements
*   **Backend:** Scheduled job to select/release stems from library.
*   **Frontend:** New "Daily Flip" landing page + leaderboard component.
*   **Social:** Auto-generated share card ("I survived the Daily Flip #42").

### Success Metrics
*   **DAU/MAU Ratio:** Target >20%.
*   **Completion Rate:** % of users who start a flip and submit.

---

## 2. Live Performance Deck (New Interface)
**Goal:** Transform the linear DAW into an instrument for live performance and content creation.

### Core Concept
A toggle switch in the main DAW header flips the interface from "Timeline View" (linear editing) to "Launchpad View" (grid-based triggering).

### User Interface
*   **Grid Layout:** 8x8 grid of clip slots (Ableton Live Session View style).
*   **Global Macro Controls:** 4 large, touch-friendly knobs for Filter, Reverb, Stutter, and Crush.
*   **Visualizer:** Background reacts to audio amplitude and frequency.

### Key Features
*   **Clip Launching:** Tap a clip to play in sync (quantized to 1 bar).
*   **Scene Launching:** Trigger an entire row (Verse, Chorus, Drop) at once.
*   **Performance Recording:** Record the live session into the Timeline View for fine-tuning.
*   **Streamer Mode:** "Hide UI" button that makes the interface look like a futuristic DJ deck for OBS capture.

### Technical Requirements
*   **Audio Engine:** Low-latency scheduling ( Web Audio API `AudioContext.currentTime` lookahead).
*   **State Management:** Robust syncing between Grid state and Linear Timeline state.

### Success Metrics
*   **Session Time:** Increase in average session length.
*   **UGC:** Number of "Live Performance" videos shared to TikTok/Shorts.

---

## 3. Smart Stem Swapping (Generative Workflow)
**Goal:** Enable rapid genre-bending and experimentation without losing the groove.

### Core Concept
Allow users to replace the *timbre* (sound texture) of a stem while preserving its *rhythm* and *musicality*. "Keep the drum pattern, but make it sound like 80s Synthpop."

### User Flow
1.  **Selection:** User right-clicks a Drum Stem on the timeline.
2.  **Context Menu:** Selects "Swap Stem Kit..."
3.  **Browser:** new sidebar opens with "Style/Genre" tags (Lo-Fi, Techno, Rock, Acoustic).
4.  **Preview:** Hovering over a style plays the *original* rhythm using the *new* sounds.
5.  **Apply:** One click replaces the audio file on the timeline (non-destructively).

### Technical Requirements
*   **Analysis:** On-device transient detection to slice the original audio loop.
*   **Synthesis/Replacement:**
    *   *Simple MVP:* Match transient timestamps to new samples (Kick -> Kick, Snare -> Snare).
    *   *AI Advanced:* RAVE/DDSP style transfer models.
*   **Asset Library:** Tagged database of "Kits" (Drum kits, Bass patches).

### Success Metrics
*   **Feature Usage:** % of projects using Swapped Stems.
*   **Expansion:** Number of "Premium Kits" purchased (monetization avenue).

---

## Strategic Roadmap Alignment

| Feature | Phase Alignment | Priority | Est. Effort |
| :--- | :--- | :--- | :--- |
| **The Daily Flip** | Phase 3 (Community) | 🔴 High | 2 Weeks |
| **Live Deck** | Phase 1 (Production) | 🟡 Medium | 3-4 Weeks |
| **Stem Swapping** | Phase 5 (AI Features) | 🟡 Medium | 3 Weeks |

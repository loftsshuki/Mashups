# Mashups Audio Technology and Creator Workflow Review

Mashups should make reliable musical results its next development priority. The current repository contains useful product infrastructure, a synthesized demonstration, and an older recording-based mashup path. It does not yet establish that ordinary listeners can consistently create a mashup they want to keep or share. Passing application tests cannot establish that outcome.

The recommended product has two entry points into one project system: guided creation for fans, and an advanced workflow that works with producers' existing software. The creation experience belongs inside the web, iOS, and Android apps. For the initial release, prepare catalog audio and render final mixes on the backend, while devices handle playback and responsive editing. Professional users should also be able to import their own stems and publish externally produced mixes, subject to the applicable source permissions.

DJ.Studio and Ableton Live provide useful benchmarks. Their documentation shows that important processing components are available from specialist suppliers. Their capabilities support a practical integration strategy, but they do not prove that Mashups can already match their sound quality. That requires controlled comparisons using the same recordings, arrangements, and output levels.

## DJ.Studio and Ableton Live

### DJ.Studio's useful distinction

DJ.Studio combines music selection, harmonic ordering, a visual timeline, editable beat grids, stem controls, and export in a workflow aimed at preparing mixes. Its Harmonize function orders DJ playlists using BPM and key and provides transition settings. The documentation still instructs creators to listen and refine the results. The distinctive product quality is the integration of these decisions into an approachable workflow; the documentation does not establish that each individual capability is exclusive.[^1]

Its separation documentation names htDemucs for four stems and MDX'23 models for high-quality vocal and instrumental extraction. Mashups already has an htDemucs integration. Therefore, switching to a different separator is only one potential improvement. DJ.Studio also supports faster, lower-quality editing previews and full-quality separation at export, alongside volume automation for individual stems.[^2]

DJ.Studio uses Rubber Band by default for pitch-preserving tempo changes and offers a paid integration of zplane's élastique Pro. This directly identifies an engineering difference from Mashups' legacy use of playback-rate resampling. A consumer purchase of DJ.Studio's extension does not confer rights to embed the engine in another product; Mashups would need its own suitable supplier agreement.[^3]

Its rebuilt beat-grid editor permits individual beat corrections, downbeat changes, and tempo changes within a track. These controls let a creator repair analysis mistakes, including those in recordings with changing tempo.[^4] This is a useful design reference for Mashups' advanced mode, with simpler suggested corrections for fans.

There is a material boundary to the automation: DJ.Studio's current Mashup Mode documentation says Harmonize is unavailable in that mode and its AI does not create an entire mashup automatically. The creator selects and arranges the parts. The same page says direct Ableton export is not yet available for that mode.[^5] Its general export documentation does describe Ableton project export for supported mixes, including automation and effects; these statements apply to different workflows.[^6]

The documented creation application runs on Windows and Mac. DJ.Studio's mobile app is for listening to prepared mixes, with no mobile mix-creation application described.[^7] This makes an accessible phone creation experience a plausible area of differentiation for Mashups. It does not establish an uncontested market.

### Ableton Live's quality reference

Live's relevant strengths include editable warp markers and different stretching modes for different material. Its Complex Pro mode includes formant control, which helps retain a voice's tonal character during transposition. Its Re-Pitch mode deliberately couples tempo and pitch. The engineering lesson is to select processing appropriate to the material and the musical intention.[^8]

Ableton's current Live 12 Suite feature page identifies Music.AI as the supplier behind its stem separation.[^9] The manual describes local processing and separate High Speed and High Quality modes. Separated parts become editable clips; the manual also acknowledges that sounds can leak into unexpected stems.[^10] These are useful reference capabilities, not evidence of perfect separation on every recording.

Music.AI separately offers a developer API and an embedded SDK for local or hybrid use.[^11] That makes a commercial evaluation a concrete option. The exact models, performance, pricing, redistribution terms, and supported devices in a Mashups agreement still need confirmation. An API integration should not be described as identical to Ableton's implementation without comparative evidence.

Live is also a useful reference for doing no unnecessary damage. Ableton documents circumstances in which unchanged audio playback is neutral, verified by cancellation tests.[^12] Mashups should preserve unmodified material, avoid repeatedly stretching an already stretched file, and keep source audio separate from editable instructions.

### What to adapt

Use DJ.Studio as a reference for reducing the effort of preparation and Live as a reference for precise control and dependable rendering. Adapt the underlying capabilities through appropriately licensed components and original implementation. Prioritize accurate timing, independent tempo and pitch, stem automation, repeatable edits, and a consistent final render.

For professional users, access to usable sources, fast experimentation, publishing, attribution, and audience response must provide value alongside their existing tools. A producer should be able to finish in Logic or Live and return to Mashups. Requiring that producer to abandon a working studio setup would make adoption harder.

## Findings in the Mashups repository

The following findings refer to revision `b5976ef`, rather than a claim about a subsequently changed deployment.

**The current creation route is a synthetic demonstration.** The Green studio calls `renderGreenMashup`, which generates drums, bass, harmony, and lead sounds from catalog synthesis recipes at 22,050 Hz. It exercises creation, saving, and playback, but it does not demonstrate the separation and combination of uploaded commercial recordings.[^13]

**The newer worker implements analysis only.** Its non-analysis jobs return `SPECIALIST_PROVIDER_REQUIRED`. It estimates tempo, key, and level; separation and final rendering still need working providers behind that job interface.[^14]

**The older recording-based path has consequential musical limitations.** It combines song A's vocals and harmony with song B's drums. Song B's bass and other instrumental material are not used in that arrangement. A recognizable riff or hook from B can therefore disappear. The path also sets `AudioBufferSourceNode.playbackRate` when changing tempo.[^15] That API resamples playback, so this approach also changes pitch.[^16]

**Several quality labels are heuristics.** The Green benchmark constructs scores from metadata and arrangement rules without evaluating rendered recordings or listener preference. Another utility's `audioQuality` combines BPM and descriptive metadata. These can help rank candidates or assess completeness, but should not be presented as measured sound quality.[^17]

**The analysis metrics need correction before they become quality gates.** The worker labels a sample-maximum measurement as true peak and labels regularity of beat intervals as phrase confidence. Neither establishes its named property. Analysis downmixes to mono and stops at seven minutes, so its result must not imply complete stereo analysis of longer accepted uploads. Nullable separation metrics also cannot demonstrate that separation passed a quality test.[^14][^18]

**The legacy stem service adds a lossy intermediate.** It writes separated parts as 192 kbps MP3. The replacement pipeline should preserve lossless stems and use compressed formats for suitable delivery outputs. This change removes an avoidable processing stage, but the codec setting alone does not diagnose an unsatisfying mashup.[^19]

These findings justify changing the audio roadmap. They do not identify which defect dominated any particular listening experience. Source artifacts, a poor musical pairing, timing errors, and an overworked mix can coexist.

## A pipeline that addresses musical quality

### Source preparation

Prefer supplied studio stems when available and authorized. Preserve their timing, channel configuration, and relative levels. Studio stems still require checks: they may use a different arrangement from the released recording, contain shared effects, or begin at different positions. Validate alignment and obtain a stereo reference.

Use AI separation when suitable stems are unavailable. Keep the source master immutable, retain lossless intermediate audio, and record model identity, weights version, processing settings, sample rate, and checksums. Separate catalog material once per approved source/version and reuse the prepared assets while the relevant grant remains active. Cache permissions must remain enforceable when a grant expires or changes.

Start the model comparison with the repository's htDemucs baseline and its fine-tuned variant. The Demucs README describes the latter as more computationally expensive, with potentially improved results; the upstream repository is archived, so maintenance must be considered.[^20] Include a reviewed BS-RoFormer or Mel-Band RoFormer checkpoint and a commercial Music.AI candidate. The RoFormer papers establish relevant separation approaches, but neither a paper name nor a model leaderboard settles production suitability.[^21][^22]

### Analysis and compatibility

Analyze beat positions, downbeats, local tempo changes, vocal activity, sections, and harmonic content. A global BPM and key provide a useful shortlist; they do not establish that a particular chorus fits a particular bassline. Let a producer correct the beat grid and section boundaries, and store those corrections separately from the original machine analysis.

Beat This! is a candidate for beat/downbeat estimation. Its authors provide an implementation and published weights under MIT, with a separate note concerning training-material restrictions.[^23] It is one analysis component. Phrase boundaries, musical roles, and the quality of the resulting combination still require further logic and evaluation.

Score the actual direction of a pairing: vocals from A over accompaniment from B can work differently from vocals from B over accompaniment from A. The AutoMashup research reports this asymmetry and limitations in using general-purpose audio embeddings for compatibility.[^24] For launch, combine explicit musical constraints with producer-reviewed examples, then collect listener outcomes before investing in a learned ranking model.

### Arrangement

Generate a few intentional candidates. Useful starting arrangements include a vocal over another song's instrumental, alternating recognizable hooks, or a vocal phrase resolving into the other song's drop. Select complete musical phrases, preserve recognizability from both sources, and avoid simultaneous lead vocals or competing bass foundations by default.

An unfamiliar combination should not be rejected merely because it is unusual. However, a fan-facing recommendation needs a dependable first result. Keep deliberately conflicting vocals, unusual meter relationships, and substantial tempo changes available as expert choices. A 3:4 rhythmic reinterpretation is a creative decision, not an automatic substitute for ordinary beat matching.

A strong short excerpt is a reasonable first target. Extending it into a complete track requires additional structure, contrast, transitions, and an ending. Looping a successful excerpt does not by itself solve full-track arrangement.

### Time, pitch, and mixing

Replace pitch-coupled speed adjustment with independent time and pitch processing. Evaluate Rubber Band's offline finer engine, including its vocal formant option, against a licensed élastique Pro evaluation. Rubber Band's documentation describes different processing options and timing compensation; zplane offers an SDK with time stretching and formant-preserving pitch shifting.[^25][^26] Compare actual outputs at the shifts the product intends to permit.

Processing should start from the original stem whenever settings change. Keep all participating stems on one explicit musical timeline, compensate processor latency, preserve transients where possible, and crossfade edits to avoid clicks. Rendered output must reflect the same arrangement the creator approved in preview.

Mixing then balances vocals and accompaniment, makes room for competing frequencies, manages dynamics, and controls final peaks. Loudness normalization cannot repair conflicting notes or a vocal entering on the wrong phrase. Final checks should include stereo and mono playback, encoded delivery files, and oversampled peak measurement. FFmpeg's loudnorm implementation provides loudness and true-peak analysis; it is a measurement component rather than a musical-quality judge.[^27]

## Fans and professionals

Both groups should use the same catalog identities, project revisions, permissions, credits, and publishing system. Guided and advanced editing should be switchable views, with access to premium features governed separately from rights to particular recordings.

| Need | Fan experience | Professional experience |
|---|---|---|
| Starting material | Choose songs and a suggested combination | Import own mix or aligned stems; choose approved catalog sources |
| First result | A few short, clearly different previews | Audition sources and assign musical roles |
| Editing | Change section, vocal balance, and arrangement | Correct timing; edit pitch, cues, stems, fades, and automation |
| Completion | Save and share the approved result | Render, export permitted assets, or finish in a DAW and return |

For fans, keep musical decisions understandable: “use this chorus,” “more vocal,” or “try this drop.” Do the technical preparation automatically. When the engine cannot produce a credible candidate, offer compatible alternatives and make failed-job credit handling predictable. Track how often users reach that point; hiding rejected requests would inflate apparent success.

For producers, prioritize an import/export contract before a large workstation interface. A practical package contains aligned WAV files starting at the same origin, a stereo reference, tempo and marker information, and a source/credit manifest. Original and processed stems should be clearly distinguishable. A 24-bit PCM delivery option is useful; preserve higher-precision working audio internally where appropriate.

Logic documents individual-track export with control over effects, tails, automation, and tempo information.[^28] Ableton's stem-transfer guidance emphasizes preserving starting alignment and avoiding unintended auto-warping.[^29] These support an interoperable audio-file workflow. Complete round-tripping of proprietary sessions, instruments, and third-party plug-ins is a separate problem and is outside the proposed first release.

The current catalog pilot forbids standalone audio export.[^18] Keep that rule for those assets. Enable professional handoff first for creators' own material and sources with explicit export permission. Buying a higher plan must not silently change an asset's allowed uses.

Producers can also contribute reviewed arrangements or templates for fans, with agreed attribution and reuse permissions. Test whether this improves first-attempt quality and saves production time. The broader platform can still serve casual experimentation, catalog rediscovery, and community listening; unsigned-artist promotion is one use case within it.

## Processing in the app and backend

The proposed flow is: source preparation, musical analysis, candidate arrangement, interactive preview, final render, then approved playback and sharing. Project instructions connect these stages without requiring every device to run the same large model.

**Backend initially:** private ingestion, separation, persistent catalog analysis, high-quality stretching, final mixing, encoding, and output measurements. Use asynchronous jobs with cancellation, retries, idempotency, progress, and versioned outputs. Reuse the newer authenticated job boundary rather than reviving legacy public-asset assumptions.

**Web and mobile clients:** song selection, waveforms, seeking, comparison, clip selection, simple mixing controls, and project editing. Precomputed stems and preview renders should let the interface react promptly. If a preview uses reduced quality, identify that clearly and provide a final-quality audition before publication.

**Professional desktop software:** optional detailed production using permitted exports. Importing an externally finished mix should preserve source references and the creator's project history without claiming to reconstruct their DAW session.

Local inference is technically plausible: Live already separates locally, and Music.AI offers an SDK for device execution.[^10][^11] It may become attractive for offline editing, privacy, or frequent use. Launch decisions should follow measurements on supported iPhones and Android devices, including memory, heat, battery use, app size, and processing time. A capable desktop implementation is not evidence that every target phone meets the same quality and latency requirements.

Share project contracts and backend services across platforms. Validate mobile playback interruptions, audio focus, headphones, background behavior, upload recovery, and returning to an unfinished job. The native apps should inherit an audio engine whose quality has already been demonstrated.

## Listening benchmark and implementation order

The next milestone should be a reproducible set of convincing mashups with measured cost and latency. A proposed pilot uses 20–30 authorized tracks and 30–50 directed pairings, including intentionally difficult or incompatible combinations. Begin with electronic material if that is the initial community, while including a small challenge set of tempo drift, dense vocals, reverb, and changing harmony. Keep some songs entirely outside tuning so results are not limited to repeatedly optimized examples.

Run three comparisons in sequence. First, hold the arrangement fixed and compare supplied stems with AI-derived stems. Second, hold the stems and edit points fixed and compare the existing renderer, replacement processing, and a producer-made Logic or Ableton reference. Third, compare automatic arrangements with producer-selected arrangements. This separates source extraction failures from processing and musical-decision failures.

Use blind, level-matched listening with both fans and working producers. For fans, record whether they would keep or share a result and which version they prefer. For producers, record timing and harmonic defects, artifacts, recognizability, and time needed to repair the result. Listen on headphones, phone speakers, and a suitable full-range system. Do not substitute a metadata score for these judgments.

Record cold and warm time to first preview, final-render latency, processing failures, retries, and cost per result users keep. Include preparation, discarded candidates, storage, and delivery in the cost accounting. Separation metrics such as SDR are useful when reference stems exist; they should supplement listening and should not be fabricated when a reference is absent.

A proposed first gate is that at least 80% of recommended, held-out pairings produce one candidate a majority of a small fan panel would keep or share. This is a product hypothesis, not an industry standard or a result already achieved. Report the number of tested pairs, panel size, disagreement, and all excluded or rejected requests. Also require correct exports, reproducible project revisions, and no unresolved severe defects in the accepted examples.

The implementation order should be:

1. Replace misleading quality labels and establish reference audio, annotations, and blind comparison records.
2. Complete private separation jobs with lossless outputs, model versioning, and cached prepared sources.
3. Implement independent time/pitch rendering, reliable alignment, and correct stereo output measurements.
4. Build a small set of musical arrangements and a pairing system that can decline or suggest alternatives.
5. Connect guided creation to real prepared recordings; verify preview-to-export consistency.
6. Add professional imports and permitted aligned exports, followed by mobile creation on the proven service.

An audio engineer and a working mashup producer should jointly evaluate this milestone. UI work can continue where it supports the benchmark, but more peripheral platform features will not resolve poor musical output. No model has been selected as the winner, no vendor license has been purchased, and no listening-based quality gate has yet passed.

## Limited measurements of an existing example

A local 29.80-second v6 example and its premaster were measured with FFmpeg 8.1.1. The source files remain private. These readings describe those files only; they are not a listening assessment or a comparison of separation engines.[^30]

| Measurement | Premaster | Final |
|---|---:|---:|
| Integrated loudness | -19.82 LUFS | -11.90 LUFS |
| True peak | -4.20 dBTP | -0.53 dBTP |
| Loudness range | 4.00 LU | 2.70 LU |

The final is louder, has lower measured loudness range, and exceeds the repository's current -1 dBTP ceiling. The negative true-peak reading does not demonstrate clipping, and these values cannot identify whether the songs fit musically. The product should first decide the appropriate delivery policy, then measure that policy correctly. It should not require every source stem or premaster to meet a finished-mix loudness target.

## Sources

Repository links below are pinned to the inspected revision. Product documentation was checked on September 12, 2026. Vendor quality claims are treated as claims; comparative recommendations remain subject to the proposed benchmark. No new separation-model run or controlled listening panel is represented in this report.

[^1]: DJ.Studio, Fleur van der Laan. [Harmonize (previously Automix)](https://help.dj.studio/en/articles/7878402-harmonize-previously-automix). Current help documentation; playlist ordering, controls, and limitations.

[^2]: DJ.Studio, Fleur van der Laan. [Stem Separation](https://help.dj.studio/en/articles/9112447-stem-separation). June 16, 2026. Named models, preview quality, export behavior, and stem controls.

[^3]: DJ.Studio. [Elastique Pro Extension in DJ.Studio](https://help.dj.studio/en/articles/12108047-elastique-pro-extension-in-dj-studio). Current help documentation; default Rubber Band engine, zplane integration, and product-specific license.

[^4]: DJ.Studio, Fleur van der Laan. [DJ.Studio 4.0](https://help.dj.studio/en/articles/11207973-dj-studio-4-0). February 16, 2026. Beat-grid and stem-editing changes.

[^5]: DJ.Studio, Fleur van der Laan. [Mashup mode](https://help.dj.studio/en/articles/10521001-mashup-mode). March 24, 2026. Manual arrangement, lack of Harmonize in this mode, and export limitations.

[^6]: DJ.Studio, Liz Bollema. [Exporting Mixes](https://help.dj.studio/en/articles/8106079-exporting-mixes). Current help documentation; Ableton export in supported workflows.

[^7]: DJ.Studio, Fleur van der Laan. [DJ.Studio System Requirements](https://help.dj.studio/en/articles/8121152-dj-studio-system-requirements). Current help documentation; desktop creation and mobile listening distinction.

[^8]: Ableton. [Live 12 Manual: Audio Clips, Tempo, and Warping](https://www.ableton.com/en/live-manual/12/audio-clips-tempo-and-warping/). Sections 9.2–9.3; warp markers, processing modes, and formants.

[^9]: Ableton. [All new features and updates in Live 12](https://www.ableton.com/en/live/all-new-features/). Stem Separation section; Live 12 Suite and Music.AI attribution.

[^10]: Ableton. [Live 12 Manual: Stem Separation](https://www.ableton.com/en/live-manual/12/stem-separation/). Local execution, editing, speed/quality options, and limitations.

[^11]: Music.AI. [Music AI API Overview](https://music.ai/platform/api/) and [Embedded AI](https://music.ai/embedded-ai/). Current developer offering; cloud, local, and hybrid integration options.

[^12]: Ableton. [Live 12 Manual: Audio Fact Sheet](https://www.ableton.com/en/manual/audio-fact-sheet/). Sections 38.2.2–38.2.3; neutral playback under specified conditions.

[^13]: Mashups repository, revision `b5976ef`. [Creation route](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/app/create/page.tsx), [Green studio](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/components/create/green-mashup-studio.tsx), and [demo renderer](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/lib/audio/green-demo-engine.ts#L334).

[^14]: Mashups repository, revision `b5976ef`. [Green Room processor](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/modal/green_room_processor.py#L62). Supported job type and analysis implementation.

[^15]: Mashups repository, revision `b5976ef`. [Legacy automatic mashup implementation](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/lib/data/auto-mashup.ts#L324). Rendering and source selection, including lines 490–515.

[^16]: MDN contributors. [AudioBufferSourceNode: playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate). April 10, 2025 revision; resampling behavior.

[^17]: Mashups repository, revision `b5976ef`. [Green benchmark](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/lib/audio/green-benchmark.ts#L42) and [quality-score utility](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/lib/audio/quality-score.ts#L26).

[^18]: Mashups repository, revision `b5976ef`. [Green Room quality and rights gates](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/src/lib/green-room/quality.ts). Current metric thresholds and pilot export restriction.

[^19]: Mashups repository, revision `b5976ef`. [Legacy Demucs worker](https://github.com/loftsshuki/Mashups/blob/b5976ef2ebe95b3314ec56b48552f51bf5cf0197/app/modal/demucs_app.py#L55). Model and output encoding configuration.

[^20]: Meta / Alexandre Défossez and contributors. [Demucs repository and README](https://github.com/facebookresearch/demucs). Archived January 1, 2025; model choices, output options, and maintenance status.

[^21]: Wei-Tsung Lu, Ju-Chiang Wang, Qiuqiang Kong, and Yun-Ning Hung. [Music Source Separation with Band-Split RoPE Transformer](https://arxiv.org/abs/2309.02612). 2023.

[^22]: Ju-Chiang Wang, Wei-Tsung Lu, and Minz Won. [Mel-Band RoFormer for Music Source Separation](https://arxiv.org/abs/2310.01809). 2023.

[^23]: Francesco Foscarin, Jan Schlüter, and Gerhard Widmer. [Beat This! official implementation](https://github.com/CPJKU/beat_this). ISMIR 2024; inference and licensing documentation.

[^24]: Marine Delabaere and colleagues. [AutoMashup: Automatic Music Mashups Creation](https://arxiv.org/abs/2508.06516). GRETSI 2025; directed compatibility and embedding limitations.

[^25]: Breakfast Quay / Particular Programs. [Rubber Band integration notes](https://breakfastquay.com/rubberband/integration.html) and [licensing](https://breakfastquay.com/rubberband/license.html). Offline processing, formants, timing behavior, and GPL/commercial options. Select an appropriate license before distribution.

[^26]: zplane.development. [Licensing technology catalog](https://licensing.zplane.de/technology). ELASTIQUE section; SDK availability and processing capabilities. Supplier performance descriptions require evaluation on the intended material.

[^27]: FFmpeg developers. [Audio filter documentation: loudnorm](https://github.com/FFmpeg/FFmpeg/blob/master/doc/filters.texi). Loudness and oversampled true-peak analysis.

[^28]: Apple. [Export tracks as audio files in Logic Pro for Mac](https://support.apple.com/guide/logicpro/export-tracks-as-audio-files-lgcpb27f70f9/mac). Current Logic Pro User Guide.

[^29]: Ableton. [Importing and exporting stems](https://help.ableton.com/hc/en-us/articles/360000843404-Importing-and-exporting-stems). Current technical guidance; alignment and warp settings.

[^30]: Private local v6 premaster and final WAV example, 29.80 seconds each. Measured September 12, 2026 using FFmpeg 8.1.1 with `-af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -`. Reported values are the source `input_i`, `input_tp`, and `input_lra` fields, not the discarded processed output. Audio files were neither published nor subjected to a listening panel for this report.

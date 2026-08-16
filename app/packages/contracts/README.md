# @mashups/contracts

Framework-neutral contracts shared by the Mashups web application and a future Expo client.

The package intentionally contains no React, Next.js, Supabase, filesystem, or server-only imports. It defines:

- Green Room arrangement IDs.
- Funnel event names.
- Rights, audio-quality, catalog, and pilot metric types.
- Canonical web and native creation links.

Example:

```ts
import { buildGreenCreatePath, buildGreenNativeLink } from "@mashups/contracts"

buildGreenCreatePath({ leftId: "signal-bloom", rightId: "heat-map" })
buildGreenNativeLink({ leftId: "signal-bloom", rightId: "heat-map" })
```

Native development begins only after the retention gates in `docs/NATIVE_APP_HANDOFF.md` pass.

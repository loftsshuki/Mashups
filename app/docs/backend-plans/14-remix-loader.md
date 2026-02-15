# Remix Loader / Stems Registry - Backend Plan

**Priority:** P1  
**Timeline:** 1-2 weeks (after AI Mashup)  
**Cost:** Storage only (~$0.02 per mashup)

---

## Overview

Allow users to extract and share stems from their mashups for remixing by other creators.

## Dependencies

⚠️ **Requires:** AI Magic Generator (for stem separation)

## Architecture

```
Mashup Published
    │
    ▼
Extract Stems (Demucs via AI Mashup pipeline)
    │
    ▼
Store Stems
    │
    ▼
Registry Entry Created
    │
    ▼
Available for Remix
```

## Database Schema

```sql
-- Stems registry
CREATE TABLE mashup_stems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id) ON DELETE CASCADE,
  
  -- Stem files
  vocals_url text,
  drums_url text,
  bass_url text,
  other_url text, -- Everything else
  
  -- Metadata
  duration numeric,
  bpm numeric,
  key text,
  
  -- Processing info
  extracted_at timestamp DEFAULT now(),
  extraction_job_id text,
  
  UNIQUE(mashup_id)
);

-- Remix permissions
CREATE TABLE mashup_remix_settings (
  mashup_id uuid PRIMARY KEY REFERENCES mashups(id) ON DELETE CASCADE,
  
  -- Permissions
  allow_remix boolean DEFAULT true,
  allow_download boolean DEFAULT true,
  require_attribution boolean DEFAULT true,
  allow_commercial boolean DEFAULT false,
  
  -- License
  license_type text DEFAULT 'cc-by-nc', -- Creative Commons BY-NC
  custom_license_url text,
  
  -- Stats
  remix_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  
  updated_at timestamp DEFAULT now()
);

-- Remix relationships (parent/child)
CREATE TABLE mashup_remixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_mashup_id uuid REFERENCES mashups(id),
  remix_mashup_id uuid REFERENCES mashups(id),
  
  -- Attribution
  attribution_text text,
  attribution_accepted boolean DEFAULT true,
  
  created_at timestamp DEFAULT now(),
  
  UNIQUE(original_mashup_id, remix_mashup_id)
);

-- Stem downloads (tracking)
CREATE TABLE stem_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES mashups(id),
  user_id uuid REFERENCES auth.users(id),
  stem_type text, -- 'vocals', 'drums', etc.
  downloaded_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stems_mashup ON mashup_stems(mashup_id);
CREATE INDEX idx_remixes_original ON mashup_remixes(original_mashup_id);
CREATE INDEX idx_remixes_remix ON mashup_remixes(remix_mashup_id);
```

## API Endpoints

### Get Stems
```typescript
GET /api/mashups/:id/stems

Response:
{
  "mashupId": "uuid",
  "permissions": {
    "allowRemix": true,
    "allowDownload": true,
    "requireAttribution": true,
    "license": "cc-by-nc"
  },
  "stems": {
    "vocals": {
      "url": "https://...",
      "duration": 180,
      "format": "wav"
    },
    "drums": { ... },
    "bass": { ... },
    "other": { ... }
  },
  "metadata": {
    "bpm": 128,
    "key": "Am"
  },
  "stats": {
    "downloadCount": 45,
    "remixCount": 12
  }
}
```

### Update Remix Settings
```typescript
PUT /api/mashups/:id/remix-settings

Body:
{
  "allowRemix": true,
  "allowDownload": true,
  "requireAttribution": true,
  "allowCommercial": false,
  "licenseType": "cc-by-nc"
}

Response:
{
  "success": true
}
```

### Download Stem
```typescript
POST /api/mashups/:id/stems/download

Body:
{
  "stemType": "vocals" // 'vocals' | 'drums' | 'bass' | 'other' | 'all'
}

Response:
{
  "downloadUrl": "https://.../signed-url",
  "expiresAt": "2026-02-15T12:00:00Z",
  "attribution": {
    "text": "Original: \"Summer Vibes\" by ArtistName",
    "required": true
  }
}
```

### Create Remix
```typescript
POST /api/mashups/:id/remix

Body:
{
  "mashupId": "new-mashup-uuid",
  "attributionText": "Remix of \"Summer Vibes\" by ArtistName"
}

Response:
{
  "remixId": "uuid",
  "relationshipCreated": true
}
```

### Get Remix Tree
```typescript
GET /api/mashups/:id/remixes

Response:
{
  "original": { "id", "title", "user" },
  "remixes": [
    {
      "mashup": { "id", "title", "user", "coverUrl" },
      "attribution": "...",
      "createdAt": "..."
    }
  ],
  "parent": null // If this is a remix, show original
}
```

## Implementation

### Stem Extraction Job

```typescript
// workers/stem-extraction.ts

const worker = new Worker('stem-extraction', async (job) => {
  const { mashupId, audioUrl } = job.data;

  // 1. Download audio
  const audioPath = await downloadAudio(audioUrl);

  // 2. Extract stems using Demucs
  const stemsPath = await extractStems(audioPath);

  // 3. Upload each stem
  const stems = await Promise.all([
    uploadStem(stemsPath.vocals, mashupId, 'vocals'),
    uploadStem(stemsPath.drums, mashupId, 'drums'),
    uploadStem(stemsPath.bass, mashupId, 'bass'),
    uploadStem(stemsPath.other, mashupId, 'other')
  ]);

  // 4. Get metadata
  const metadata = await analyzeAudio(audioPath);

  // 5. Store in database
  await supabase.from('mashup_stems').insert({
    mashup_id: mashupId,
    vocals_url: stems[0],
    drums_url: stems[1],
    bass_url: stems[2],
    other_url: stems[3],
    duration: metadata.duration,
    bpm: metadata.bpm,
    key: metadata.key,
    extraction_job_id: job.id
  });

  // 6. Create default remix settings
  await supabase.from('mashup_remix_settings').insert({
    mashup_id: mashupId,
    allow_remix: true,
    allow_download: true,
    require_attribution: true,
    allow_commercial: false
  });

  // Cleanup
  await cleanupFiles(audioPath, stemsPath);

}, { connection: redis });

async function extractStems(audioPath: string) {
  const outputDir = `/tmp/stems_${Date.now()}`;
  
  // Run Demucs
  await execAsync(
    `demucs --two-stems=vocals "${audioPath}" -o "${outputDir}"`
  );

  return {
    vocals: `${outputDir}/vocals.wav`,
    drums: `${outputDir}/drums.wav`,
    bass: `${outputDir}/bass.wav`,
    other: `${outputDir}/other.wav`
  };
}

async function uploadStem(
  filePath: string,
  mashupId: string,
  stemType: string
): Promise<string> {
  const file = await fs.readFile(filePath);
  const blob = await put(`stems/${mashupId}/${stemType}.wav`, file, {
    contentType: 'audio/wav',
    access: 'public'
  });
  return blob.url;
}
```

### Service Layer

```typescript
// lib/remix/service.ts

export class RemixService {
  async getStems(mashupId: string, userId: string): Promise<StemsResult> {
    // Check permissions
    const { data: settings } = await supabase
      .from('mashup_remix_settings')
      .select('*')
      .eq('mashup_id', mashupId)
      .single();

    if (!settings?.allow_download) {
      throw new Error('Stems not available for download');
    }

    // Get stems
    const { data: stems } = await supabase
      .from('mashup_stems')
      .select('*')
      .eq('mashup_id', mashupId)
      .single();

    if (!stems) {
      throw new Error('Stems not found');
    }

    return {
      stems,
      permissions: settings,
      attribution: await this.getAttribution(mashupId)
    };
  }

  async createRemix(
    originalId: string,
    remixId: string,
    userId: string,
    attributionText: string
  ): Promise<void> {
    // Verify permissions
    const { data: settings } = await supabase
      .from('mashup_remix_settings')
      .select('*')
      .eq('mashup_id', originalId)
      .single();

    if (!settings?.allow_remix) {
      throw new Error('Remixing not allowed');
    }

    // Create relationship
    await supabase.from('mashup_remixes').insert({
      original_mashup_id: originalId,
      remix_mashup_id: remixId,
      attribution_text: attributionText,
      attribution_accepted: !settings.require_attribution
    });

    // Increment remix count
    await supabase.rpc('increment_remix_count', {
      mashup_id: originalId
    });
  }

  async downloadStem(
    mashupId: string,
    stemType: string,
    userId: string
  ): Promise<{ url: string; attribution: string }> {
    // Track download
    await supabase.from('stem_downloads').insert({
      mashup_id: mashupId,
      user_id: userId,
      stem_type: stemType
    });

    // Increment count
    await supabase.rpc('increment_download_count', {
      mashup_id: mashupId
    });

    // Generate signed URL
    const { data: stems } = await supabase
      .from('mashup_stems')
      .select(`${stemType}_url`)
      .eq('mashup_id', mashupId)
      .single();

    const url = await generateSignedUrl(stems[`${stemType}_url`], 3600);

    return {
      url,
      attribution: await this.getAttribution(mashupId)
    };
  }

  private async getAttribution(mashupId: string): Promise<string> {
    const { data: mashup } = await supabase
      .from('mashups')
      .select('title, user:users(name)')
      .eq('id', mashupId)
      .single();

    return `Original: "${mashup.title}" by ${mashup.user.name}`;
  }
}
```

## Remix Tree UI

```tsx
// components/remix/remix-tree.tsx
interface RemixTreeProps {
  mashupId: string;
}

export function RemixTree({ mashupId }: RemixTreeProps) {
  const [tree, setTree] = useState<RemixTreeData | null>(null);

  useEffect(() => {
    fetch(`/api/mashups/${mashupId}/remixes`)
      .then(r => r.json())
      .then(setTree);
  }, [mashupId]);

  if (!tree) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Original */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <span className="text-xs text-slate-400">Original</span>
        <MashupCard mashup={tree.original} />
      </div>

      {/* Remixes */}
      {tree.remixes.length > 0 && (
        <div className="pl-8 border-l-2 border-slate-700 space-y-4">
          <span className="text-xs text-slate-400">
            {tree.remixes.length} Remix{tree.remixes.length !== 1 ? 'es' : ''}
          </span>
          {tree.remixes.map(remix => (
            <MashupCard
              key={remix.mashup.id}
              mashup={remix.mashup}
              subtitle={remix.attribution}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Cost Breakdown

| Component | Size | Cost (per 1000 mashups) |
|-----------|------|-------------------------|
| Stems storage (4 x ~10MB) | 40MB | $2.00 |
| Processing | One-time | Included in AI Mashup |
| Bandwidth | Variable | ~$0.50 |
| **Total** | | **~$2.50 per 1000 mashups** |

---

*Backend Plans Complete*
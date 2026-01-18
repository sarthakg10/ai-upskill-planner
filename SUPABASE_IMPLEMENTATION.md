# Implementation Summary: Supabase Lead Capture

## ✅ All Files Created/Modified

### 1. .gitignore (MODIFIED)
```gitignore
# Added:
.env.local
.env*.local
```

### 2. .env.local.example (CREATED)
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### 3. lib/supabaseServer.ts (CREATED)
```typescript
import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}
```

### 4. lib/leadScoring.ts (CREATED)
```typescript
import { UpskillInputs } from './types';

export function scoreLead(inputs: UpskillInputs): number {
  let score = 0;

  if (inputs.targetGoal.toLowerCase().includes('ai')) {
    score += 30;
  }

  if (inputs.weeklyHours >= 5) {
    score += 20;
  }

  if (inputs.commuteMinutesPerDay >= 60) {
    score += 10;
  }

  if (inputs.notes) {
    const notesLower = inputs.notes.toLowerCase();
    const keywords = ['single', 'mother', 'child', 'deadline', 'burnout'];

    if (keywords.some((keyword) => notesLower.includes(keyword))) {
      score += 20;
    }
  }

  return Math.min(score, 100);
}
```

### 5. app/api/leads/route.ts (CREATED)
- Endpoint: POST /api/leads
- Validates email format
- Calculates lead score
- Inserts into `leads` table
- Inserts into `events` table (type: "lead_captured")
- Returns: `{ ok: true, lead_score }`

### 6. app/api/track/route.ts (CREATED)
- Endpoint: POST /api/track
- Accepts: { email?, event_type, meta? }
- Inserts into `events` table
- Returns: `{ ok: true }`

### 7. app/convert/page.tsx (UPDATED)
- Email capture form at top
- Consent checkbox required
- On page load: tracks `convert_page_view` event
- On submit: POST /api/leads, shows success, stores lead_email
- CTA buttons track events before navigating

---

## 📁 Project Structure

```
ai-upskill-planner/
├── .env.local                    (CREATE THIS - not in repo)
├── .env.local.example            (✓ created)
├── .gitignore                    (✓ updated)
├── lib/
│   ├── supabaseServer.ts         (✓ created)
│   ├── leadScoring.ts            (✓ created)
│   ├── types.ts                  (existing)
│   ├── storage.ts                (existing)
│   ├── validation.ts             (existing)
│   └── ai/
│       ├── planSchema.ts         (existing)
│       ├── openaiClient.ts       (existing)
│       └── generatePlanWithAI.ts (existing)
├── app/
│   ├── page.tsx                  (existing)
│   ├── layout.tsx                (existing)
│   ├── plan/
│   │   └── page.tsx              (existing)
│   ├── convert/
│   │   └── page.tsx              (✓ updated)
│   └── api/
│       ├── generate-plan/
│       │   └── route.ts          (existing)
│       ├── leads/
│       │   └── route.ts          (✓ created)
│       └── track/
│           └── route.ts          (✓ created)
└── package.json
```

---

## 🚀 Quick Start

### 1. Create `.env.local`
```bash
# In project root, create .env.local with:
SUPABASE_URL=https://xwvsybuvxeeauoqjbjim.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_rotated_secret_key>
OPENAI_API_KEY=<optional>
```

### 2. Create Supabase Tables
In Supabase dashboard, run:
```sql
-- leads table
CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  target_goal VARCHAR(255) NOT NULL,
  lead_score INTEGER DEFAULT 0,
  inputs JSONB,
  plan JSONB,
  source VARCHAR(50) DEFAULT 'web',
  created_at TIMESTAMP DEFAULT NOW()
);

-- events table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Run App
```bash
npm run dev
```

---

## 📊 Lead Scoring Breakdown

```
Lead Example 1:
- Target: "AI/ML Engineer" → +30
- Weekly Hours: 8 → +20
- Commute: 120 min → +10
- Notes: "Burnout" keyword → +20
TOTAL: 80 (Hot Lead)

Lead Example 2:
- Target: "Backend Engineer" → +0
- Weekly Hours: 3 → +0
- Commute: 30 min → +0
- Notes: none → +0
TOTAL: 0 (Cold Lead)
```

---

## 🔍 Events Tracked

| Event | API Call | Meta |
|-------|----------|------|
| convert_page_view | Automatic on page load | {} |
| lead_captured | POST /api/leads success | lead_score, target_goal |
| cta_click_free_class | CTA button click | target_goal, lead_score |
| cta_click_consult | CTA button click | target_goal, lead_score |

---

## 🧪 Test Flow

1. Go to http://localhost:3000
2. Fill form, click "Generate My Plan"
3. See plan, click "Email Me This Plan"
4. Enter email: `test@example.com`
5. Check "Send me the plan & reminders"
6. Click "Save My Plan"
7. See success, CTA buttons appear
8. Click "Register for Free Class" → event tracked
9. Check Supabase:
   - `leads` table has 1 row with lead_score
   - `events` table has entries:
     - convert_page_view
     - lead_captured
     - cta_click_free_class

---

## 🔐 Security

- ✅ No hardcoded credentials
- ✅ `.env.local` gitignored
- ✅ `.env.local.example` safe to commit
- ✅ Email validation
- ✅ No secrets in error messages
- ✅ Server-side only Supabase calls

---

## 📝 Environment Variable Instructions

**Tell your team this:**

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Then fill in your values:
```env
SUPABASE_URL=https://xwvsybuvxeeauoqjbjim.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_rotating_secret_key_here>
OPENAI_API_KEY=sk-proj-... (optional)
```

⚠️ **Never commit `.env.local` to git!**

---

## 🎯 Verification Checklist

- [ ] `.env.local` created (not committed)
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] Supabase `leads` table created
- [ ] Supabase `events` table created
- [ ] `npm run dev` starts without errors
- [ ] Can reach http://localhost:3000
- [ ] Can submit form and generate plan
- [ ] Can navigate to /convert
- [ ] Can submit email
- [ ] Lead appears in Supabase `leads` table
- [ ] Event appears in Supabase `events` table

---

## 🚀 Status: COMPLETE

All code created, environment setup documented, ready for testing!

# 🔍 Debugging Guide: Supabase + OpenAI

## ✅ Test 1: Verify Supabase Connection

### Step 1: Check Browser Network
1. Open http://localhost:3000
2. Press **F12** (DevTools)
3. Go to **Network** tab
4. Fill out landing form (set weeklyHours to **10**)
5. Click "Generate My Plan"
6. Look for these requests:

| Request | Expected | What to Check |
|---------|----------|---|
| `/api/generate-plan` | 200 ✅ | Click → Response tab → see full JSON plan |
| `/api/leads` | 200 ✅ | At /convert page, after email submit |
| `/api/track` | 200 ✅ | When you click CTA buttons |

**If you see 500 errors:** Check Response tab for error message

### Step 2: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run these queries:

**Check Leads:**
```sql
SELECT email, full_name, target_goal, lead_score, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 1;
```

**Check Events:**
```sql
SELECT event_type, email, created_at 
FROM events 
ORDER BY created_at DESC 
LIMIT 10;
```

Expected results:
- ✅ Leads table has 1+ rows with your email
- ✅ Events table shows: `convert_page_view`, `lead_captured`, `cta_click_*` events

---

## ✅ Test 2: Debug the 10h vs 5h Issue

### Root Cause Analysis

The problem: You enter `weeklyHours: 10` but plan shows 5 hours

This could be:
1. **AI is not reading weeklyHours correctly**
2. **AI is hardcoding 5 hours in schedule** (ignoring input)
3. **AI generates duration_min correctly but UI displays it wrong**

### Debug Steps:

#### Step A: Check the Raw API Response

1. Open DevTools → Network tab
2. Generate a plan with `weeklyHours: 10`
3. Find `POST /api/generate-plan` request
4. Click on it → **Response** tab
5. Look for this section:

```json
{
  "weekly_schedule": [
    {
      "day": "Monday",
      "slot": "...",
      "duration_min": 45,  ← THIS NUMBER
      "task": "..."
    },
    ...
  ]
}
```

**✅ If duration_min is 45-60:** OpenAI is working correctly ✅
**❌ If duration_min is 300 (5 hours):** AI is wrong, not respecting input

#### Step B: Check localStorage

1. Open DevTools → **Application** tab
2. Click **Local Storage** → http://localhost:3000
3. Look for `upskill_plan` key
4. Click it, expand JSON
5. Find `weekly_schedule` → check `duration_min` values

This shows what was **saved** vs what's **displayed**.

#### Step C: Check Terminal Logs

When you run `npm run dev`, watch the **terminal output**:

```bash
npm run dev
```

When generating plan, you should see:
```
[API] POST /api/generate-plan called
[OpenAI] Sending request to Claude...
[OpenAI] Response received (3000 chars)
[Cache] Storing plan in cache
[Response] Returning plan with 7 schedule items
```

If you see errors like `OPENAI_API_KEY is not set`, OpenAI isn't connected.

---

## ✅ Test 3: Verify OpenAI Specifically

### Check 1: Environment Variables

Run this in your terminal:
```powershell
$env:OPENAI_API_KEY
```

Should show your actual key starting with `sk-proj-`

If empty → `.env.local` not being read ❌

### Check 2: Test OpenAI Directly

Create a temporary test file `test-openai.js`:

```javascript
const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  const msg = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: "Say 'OpenAI is working' if you see this",
      },
    ],
  });
  console.log("✅ OpenAI Connected!");
  console.log(msg.content[0]);
}

test().catch(console.error);
```

Run:
```bash
node test-openai.js
```

Expected output: `✅ OpenAI Connected!` + response

---

## ✅ Test 4: Full Funnel Test Checklist

### Step 1: Landing Page (/)
- [ ] Fill out form
- [ ] Set `weeklyHours` to **10**
- [ ] Click "Generate My Plan"
- [ ] Wait 5 seconds

**Expected:** See a plan page with your information

**Check:** Open DevTools → Network → see `/api/generate-plan` returned 200

---

### Step 2: Plan Page (/plan)
- [ ] Should see your 12-week roadmap
- [ ] Should see weekly schedule with `duration_min` values
- [ ] **Duration should show as: 45-60 min per session** (NOT 300 = 5 hours)
- [ ] Click "Email Me This Plan"

**Debug the 5h issue here:**
- Open DevTools → Console
- Paste:
```javascript
JSON.parse(localStorage.getItem('upskill_plan')).weekly_schedule.forEach(s => {
  console.log(s.day, s.duration_min, "minutes");
});
```
- Press Enter
- Should show: `Monday 45 minutes`, `Tuesday 45 minutes`, etc.

**If showing 300:** AI generated 5 hours, need to fix prompt

---

### Step 3: Convert Page (/convert)
- [ ] Page loads
- [ ] Check Supabase: `events` table should have 1 `convert_page_view` event
- [ ] Enter email
- [ ] Check consent checkbox
- [ ] Click "Save My Plan"

**Expected:** Success message + localStorage has `lead_email` + Supabase has new lead

**Check:**
```sql
SELECT * FROM leads WHERE email = 'your-test@email.com' LIMIT 1;
```

Should show 1 row with your lead_score

---

### Step 4: Check Events
- [ ] Click "Register Free Class" button
- [ ] Check Supabase Events table:

```sql
SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type;
```

**Expected:**
```
convert_page_view    | 1
lead_captured        | 1
cta_click_free_class | 1
```

---

## 🚨 Troubleshooting

### Problem: "SUPABASE_URL is not set"
**Solution:**
1. Verify `.env.local` exists in project root (not in parent folder)
2. Check file path: `C:\Users\ADMIN\OneDrive\Desktop\project\ai-upskill-planner\.env.local`
3. Restart dev server: `npm run dev`

### Problem: "OPENAI_API_KEY is not set"
**Solution:** 
1. Check `.env.local` has the key
2. Key should start with `sk-proj-`
3. Restart dev server

### Problem: Plan shows 5 hours but I entered 10
**Solution:**
This is likely an AI instruction issue. The prompt in `lib/ai/generatePlanWithAI.ts` says:
```
If weeklyHours <= 3: weekday sessions 20-30 min
If weeklyHours > 3: weekday sessions 30-45 min
```

But Claude might be interpreting `weekly_schedule` as total hours per day, not per session.

**Quick Fix:** Tell me what the actual response JSON shows for:
- Did you enter 10 in the form?
- What does `duration_min` show in the response?
- What does the page display?

---

## 📊 Quick Status Check

Run this SQL to see everything working:

```sql
SELECT 
  'leads' as table_name, 
  COUNT(*) as row_count
FROM leads

UNION ALL

SELECT 
  'events' as table_name, 
  COUNT(*) as row_count
FROM events;
```

Expected output:
```
leads   | 1+
events  | 3+
```

---

## 💡 Pro Tips

1. **Always check Network tab first** - 90% of issues are visible there
2. **Check Supabase dashboard in real-time** - See data appear as you test
3. **Use localStorage in DevTools** - See what the app saved before sending to API
4. **Watch terminal logs** - Any errors from backend show there

Let me know what you find! 🚀

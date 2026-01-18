# Quick Reference: OpenAI Integration

## Files Added/Modified

```
lib/ai/
├── planSchema.ts          (NEW) Zod validation for UpskillPlan
├── openaiClient.ts        (NEW) OpenAI singleton client
└── generatePlanWithAI.ts  (NEW) AI generation with retry & timeout

app/api/generate-plan/
└── route.ts               (UPDATED) Rate limiting + caching + fallback
```

## Core Features

| Feature | Details |
|---------|---------|
| **AI Model** | Claude 3.5 Sonnet |
| **Timeout** | 12 seconds |
| **Retry** | 1 automatic retry on validation fail |
| **Rate Limit** | 30 requests/minute per IP |
| **Cache TTL** | 24 hours |
| **Fallback** | Deterministic plan (production-safe) |

## API Response Format

Always returns: `UpskillPlan`
- 5 prioritized skills (priority 1-5)
- 12 weeks of roadmap
- 7-day schedule (Mon-Sun)
- 4-6 burnout tips
- 3 next actions

## Error Handling

```
AI Timeout/Error
  ↓
Fallback to Deterministic
  ↓
Cache Result
  ↓
Return Same Schema
```

User sees: ✅ No difference (always gets valid plan)
Dev sees: ⚠️ Console logs for debugging

## Environment Variable

```bash
set OPENAI_API_KEY=sk-proj-...
```

(Already set in your terminal)

## Testing

### Quick Test
1. http://localhost:3000
2. Fill form, submit
3. Check console for: `Generating plan with AI...`

### Cache Test
1. Submit same form again
2. Check console for: `Returning cached plan...`
3. Response is instant (no API call)

### Fallback Test
1. Unset OPENAI_API_KEY temporarily
2. Submit form
3. Check console for: `AI generation failed, falling back...`
4. Plan still generates correctly

## Monitoring

### Console Logs
```
✓ Generating plan with AI for input hash: abc123...
✓ Returning cached plan for input hash: abc123...
⚠ AI generation failed, falling back to deterministic plan: [reason]
⚠ Rate limit exceeded. Try again in 45 seconds.
```

### Metrics to Track
- Cache hit rate (should be high for same users)
- API timeout rate (should be ~0)
- Fallback usage rate (normal = low)
- Average response time

## Configuration Quick Edit

In `app/api/generate-plan/route.ts`:

```typescript
// Line ~17: Rate limiting
const RATE_LIMIT_MAX = 30;  // ← change this

// Line ~87: Cache TTL
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;  // ← change this

// In generatePlanWithAI.ts Line ~94: Timeout
setTimeout(() => reject(...), 12000)  // ← change this (milliseconds)
```

## Production Deployment

1. Set `OPENAI_API_KEY` in your deployment environment (not git)
2. Monitor error rates in first week
3. Adjust rate limits based on actual usage
4. Consider Redis for distributed caching if multi-server
5. Add error tracking (Sentry, DataDog, etc.)

## Known Limitations

- Cache is in-memory (lost on server restart)
- Rate limiting is per-server (not distributed)
- No API key rotation built-in
- Deterministic fallback is "good enough" not "optimized"

## Next Steps (Optional)

- [ ] Add Resend for actual email sending
- [ ] Connect to database to persist plans
- [ ] Add Stripe payment integration
- [ ] Build email template system
- [ ] Add user authentication
- [ ] Migrate cache to Redis
- [ ] Add analytics dashboard

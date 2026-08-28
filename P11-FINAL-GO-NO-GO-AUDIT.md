# P11 — FINAL PRODUCTION READINESS AUDIT (GO / NO-GO)

## Executive Summary

| Metric | Value |
|---|---|
| Lint | PASS (0 errors, 0 warnings) |
| Build | PASS (31 routes, 0 errors) |
| Tests | 305/305 PASS (9 suites, 16 P10 regression tests) |
| npm audit | 3 high (deepmerge-ts in Prisma config dependency — not user-exploitable) |
| P9 blockers fixed | 6/6 (P0-1, P0-2, P1-3, P1-4, P1-5, P1-6) |
| New findings | 4 medium, 6 low/info |
| **Decision** | **🟠 NEEDS HARDENING** |

---

## 🔴 BLOCKING ISSUES (0)

None of the P9 critical/high blockers remain. The 6 remediation items from P10 are verified as fixed in code.

---

## 🟠 MEDIUM-SEVERITY FINDINGS

### M1 — Banned User Session Continuity

| Attribute | Value |
|---|---|
| Severity | MEDIUM |
| File | `src/lib/auth.ts:47-53, 95-97` |
| Status | **NOT VERIFIED — no fix in P10** |

**Finding:** The ban check only runs inside the `Credentials` provider `authorize()` function (line 47). Once a JWT is issued, there is no mechanism to revoke it. A user banned by IP can continue using a pre-existing JWT session for its entire 30-day lifetime. The `signIn` callback (line 95) returns `true` unconditionally — Google OAuth logins are never checked against the ban list at all. No `middleware.ts` exists. No API route (other than the ban management endpoint itself) checks ban status.

**Impact:** Banned users retain full access until their JWT expires or they log out and back in (only for credential users — OAuth banned users are never blocked).

**Recommendation:** Add a ban check in the `session` callback or create `middleware.ts` that validates ban status on every authenticated request.

---

### M2 — No Prisma Migrations Directory

| Attribute | Value |
|---|---|
| Severity | MEDIUM |
| Path | `prisma/migrations/` — does not exist |
| Status | **NOT VERIFIED** |

**Finding:** The `prisma/migrations/` directory does not exist. The `ModerationAction` model was added to `schema.prisma` in P10, but no migration file was generated. On deployment, `npx prisma migrate deploy` will fail or skip the new table unless migrations are generated and committed first.

**Impact:** The `ModerationAction` table will not exist in the production database. Admin moderation actions will throw a Prisma error when attempting to persist.

**Recommendation:** Run `npx prisma migrate dev --name add-moderation-action` to generate the migration file, commit it, and ensure it runs during deployment.

---

### M3 — No Pagination on List Endpoints

| Attribute | Value |
|---|---|
| Severity | MEDIUM |
| Files | `src/app/api/posts/route.ts:35-54`, `src/app/api/appreciations/route.ts:21-24`, `src/app/api/letters/route.ts:45-48`, `src/app/api/photos/route.ts:30-33`, `src/app/api/reports/route.ts:20-22` |
| Status | **NOT VERIFIED — no fix in P10** |

**Finding:** All five GET list endpoints return unbounded result sets. No `take`, `skip`, or cursor-based pagination exists. As the database grows, these endpoints will degrade in memory usage and response time. A malicious client can force the server to load the entire table into memory.

**Impact:** Memory exhaustion under load; poor performance at scale.

**Recommendation:** Add `take: 50` (or appropriate limit) with cursor/skip pagination to all list endpoints.

---

### M4 — No Deployment Configuration

| Attribute | Value |
|---|---|
| Severity | MEDIUM |
| Status | **NOT VERIFIED** |

**Finding:** No Dockerfile, `vercel.json`, CI/CD pipeline, or any deployment manifest exists. No health check endpoint (`/api/health`) exists. The `next.config.ts` does not set `output: 'standalone'` (required for Docker). The `start` script (`next start`) is present.

**Impact:** Cannot deploy without manual configuration. No automated deployment path.

**Recommendation:** Add at minimum a health check endpoint and a Dockerfile (or platform-specific config).

---

## 🟡 LOW-SEVERITY FINDINGS

### L1 — CSP Allows `unsafe-inline` and `unsafe-eval`

| Attribute | Value |
|---|---|
| Severity | LOW |
| File | `next.config.ts:46` |
| Status | **PARTIAL — design trade-off** |

**Finding:** `script-src` includes `'unsafe-inline' 'unsafe-eval'`. This significantly weakens CSP. Required by Next.js in development; should use nonces or hashes in production.

**Impact:** Inline script injection is not blocked by CSP.

---

### L2 — localStorage Stores Application Data

| Attribute | Value |
|---|---|
| Severity | LOW |
| File | `src/lib/storage.ts` |
| Status | **NOT VERIFIED — architectural** |

**Finding:** 10 localStorage keys store application data (posts, appreciations, stories, reports, letters, profiles, saved items, track comforts, unlocked photocards). Only `seven_prefs.theme` is a legitimate UI preference. This creates a dual-storage architecture where database and localStorage can diverge. Data is lost on browser clear, is not synced across devices, and cannot be managed by admins.

**Impact:** Data inconsistency; no admin visibility; data loss on browser clear.

---

### L3 — In-Memory Rate Limiter

| Attribute | Value |
|---|---|
| Severity | LOW |
| File | `src/lib/rate-limit.ts:14` |
| Status | **BY DESIGN — documented** |

**Finding:** Rate limiter uses `new Map()` — per-process, resets on restart, not shared across instances. This is explicitly documented in the file header and is acceptable for single-server `next start` deployment.

---

### L4 — Upload Storage Missing Traversal Guards

| Attribute | Value |
|---|---|
| Severity | LOW |
| File | `src/lib/upload/storage.ts:23, 60, 70` |
| Status | **NOT VERIFIED** |

**Finding:** `storagePut`, `storageExists`, and `storageStat` lack the `path.resolve().startsWith(BASE_DIR)` guard that exists in `storageDelete`. Safe in practice because `generateStorageKey` controls all path segments, but missing defense-in-depth.

---

### L5 — MIME Mismatch Check Is Partial

| Attribute | Value |
|---|---|
| Severity | LOW |
| File | `src/lib/upload/validation.ts:83-91` |
| Status | **NOT VERIFIED** |

**Finding:** Only GIF, SVG, and HTML MIME mismatches are explicitly blocked. Other mismatches (e.g., PDF claiming to be JPEG) silently pass. Low risk because magic-byte detection is authoritative and files are re-encoded by `processImage`.

---

### L6 — Posts PATCH Handler Incomplete

| Attribute | Value |
|---|---|
| Severity | LOW (functional, not security) |
| File | `src/app/api/posts/route.ts:148-174` |
| Status | **NOT VERIFIED** |

**Finding:** The PATCH handler for like/unlike finds the post but does not persist the action to the database. The endpoint returns successfully without saving.

---

## 🟢 VERIFIED PASS (All P10 Fixes Confirmed)

| # | Item | Evidence |
|---|---|---|
| V1 | NEXTAUTH_SECRET rotated | `.env` has `w1khxVWwDxKqcLWqDD2hnVj8w3pA/ejZ7PvEY6qnaWk=` — random base64 |
| V2 | Old secret removed from source | Grep for `seven-appreciation-secret-key-2026` in `src/` returns 0 matches |
| V3 | `.env` gitignored | `.env*` pattern in `.gitignore` line 38 |
| V4 | No `.env` in git | `git ls-files -- '*.env*'` returns empty |
| V5 | `.env.example` has placeholders only | `<GENERATE_A_SECURE_SECRET>`, no real values |
| V6 | No auto-user-creation in `authorize()` | `src/lib/auth.ts` — zero `prisma.user.create` calls |
| V7 | No OAuth password backfill | `src/lib/auth.ts` — zero `prisma.user.update` calls |
| V8 | Unknown emails rejected | `src/lib/auth.ts:57` — throws `"Account not found"` |
| V9 | OAuth-only accounts rejected | `src/lib/auth.ts:66` — throws `"This account uses social login"` |
| V10 | Rate limiting on login (IP + email) | `src/lib/auth.ts:36-44` — two `checkRateLimit` calls |
| V11 | IP ban check on login | `src/lib/auth.ts:47-53` — `prisma.bannedIP.findUnique` |
| V12 | Registration: Zod + rate limit + bcrypt + role=user + dup check | `src/app/api/auth/register/route.ts` — all 5 verified |
| V13 | Letters: unauthenticated sees `shared` only | `src/app/api/letters/route.ts:39` — `{ visibility: 'shared' }` |
| V14 | Letters: authenticated sees `shared` + own private | `src/app/api/letters/route.ts:32-38` — `OR` clause |
| V15 | Letters: POST requires auth | `src/app/api/letters/route.ts:58-61` — session check |
| V16 | Ban: admin-only POST | `src/app/api/ban/route.ts:27` — role check |
| V17 | Ban: `bannedBy` from session, not body | `src/app/api/ban/route.ts:35,42` — destructures `{ip,reason}`, uses `session.user.id` |
| V18 | Report action: admin-only, validates action, persists ModerationAction | `src/app/api/reports/[id]/action/route.ts` — all verified |
| V19 | Report action: `adminId` from session | `src/app/api/reports/[id]/action/route.ts:52` — `session.user.id` |
| V20 | Reports GET: admin-only | `src/app/api/reports/route.ts:12-14` — role check |
| V21 | Admin layout: server-side check | `src/app/admin/layout.tsx:11-16` — `getServerSession` + `redirect` |
| V22 | Admin page: moderation via fetch to API | `src/app/admin/page.tsx:107` — `fetch('/api/reports/${id}/action')` |
| V23 | Admin page: no `bannedBy` in ban body | `src/app/admin/page.tsx:82-85` — `{ip, reason}` only |
| V24 | All write endpoints: userId from session | posts, appreciations, photos, follow, block, uploads — all use `session.user.id` |
| V25 | Upload: auth, rate limit, ownership, validation | `src/app/api/uploads/route.ts` + `[id]/route.ts` — all verified |
| V26 | No `innerHTML`, `eval()`, `new Function()` | Grep returns 0 matches across `src/` |
| V27 | Single `dangerouslySetInnerHTML` is static script | `src/app/layout.tsx:36-38` — hardcoded dark-mode FOUC prevention |
| V28 | Security headers present | HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy |
| V29 | ModerationAction model in schema with relations | `prisma/schema.prisma:196-208` — indexes, cascade delete |
| V30 | bcrypt cost 10 | `src/app/api/auth/register/route.ts:52` |
| V31 | Payload size limit (512KB) | `src/lib/rate-limit.ts:171-182` |
| V32 | Security event logging | `src/lib/security-logger.ts` — structured logging on all auth events |
| V33 | Storage quota (100MB/user), file count cap (50/user) | `src/app/api/uploads/route.ts:58-78` |
| V34 | Magic byte detection (JPEG, PNG, WebP) | `src/lib/upload/validation.ts:4-8` |
| V35 | Upload delete: path traversal guard | `src/lib/upload/storage.ts:46-51` — `resolved.startsWith(baseResolved)` |
| V36 | In-memory rate limiter: cleanup every 5min | `src/lib/rate-limit.ts:20-36` |

---

## SCORE BREAKDOWN

| Category | Score | Notes |
|---|---|---|
| Authentication | 9/10 | Solid; M1 (ban session gap) prevents 10/10 |
| Authorization | 10/10 | Admin checks server-side, IDOR-safe |
| Data Protection | 8/10 | V25 (M2 migration gap), L2 (localStorage misuse) |
| Input Validation | 9/10 | Zod + magic bytes; L5 (partial MIME check) |
| Rate Limiting | 9/10 | Comprehensive policies; L3 (in-memory by design) |
| Security Headers | 8/10 | Strong set; L1 (CSP unsafe-inline/eval) |
| Upload Security | 9/10 | Multi-layer; L4 (missing traversal guards on 3 functions) |
| Error Handling | 9/10 | Structured logging, no stack traces exposed |
| Infrastructure | 6/10 | L4 (no deployment config), L6 (no health check) |
| Testing | 10/10 | 305/305, regression tests, lint clean |
| **Overall** | **8.7/10** | |

---

## FINAL DECISION

### 🟠 NEEDS HARDENING

**The 6 P9 critical/high security blockers are fully resolved.** The codebase is fundamentally secure for authentication, authorization, data protection, and input validation. However, 4 medium-severity findings prevent a clean PRODUCTION READY:

1. **M1 — Banned user session continuity** (security gap)
2. **M2 — Missing Prisma migration** (deployment will fail)
3. **M3 — No pagination on list endpoints** (DoS risk at scale)
4. **M4 — No deployment configuration** (cannot deploy)

These are fixable in a focused hardening pass (estimated 2-4 hours). None require architectural changes.

### Conditions for 🟢 READY FOR PRODUCTION

Before deploying, resolve at minimum:

1. **M2** — Run `npx prisma migrate dev --name add-moderation-action` and commit the migration
2. **M1** — Add ban status check in `session` callback or `middleware.ts`
3. **M3** — Add `take: 50` (or appropriate) to all 5 list endpoints
4. **M4** — Add a health check endpoint (`GET /api/health`)

Then re-run P11 verification.

---

## APPENDIX: VERIFICATION METHOD

All findings are based on **actual code inspection** — reading source files, running grep searches, and executing lint/build/test commands. No assumptions were made about code that was not read. Items marked "NOT VERIFIED" are confirmed as not addressed in P10 code changes.

| Command | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | 31 routes, clean build |
| `npm test` | 305/305 PASS (9 suites) |
| `npm audit` | 3 high (deepmerge-ts — not user-exploitable) |
| `git ls-files -- '*.env*'` | Empty (no .env in git) |

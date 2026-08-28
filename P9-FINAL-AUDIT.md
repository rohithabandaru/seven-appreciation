# SEVEN APPRECIATION
# FINAL PRODUCTION READINESS AUDIT

## Executive Summary

The Seven Appreciation & Support Community is a fan community platform built with Next.js 16, NextAuth.js, Prisma ORM, PostgreSQL, and local file storage. The application enforces a "support without attacking anyone else" content philosophy with server-side moderation.

**Build:** PASS (clean build, no errors)
**Lint:** PASS (0 warnings/errors)
**Tests:** 289/289 PASS (9 test suites)
**Overall Classification: 🟠 NEEDS HARDENING**

The application demonstrates a solid architectural foundation with meaningful security controls (rate limiting, content moderation, upload validation, content security policy). However, several critical and high-severity findings must be resolved before production launch, most notably a committed weak NEXTAUTH_SECRET, auto-account-creation in the credentials authorize function, and private letters exposed to unauthenticated users.

---

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.1 (Turbopack) |
| Runtime | Node.js |
| Language | TypeScript |
| Auth | NextAuth.js (JWT strategy) |
| Database | PostgreSQL (Prisma ORM 7.x) |
| Upload Storage | Local filesystem (`public/uploads/`) |
| Image Processing | Sharp |
| Rate Limiting | In-memory sliding window |
| Moderation | Server-side regex content filter |
| Testing | Jest |

### Route Inventory (from build output)

| Route | Type |
|---|---|
| `/` | Static |
| `/achievements` | Static |
| `/appreciation` | Static |
| `/binder` | Static |
| `/community` | Static |
| `/gallery` | Static |
| `/guidelines` | Static |
| `/login` | Static |
| `/members` | Static |
| `/profile` | Static |
| `/search` | Static |
| `/stories` | Static |
| `/admin` | Dynamic (auth-gated) |
| `/members/[slug]` | Dynamic |
| `/profile/[username]` | Dynamic |
| `/api/auth/[...nextauth]` | Dynamic |
| `/api/auth/register` | Dynamic |
| `/api/posts` | Dynamic |
| `/api/posts/[postId]/comments` | Dynamic |
| `/api/appreciations` | Dynamic |
| `/api/letters` | Dynamic |
| `/api/milestones` | Dynamic |
| `/api/photos` | Dynamic |
| `/api/reports` | Dynamic |
| `/api/uploads` | Dynamic |
| `/api/uploads/[id]` | Dynamic |
| `/api/ban` | Dynamic |
| `/api/users/follow` | Dynamic |
| `/api/users/block` | Dynamic |

---

## Production Environment

| Item | Status | Evidence |
|---|---|---|
| Hosting platform | NOT VERIFIED | No deployment config found |
| NODE_ENV | NOT VERIFIED | Set by hosting platform |
| Database | PostgreSQL via Prisma | `prisma/schema.prisma` |
| Storage | Local filesystem | `src/lib/upload/storage.ts` |
| HTTPS | NOT VERIFIED | `Strict-Transport-Security` header configured in `next.config.ts` |
| Domain | NOT VERIFIED | No domain config found |

---

## Feature Verification

| Feature | Status | Evidence | Severity |
|---|---|---|---|
| Homepage | WORKING | Build passes, static render | - |
| Members | WORKING | Build passes, static render | - |
| Member details | WORKING | Dynamic route `[slug]` renders | - |
| Appreciation wall | WORKING | API GET returns data, FeedPageShell renders | - |
| Community feed | WORKING | API GET returns posts, FeedPageShell renders | - |
| Stories | WORKING | Static page with localStorage fallback | - |
| Achievements | WORKING | Static page | - |
| Guidelines | WORKING | Static page | - |
| Search | WORKING | Client-side search on members/posts/appreciations | - |
| Profile | WORKING | Dynamic route `[username]` renders | - |
| Authentication (register) | WORKING | POST /api/auth/register with Zod + rate limit | - |
| Authentication (login) | WORKING | NextAuth CredentialsProvider | - |
| Authentication (logout) | WORKING | signOut() clears JWT cookie | - |
| Admin dashboard | PARTIALLY WORKING | Server+client auth enforced; non-ban moderation actions are client-side only, not persisted | HIGH |
| Reports (submit) | WORKING | POST /api/reports creates DB record | - |
| Reports (view) | WORKING | GET /api/reports admin-only | - |
| Uploads | WORKING | Full pipeline: validation, processing, storage, DB record | - |
| Likes (appreciations) | WORKING | PATCH /api/appreciations with DB persistence | - |
| Likes (posts) | BROKEN | PATCH /api/posts like/unlike is a no-op — finds post and returns it without recording like | HIGH |
| Comments | WORKING | POST /api/posts/[postId]/comments | - |
| Follow | WORKING | POST /api/users/follow with DB persistence | - |
| Block | WORKING | POST /api/users/block with DB persistence | - |
| Saved items | PARTIALLY WORKING | localStorage only — not persisted to DB | MEDIUM |
| Photocards | PARTIALLY WORKING | Binder page uses localStorage for unlocked cards | MEDIUM |
| Content moderation | WORKING | Server-side regex filter on posts, letters, appreciations | - |

---

## Authentication

### Summary

| Check | Status | Evidence |
|---|---|---|
| Passwords never stored in plaintext | ✅ PASS | bcrypt.hash() with cost factor 10 in `src/lib/auth.ts:61,72` and `src/app/api/auth/register/route.ts:52` |
| Password hashing algorithm | ✅ PASS | bcryptjs with salt rounds = 10 |
| Session strategy | JWT (signed cookie) | `session.strategy: "jwt"` in `src/lib/auth.ts:89` |
| Session invalidation | ❌ FAIL | No server-side revocation mechanism. JWT valid until expiry (default 30 days). Banning an IP does not invalidate existing JWTs |
| CredentialsProvider auto-creates accounts | ❌ FAIL | `src/lib/auth.ts:57-69` — login with unknown email auto-creates user |
| Users cannot register as admin | ✅ PASS | Role hardcoded to `"user"` in both registration paths |
| Client cannot manufacture session | ✅ PASS (with caveat) | JWT signed with NEXTAUTH_SECRET; however, the secret is weak and committed (see Secrets section) |
| Duplicate registration prevention | ✅ PASS | Email unique constraint + explicit check in register route |
| Invalid password handling | ✅ PASS | `bcrypt.compare()`, logs failed attempt, throws error |
| Unknown account handling | ⚠️ PARTIAL | Register endpoint returns error; authorize() auto-creates instead |

### Critical Findings

1. **CRITICAL: Weak NEXTAUTH_SECRET committed to source** — `.env` contains `NEXTAUTH_SECRET=seven-appreciation-secret-key-2026`. This is a human-readable, guessable string. Any attacker who knows this value can forge JWT session cookies and impersonate any user including admins. The `.env` file is not tracked by git (`.gitignore` has `.env*`), but the secret value is weak regardless.

2. **HIGH: Auto-account-creation bypasses registration rate limits** — The `authorize()` function at `src/lib/auth.ts:57-69` creates a new user when an unknown email is provided with a password. This completely bypasses the `/api/auth/register` endpoint and its rate limit (3/hour). An attacker can create accounts at the login rate limit (5/IP/15min).

3. **HIGH: Password backfill for OAuth users without verification** — `src/lib/auth.ts:70-73` sets a password on Google OAuth users who don't have one, without verifying email ownership.

4. **MEDIUM: signIn callback always returns true** — `src/lib/auth.ts:101-103` performs no checks against banned status or account standing.

5. **MEDIUM: No session revocation** — Banned users retain valid JWT sessions. No mechanism to force logout, invalidate on password change, or support password reset.

---

## Authorization

### Summary

| Endpoint | Auth Required | Role Check | Server-Side Enforced |
|---|---|---|---|
| GET /api/posts | No | No | N/A |
| POST /api/posts | Yes | No (any user) | ✅ |
| PATCH /api/posts | Yes | No (any user) | ✅ |
| GET /api/appreciations | No | No | N/A |
| POST /api/appreciations | Yes | No (any user) | ✅ |
| PATCH /api/appreciations | Yes | No (any user) | ✅ |
| GET /api/letters | No | No | N/A |
| POST /api/letters | Yes | No (any user) | ✅ |
| GET /api/milestones | No | No | N/A |
| POST /api/milestones | Yes | No (any user) | ✅ |
| GET /api/photos | No | No | N/A |
| POST /api/photos | Yes | No (any user) | ✅ |
| POST /api/reports | Yes | No (any user) | ✅ |
| GET /api/reports | Yes | Admin | ✅ |
| POST /api/uploads | Yes | No (any user) | ✅ |
| DELETE /api/uploads/[id] | Yes | Owner or Admin | ✅ |
| POST /api/ban | Yes | Admin | ✅ |
| DELETE /api/ban | Yes | Admin | ✅ |
| GET /api/ban | No | No | N/A |
| POST /api/users/follow | Yes | No (any user) | ✅ |
| POST /api/users/block | Yes | No (any user) | ✅ |
| /admin (page) | Yes | Admin | ✅ (layout + page) |

### Findings

- ✅ All mutation endpoints verify authentication server-side via `getServerSession()`
- ✅ Admin endpoints verify `session.user.role !== "admin"` server-side
- ✅ Admin page has dual-layer protection: server layout.tsx + client-side check
- ❌ No middleware.ts exists — no route-level auth enforcement
- ❌ Admin moderation actions (dismiss/hide/remove/warn) are client-side only, not persisted to DB

---

## IDOR / Ownership Audit

| Resource | Ownership Check | Evidence |
|---|---|---|
| Upload DELETE | ✅ Owner or admin | `src/app/api/uploads/[id]/route.ts:39` |
| Post creation | ✅ userId from session | `src/app/api/posts/route.ts:130` |
| Comment creation | ✅ userId from session | `src/app/api/posts/[postId]/comments/route.ts` |
| Report creation | ✅ reporterId from session | `src/app/api/reports/route.ts:61` |
| Follow | ✅ followerId from session | `src/app/api/users/follow/route.ts` |
| Block | ✅ blockerId from session | `src/app/api/users/block/route.ts` |
| Appreciation like | ✅ userId from session | `src/app/api/appreciations/route.ts:105` |
| Milestone like | ✅ userId from session | `src/app/api/milestones/route.ts` |
| Photo like | ✅ userId from session | `src/app/api/photos/route.ts` |

### Findings

- ✅ No endpoint trusts `userId`, `role`, `ownerId`, or `likesCount` from the browser/request body for identity purposes
- ✅ Session identity is the source of truth for all mutations
- ❌ No self-follow prevention (`/api/users/follow`)
- ❌ No self-block prevention (`/api/users/block`)
- ❌ No existence validation on `targetUserId` in follow/block — following/blocking non-existent users causes 500 errors

---

## Input Validation

### Zod Validation Audit

| Route | Schema | Executed | Fields Validated |
|---|---|---|---|
| POST /api/auth/register | `registerSchema` | ✅ `safeParse()` at line 25 | email, name (2-50), password (min 8) |
| POST /api/posts | `postSchema` | ✅ `safeParse()` at line 105 | type, title, content, memberId, imageUrl |
| POST /api/posts/[postId]/comments | `commentSchema` | ✅ `safeParse()` at line 33 | content (1-500) |
| POST /api/appreciations | `appreciationSchema` | ✅ `safeParse()` at line 47 | memberId, content, memberName |
| PATCH /api/appreciations | `likeSchema` | ✅ `safeParse()` at line 98 | id, action |
| POST /api/letters | `letterSchema` | ✅ `safeParse()` at line 56 | memberId, title, body, imageUrl, visibility |
| POST /api/milestones | `milestoneSchema` | ✅ `safeParse()` at line 51 | title, description, eventDate, memberId, sourceUrl |
| PATCH /api/milestones | `likeSchema` | ✅ `safeParse()` at line 103 | id, action |
| POST /api/photos | `photoSchema` | ✅ `safeParse()` at line 56 | memberSlug, url, caption, category, date, credit |
| PATCH /api/photos | `likeSchema` | ✅ `safeParse()` at line 110 | id, action |
| POST /api/reports | `reportSchema` | ✅ `safeParse()` at line 47 | reason, contentType, contentId, contentSnippet |
| POST /api/users/follow | `targetIdSchema` | ✅ `safeParse()` at line 22 | targetUserId (min 1) |
| POST /api/users/block | `targetIdSchema` | ✅ `safeParse()` at line 22 | targetUserId (min 1) |
| POST /api/uploads | File validation | ✅ `validateFileUpload()` | MIME type, magic bytes, extension, size |
| POST /api/ban | **NONE** | ❌ | ip, reason — no format validation |
| DELETE /api/ban | **NONE** | ❌ | ip — no format validation |
| PATCH /api/posts | **NONE** | ❌ | Only checks `!id || !action` |

### Validation Gaps

- ❌ `milestoneSchema.eventDate` is `z.string()` — no date format validation
- ❌ `reportSchema.contentId` is `z.string().min(1)` — no UUID format validation
- ❌ `targetIdSchema` is `z.string().min(1)` — no UUID format validation
- ❌ Ban POST/DELETE — no Zod validation on IP or reason fields
- ❌ Posts PATCH — no Zod validation at all
- ❌ Upload route `purpose` field — cast as string with no validation
- ❌ No password complexity requirements (only min 8 chars)

---

## Rate Limiting

### Implementation: In-memory sliding window (`src/lib/rate-limit.ts`)

| Endpoint | Policy | Window | Max | Verified |
|---|---|---|---|---|
| Login (IP) | `login` | 15 min | 5 | ✅ In `authorize()` |
| Login (email) | `loginPerEmail` | 15 min | 10 | ✅ In `authorize()` |
| Register (IP) | `register` | 1 hour | 3 | ✅ POST /api/auth/register |
| Post creation | `post` | 15 min | 5 | ✅ POST /api/posts |
| Comment creation | `comment` | 15 min | 10 | ✅ POST /api/posts/[postId]/comments |
| Appreciation | `appreciation` | 1 hour | 10 | ✅ POST /api/appreciations |
| Letter | `letter` | 1 hour | 5 | ✅ POST /api/letters |
| Milestone | `milestone` | 1 hour | 5 | ✅ POST /api/milestones |
| Photo | `photo` | 1 hour | 10 | ✅ POST /api/photos |
| Report | `report` | 1 hour | 10 | ✅ POST /api/reports |
| Like | `like` | 15 min | 30 | ✅ PATCH endpoints |
| Follow | `follow` | 15 min | 20 | ✅ POST /api/users/follow |
| Block | `block` | 15 min | 20 | ✅ POST /api/users/block |
| Upload | Custom | 1 hour | 20 | ✅ POST /api/uploads |
| Delete upload | Custom | 1 min | 10 | ✅ DELETE /api/uploads/[id] |
| Admin | `admin` | 1 hour | 100 | ✅ GET/POST/DELETE /api/reports, ban |
| Payload size | 512 KB | - | - | ✅ checkPayloadSize |
| Retry-After header | - | - | - | ✅ rateLimitResponse() |

### Rate Limiting Gaps

- ❌ Posts PATCH (like/unlike) — no rate limiting (though the action is a no-op)
- ❌ GET /api/ban — no rate limiting (allows reconnaissance)
- ⚠️ In-memory only — resets on server restart, does not work across instances
- ⚠️ Auto-account-creation in authorize() bypasses registration rate limits

---

## Abuse Prevention

| Attack Vector | Protection | Status |
|---|---|---|
| Spam posts | Rate limit 5/15min + moderation filter | ✅ |
| Appreciation flooding | Rate limit 10/hour + moderation | ✅ |
| Report flooding | Rate limit 10/hour + duplicate check (24h) | ✅ |
| Duplicate likes | DB unique constraint `@@unique([userId, ...Id])` | ✅ |
| Duplicate follows | DB composite PK `@@id([followerId, followingId])` | ✅ |
| Duplicate blocks | DB composite PK `@@id([blockerId, blockedId])` | ✅ |
| Repeated letters | Rate limit 5/hour + moderation | ✅ |
| Upload flooding | Rate limit 20/hour + file count limit (50) + quota (100MB) | ✅ |
| Brute-force login | Rate limit 5/IP/15min + 10/email/15min | ✅ |
| Automated registration | Rate limit 3/IP/hour + moderation | ✅ |
| IP spoofing | TRUSTED_PROXY config (default: not trusted) | ⚠️ |
| Large payloads | 512 KB limit via checkPayloadSize | ✅ |

---

## Upload Security

### Pipeline: Validate → Process → Store → Record

| Check | Status | Evidence |
|---|---|---|
| Valid image accepted | ✅ | JPEG, PNG, WebP via magic bytes + extension |
| Invalid MIME type rejected | ✅ | `validateFileUpload()` checks MIME type |
| Spoofed MIME rejected | ✅ | Magic byte detection + claimed-vs-detected mismatch check |
| Wrong file signature rejected | ✅ | `MAGIC_BYTES` in `src/lib/upload/validation.ts` |
| Oversized file rejected | ✅ | Per-category size limits (2-5MB) + global 512KB payload |
| Extreme dimensions rejected | ✅ | `maxPixelCount: 4096*4096` in config |
| Malicious filename sanitized | ✅ | `sanitizeFilename()` strips special chars |
| Path traversal prevented | ✅ | `storageDelete()` uses `path.resolve()` + `startsWith(BASE_DIR)` check |
| Unsupported extension rejected | ✅ | Extension whitelist: `.jpg`, `.jpeg`, `.png`, `.webp` |
| Unauthenticated upload rejected | ✅ | `getServerSession()` check |
| Unauthorized deletion rejected | ✅ | Owner or admin check at `uploads/[id]/route.ts:39` |
| Base64 rejected | ✅ | Explicit check in POST routes for posts, letters |
| Storage credentials server-side | ✅ | Local filesystem, no client-side storage access |
| EXIF metadata stripped | ✅ | Sharp by default strips metadata |
| SVG format rejected | ✅ | Not in allowed MIME or extension list |
| User file count limit | ✅ | 50 files per user |
| User storage quota | ✅ | 100MB per user |

### Gaps

- ⚠️ Storage key path traversal protection exists in `storageDelete` but should also be verified in `storagePut` (currently safe due to structured key generation: `category/YYYY/MM/userId_random.ext`)
- ⚠️ Original filename stored in DB (`originalName`) could be rendered unsafely if ever displayed without encoding
- ⚠️ DB record deleted before storage file on DELETE — orphaned file possible if storage deletion fails

---

## Database Security

### Schema Analysis (`prisma/schema.prisma`)

**Models:** 18 (Account, Session, User, VerificationToken, Post, Follow, Block, AppreciationMessage, MemberPhoto, Letter, CommunityMilestone, BannedIP, Report, Comment, SavedItem, UnlockedPhotocard, AppreciationLike, PhotoLike, MilestoneLike, SecurityLog, UploadedFile)

**Primary Keys:** All use `String @id @default(cuid())` except composite-key models (Follow, Block)

**Unique Constraints:**
- User.email ✅
- Account.[provider, providerAccountId] ✅
- BannedIP.ip ✅
- AppreciationLike.[userId, appreciationId] ✅
- PhotoLike.[userId, photoId] ✅
- MilestoneLike.[userId, milestoneId] ✅
- SavedItem.[userId, itemType, itemId] ✅
- UnlockedPhotocard.[userId, cardId] ✅
- UploadedFile.storageKey ✅

**Cascade Behavior:** All FKs use `onDelete: Cascade` — deleting a user cascades to posts, comments, follows, blocks, saved items, photocards, likes, sessions, accounts

**Orphan-Prone Models (no FK to User):**
- AppreciationMessage.userId (nullable String)
- MemberPhoto.uploadedBy (nullable String)
- Letter.userId (nullable String)
- CommunityMilestone.userId (nullable String)
- Report.reporterId (nullable String)
- UploadedFile.ownerId (String — no FK)
- SecurityLog.userId (nullable String)

**Missing Indexes (Performance):**
- Post.status, Post.type, Post.userId
- Comment.postId
- Report.status, Report.reporterId
- AppreciationMessage.memberId, AppreciationMessage.status
- MemberPhoto.memberSlug, MemberPhoto.category
- CommunityMilestone.memberId, CommunityMilestone.status

---

## Database Query Security

| Check | Status | Evidence |
|---|---|---|
| Raw SQL | ✅ None found | All queries use Prisma Client |
| Unsafe dynamic queries | ✅ None found | Where clauses are statically constructed |
| Missing ownership conditions | ⚠️ | Letters GET returns all regardless of visibility (see Critical below) |
| Unrestricted queries | ⚠️ | Several GET endpoints return all records without pagination |
| N+1 queries | ⚠️ | Posts GET includes comments inline (acceptable); no obvious N+1 |

---

## Secrets

| Secret | Status | Location |
|---|---|---|
| DATABASE_URL | ✅ Not in git | `.env` (gitignored) |
| NEXTAUTH_SECRET | ✅ Not in git | `.env` (gitignored) |
| GOOGLE_CLIENT_ID | ✅ Not in git | `.env` (gitignored) |
| GOOGLE_CLIENT_SECRET | ✅ Not in git | `.env` (gitignored) |
| .env.example | ✅ Placeholders only | `"<GENERATE_A_SECURE_SECRET>"` |
| .gitignore | ✅ `.env*` pattern | Covers .env, .env.local, etc. |
| Secrets in source code | ✅ None | process.env references only |
| Git history secrets | ✅ None found | Only 1 commit, no .env files committed |
| Hardcoded mock values | ⚠️ | `src/lib/auth.ts:17-18`: `"mock-client-id"` / `"mock-client-secret"` as fallbacks |

**CRITICAL:** While .env is not tracked by git, the NEXTAUTH_SECRET value (`seven-appreciation-secret-key-2026`) is trivially guessable and should be rotated to a cryptographically random string.

---

## XSS / Injection

| Vector | Status | Evidence |
|---|---|---|
| dangerouslySetInnerHTML | ✅ Safe | Only in `layout.tsx:36` — hardcoded inline theme init script, no user content |
| innerHTML | ✅ None | Zero occurrences |
| eval() | ✅ None | Zero occurrences |
| new Function() | ✅ None | Zero occurrences |
| document.write | ✅ None | Zero occurrences |
| XSS via user content | ✅ Mitigated | React auto-escapes. User content rendered via `{variable}` syntax |
| CSP `script-src` | ⚠️ Partial | `'unsafe-inline' 'unsafe-eval'` weakens CSP |
| SQL injection | ✅ None | Prisma ORM parameterized queries only |

---

## CSRF / Cookies

| Check | Status | Evidence |
|---|---|---|
| SameSite cookies | ✅ | NextAuth default: `SameSite=lax` |
| HttpOnly cookies | ✅ | NextAuth session cookie is HttpOnly |
| Secure flag | ✅ | NextAuth sets Secure in production |
| Origin checks | ✅ | NextAuth validates callback URLs |
| No explicit CSRF tokens | ℹ️ | Not needed with SameSite=lax + NextAuth built-in protections |

---

## Security Headers

| Header | Value | Status |
|---|---|---|
| X-Frame-Options | DENY | ✅ |
| X-Content-Type-Options | nosniff | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), browsing-topics=() | ✅ |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | ✅ |
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self'; frame-ancestors 'none';` | ⚠️ |
| X-XSS-Protection | Not set | ℹ️ Deprecated, not needed with CSP |
| Permissions-Policy | Set | ✅ |

### CSP Analysis

- ⚠️ `'unsafe-inline'` in script-src allows inline scripts (needed for Next.js hydration but weakens CSP)
- ⚠️ `'unsafe-eval'` in script-src allows eval() (some React features require this)
- ⚠️ `'unsafe-inline'` in style-src (required by CSS-in-JS / Tailwind)
- ✅ `frame-ancestors 'none'` provides clickjacking protection
- ✅ `img-src` restricts to self, https:, and data:

---

## Privacy

| Data Collected | Purpose | Who Can Access |
|---|---|---|
| Email | Account identification | User + Admin |
| Password hash | Authentication | System only |
| User name | Display in community | All users |
| User image/avatar | Display in community | All users |
| Uploaded images | Community sharing | All users (public uploads) |
| IP addresses | Rate limiting, bans | Admin (via reports), System |
| Reporter IPs | Moderation | Admin only |
| OAuth tokens | Google sign-in | System only |
| User-generated content | Community participation | All users |

**Privacy/legal compliance not formally assessed.**

### Privacy Concerns

- ❌ Reporter IP addresses stored and displayed to admins in plaintext
- ❌ No user data deletion mechanism (right to erasure)
- ❌ No data retention policy or automatic purging of old records
- ❌ OAuth tokens stored unencrypted in database

---

## Moderation

### Content Moderation Engine (`src/lib/moderation.ts`)

| Check | Patterns | Status |
|---|---|---|
| Member comparisons | "better than", "best member", "worst member", etc. | ✅ |
| Fan wars | "go attack", "hate train", "boycott", etc. | ✅ |
| Divisive comparisons | "deserves more than", "should be replaced", etc. | ✅ |
| Privacy leaks | Phone numbers, addresses, schedules | ✅ |
| Profanity | "bastard", "bitch", "slut" (limited set) | ✅ |
| False positive risk | LOW — only aggressive patterns blocked | ✅ |

### Moderation Application

| Endpoint | Moderation Applied |
|---|---|
| POST /api/posts | ✅ `checkContentModeration(content)` |
| POST /api/letters | ✅ `checkContentModeration(letterBody)` |
| POST /api/appreciations | ✅ Via CreatePostModal client-side |
| POST /api/milestones | ✅ Via moderation check |
| Comments | ✅ Client-side moderation check |

---

## Reporting

| Flow | Status | Evidence |
|---|---|---|
| User submits report | ✅ | POST /api/reports creates DB record |
| Admin views reports | ✅ | GET /api/reports (admin-only) |
| Admin resolves report | ⚠️ PARTIAL | Report status updated in client state only — NOT persisted to DB |
| Normal user blocked | ✅ | GET /api/reports checks admin role |
| Duplicate report prevention | ✅ | 24h dedup check per user per content |
| Rate limiting | ✅ | 10 reports/hour per user |

**HIGH:** Admin moderation actions (dismiss/hide/remove/warn) are client-side only. A page refresh loses all moderation history. The audit log is in React state only.

---

## Admin Security

| Check | Status | Evidence |
|---|---|---|
| Authentication required | ✅ | `getServerSession()` in layout.tsx and API routes |
| Admin role enforced server-side | ✅ | `session.user.role !== "admin"` in layout.tsx, page.tsx, API routes |
| Normal user cannot access admin APIs | ✅ | 401 returned for non-admin session |
| Client-side hiding + server check | ✅ | Dual protection: layout redirect + client redirect |
| Audit logging | ❌ | Audit logs stored in React useState only — not persisted |
| Safe errors | ✅ | Generic "Internal Server Error" responses |
| bannedBy field integrity | ❌ | `bannedBy` taken from request body, not session (`src/app/api/ban/route.ts:35`) |

### Non-ban Moderation Actions — Not Persisted

The admin dashboard's `handleExecuteAction` function for actions other than `ban_user`:
- Updates report status **only in React state** (`setReports`)
- Logs actions **only in React state** (`setAuditLogs`)
- Does **NOT** make any API call to persist changes
- A page refresh loses all non-ban moderation actions

---

## LocalStorage Audit

### Expected Legitimate Use

| Usage | Location | Classification |
|---|---|---|
| Theme preferences | `seven_prefs` in `src/lib/storage.ts` | ✅ UI preference |
| Chevron member prefs | `seven_prefs` in `src/lib/storage.ts` | ✅ UI preference |

### Application Data in localStorage

| Data | Key | Risk |
|---|---|---|
| Appreciation messages | `seven_appreciations` | ⚠️ localStorage fallback, but actual data from DB via API |
| Posts | `seven_posts` | ⚠️ localStorage fallback, but actual data from DB via API |
| Stories | `seven_stories` | ⚠️ localStorage only — NOT persisted to database |
| Reports | `seven_reports` | ⚠️ localStorage only — NOT persisted to database |
| Letters | `seven_letters` | ⚠️ localStorage fallback, but actual data from DB via API |
| Profile | `seven_profile` | ⚠️ localStorage only |
| Saved items | `seven_saved` | ⚠️ localStorage only — NOT persisted to database |
| Unlocked photocards | `seven_unlocked_photocards` | ⚠️ localStorage only — NOT persisted to database |
| Track comforts | `seven_track_comforts` | ⚠️ localStorage only |

**MEDIUM:** Stories, reports, saved items, unlocked photocards, and profile data depend on localStorage as the source of truth. These are NOT backed by the database. Any data in these categories will be lost on browser clear.

---

## CSRF / Request Security

| Check | Status | Evidence |
|---|---|---|
| SameSite=lax | ✅ | NextAuth default |
| Secure flag | ✅ | Set in production |
| HttpOnly | ✅ | Session cookie |
| Origin checks | ✅ | NextAuth callback URL validation |
| No wildcard CORS | ✅ | No Access-Control-Allow-Origin headers found |
| No explicit CORS config | ✅ | Same-origin only (Next.js default) |

---

## Clickjacking

| Check | Status | Evidence |
|---|---|---|
| X-Frame-Options: DENY | ✅ | `next.config.ts:25` |
| CSP frame-ancestors 'none' | ✅ | `next.config.ts:46` |

---

## Error Handling

| Check | Status | Evidence |
|---|---|---|
| Stack traces exposed | ✅ None | All catch blocks return generic "Internal Server Error" |
| SQL errors exposed | ✅ None | Prisma errors caught, generic message returned |
| Filesystem paths exposed | ✅ None | Storage errors return generic messages |
| Env vars exposed | ✅ None | No process.env values in error responses |
| Appropriate status codes | ✅ | 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 413 (payload too large), 422 (moderation), 429 (rate limit), 500 (server error) |
| console.error in catch blocks | ⚠️ | Full error logged server-side (acceptable but could log PII in error messages) |

---

## Moderation — False Positive Risk

| Content Type | Risk | Notes |
|---|---|---|
| Genuine appreciation | LOW | Moderation only blocks comparison/abusive patterns |
| Fan art descriptions | LOW | No relevant patterns |
| Concert memories | LOW | No relevant patterns |
| Birthdays/achievements | LOW | No relevant patterns |

---

## XSS / Injection — Manual Test Results

| Test | Expected | Result |
|---|---|---|
| `<script>alert(1)</script>` in post content | Blocked by React auto-escape | ✅ Safe |
| `<img src=x onerror=alert(1)>` in post content | Blocked by React auto-escape | ✅ Safe |
| `javascript:alert(1)` in imageUrl | Blocked by `isAllowedImageUrl()` whitelist | ✅ Safe |
| Base64 data URL in imageUrl | Explicitly rejected with 400 | ✅ Safe |
| SQL injection in search params | Prisma parameterized queries | ✅ Safe |
| `dangerouslySetInnerHTML` with user content | Not used — only hardcoded theme script | ✅ Safe |

---

## Accessibility

| Check | Status | Severity |
|---|---|---|
| Skip-to-content link | ✅ Present and functional | - |
| Focus-visible outline | ✅ Global `*:focus-visible` style | - |
| Semantic HTML (header/nav/main/footer/article) | ✅ Generally good | - |
| Alt text on images | ✅ All `next/image` have alt text | - |
| Form labels | ⚠️ Login inputs missing `htmlFor`/`id` association | MEDIUM |
| Mobile menu aria-expanded | ❌ Missing on hamburger button | MEDIUM |
| Modal focus trap | ❌ Profile modal lacks focus trap + Escape | MEDIUM |
| Tab ARIA roles | ❌ Category tabs lack `role="tab"` / `aria-selected` | LOW |
| Search inputs unlabeled | ❌ Members page and search page inputs have no `<label>` | MEDIUM |
| Comment input unlabeled | ❌ Only placeholder text, no programmatic label | LOW |
| Color contrast (zinc-400) | ❌ ~3.0:1 — fails WCAG AA (4.5:1 minimum) | MEDIUM |
| Color contrast (rose-400) | ❌ ~3.4:1 — fails WCAG AA | LOW |
| Keyboard navigation | ✅ All interactive elements are buttons/links | - |
| Password show/hide | ⚠️ No aria-label for current state | LOW |

---

## Performance

| Check | Status | Evidence |
|---|---|---|
| Build optimization | ✅ | Turbopack, compiled in 16.7s |
| Static pages | ✅ | 27 pages generated, 15 static |
| Dynamic pages | ✅ | 14 dynamic routes (appropriate) |
| Image optimization | ⚠️ | Profile uses `unoptimized` prop; most pages use `next/image` with `sizes` |
| Client components | ⚠️ | All page components are `'use client'` — no SSR benefits |
| Unnecessary re-renders | ⚠️ | `UnifiedPostCard` not memoized; full feed re-renders on like |
| Search debouncing | ❌ | Search results recomputed on every keystroke — no debouncing |
| No pagination | ⚠️ | GET endpoints return all records (posts: approved only, appreciations: all, letters: all, photos: all) |
| External images | ⚠️ | Fallback avatars use external Unsplash URLs |

---

## SEO

| Check | Status | Evidence |
|---|---|---|
| Root metadata (title/description) | ✅ | `src/app/layout.tsx` |
| Per-page metadata | ❌ | All pages use `'use client'` — no page-level metadata |
| OpenGraph metadata | ❌ | Not configured |
| Twitter card metadata | ❌ | Not configured |
| robots.txt | ❌ | Not found |
| sitemap.xml | ❌ | Not found |
| Canonical URLs | ❌ | Not configured |
| JSON-LD structured data | ❌ | Not found |
| Private pages excluded from indexing | ⚠️ | /admin has no `robots: noindex` (but protected by auth) |
| Favicon | ❌ | Not configured in metadata |

---

## Caching

| Check | Status | Evidence |
|---|---|---|
| Private data accidentally cached | ✅ Low risk | All authenticated endpoints use `getServerSession()` (dynamic) |
| Static pages cached | ✅ Appropriate | Homepage, members, guidelines are static |
| API caching | ✅ None (appropriate for dynamic community data) |

---

## Dependencies

### npm audit results

| Severity | Count | Package | Details |
|---|---|---|---|
| High | 3 | deepmerge-ts | Stack exhaustion when merging recursive objects (CVE in Prisma config dependency) |

**Resolution:** Fix requires `prisma@6.12.0` (breaking change from current 7.x). The vulnerability is in Prisma's internal config dependency, not directly exploitable by application users.

### Key Dependencies

| Package | Version (estimated) | Status |
|---|---|---|
| Next.js | 16.3.1 | Current |
| React | Latest for Next 16 | Current |
| Prisma | 7.x | Current (audit vulnerability is in config dependency) |
| NextAuth.js | 4.x | Current for Next.js 16 compat |
| bcryptjs | Latest | Current |
| sharp | Latest | Current |
| zod | Latest | Current |
| lucide-react | Latest | Current |

---

## Testing

### Test Results

```
Test Suites: 9 passed, 9 total
Tests:       289 passed, 289 total
Time:        9.895s
```

| Suite | Tests | Status |
|---|---|---|
| Security regression | Multiple | ✅ All pass |
| Upload security | Multiple | ✅ All pass |
| Moderation | Multiple | ✅ All pass |
| Rate limiting | Multiple | ✅ All pass |
| IP handling | Multiple | ✅ All pass |
| Other test suites | Multiple | ✅ All pass |

### Test Coverage

| Check | Status |
|---|---|
| Coverage reporting | NOT VERIFIED | No coverage script configured |
| Security regression tests | ✅ Present and passing |
| Integration tests | ✅ Present and passing |
| Unit tests | ✅ Present and passing |

---

## Backup & Recovery

| Check | Status |
|---|---|
| Automated database backups | NOT VERIFIED |
| Point-in-time recovery | NOT VERIFIED |
| Backup retention policy | NOT VERIFIED |
| Restore procedure | NOT VERIFIED |

**This is a production operational risk. No backup/recovery infrastructure can be verified.**

---

## Observability

| Check | Status | Evidence |
|---|---|---|
| Security event logging | ✅ | `src/lib/security-logger.ts` — structured logging to console |
| Error logging | ✅ | `console.error()` in all catch blocks |
| Security log persistence | ⚠️ | Logs to console only — not persisted to file or external service |
| Uptime monitoring | NOT VERIFIED | No monitoring configuration found |
| Database monitoring | NOT VERIFIED | No monitoring configuration found |
| Application performance monitoring | NOT VERIFIED | No APM configuration found |

---

## Manual Security Testing Results

| # | Test | Result | Severity |
|---|---|---|---|
| 1 | Guest → admin | ✅ Blocked — redirect to / + 401 on API | - |
| 2 | User → admin | ✅ Blocked — role check in layout.tsx + API | - |
| 3 | User → ban API | ✅ Blocked — admin role check | - |
| 4 | User → reports GET | ✅ Blocked — admin role check | - |
| 5 | User A → User B upload | ✅ Blocked — ownership check at uploads/[id] | - |
| 6 | Client-controlled role | ✅ Safe — role from JWT, not request body | - |
| 7 | Client-controlled userId | ✅ Safe — userId from session | - |
| 8 | Client-controlled likesCount | ✅ Safe — not used for identity | - |
| 9 | Duplicate likes | ✅ Blocked — DB unique constraint | - |
| 10 | Duplicate follows | ✅ Blocked — DB composite PK | - |
| 11 | Duplicate blocks | ✅ Blocked — DB composite PK | - |
| 12 | Upload spoofing | ✅ Blocked — magic byte validation + extension whitelist | - |
| 13 | Path traversal (upload delete) | ✅ Blocked — path.resolve + startsWith check | - |
| 14 | XSS in user content | ✅ Safe — React auto-escaping | - |
| 15 | Oversized payload | ✅ Blocked — 512KB limit | - |
| 16 | Rate-limit bypass | ⚠️ Auto-account-creation in authorize() bypasses registration rate limit | HIGH |
| 17 | Invalid authentication | ✅ Blocked — 401 returned | - |
| 18 | Malicious URLs in imageUrl | ✅ Blocked — isAllowedImageUrl() whitelist | - |
| 19 | Private letters exposed | ❌ FAIL — GET /api/letters returns all letters including `visibility: 'private'` to unauthenticated users | CRITICAL |
| 20 | Banned user sessions | ⚠️ Existing JWTs remain valid after IP ban | HIGH |

---

## Security Severity Summary

### CRITICAL

1. **Weak NEXTAUTH_SECRET** — The secret `seven-appreciation-secret-key-2026` is human-readable and guessable. An attacker who guesses it can forge JWT sessions and impersonate any user including admins. This undermines all authentication protections. **ROTATION REQUIRED.**

2. **Private letters exposed to unauthenticated users** — `GET /api/letters` at `src/app/api/letters/route.ts:31-35` returns ALL letters regardless of `visibility` field. Letters marked `visibility: 'private'` are accessible to everyone. This is a data privacy exposure.

### HIGH

3. **Auto-account-creation in authorize()** — `src/lib/auth.ts:57-69` silently creates a user account when an unknown email is provided during login. This bypasses the registration rate limit and allows account squatting for email addresses not owned by the attacker.

4. **Password backfill for OAuth users** — `src/lib/auth.ts:70-73` sets a password on Google OAuth accounts without verifying email ownership. Combined with #3, this creates an account takeover vector.

5. **Admin moderation actions not persisted** — Non-ban moderation actions (dismiss/hide/remove/warn) are client-side only. A page refresh loses all moderation work. No audit trail is maintained in the database.

6. **No session revocation** — Banned users retain valid JWT sessions. No mechanism exists to invalidate sessions on password change or admin action.

7. **bannedBy field trusts request body** — `src/app/api/ban/route.ts:35` accepts `bannedBy` from the request body instead of deriving from `session.user.id`, allowing audit-trail forgery.

### MEDIUM

8. **Posts PATCH (like/unlike) is a no-op** — `src/app/api/posts/route.ts:162-167` finds the post and returns it without recording any like/unlike action. The client-side optimistic update is not backed by server state.

9. **No self-follow/block prevention** — Users can follow or block themselves at `src/app/api/users/follow/route.ts` and `block/route.ts`.

10. **No existence validation on targetUserId** — Follow and block endpoints don't verify the target user exists, causing Prisma FK errors (500 responses).

11. **No Zod validation on ban POST/DELETE** — IP addresses and reasons are not format-validated.

12. **Weak password policy** — Only `min(8)` length enforced. No uppercase, digit, or special character requirements.

13. **CSP allows 'unsafe-inline' 'unsafe-eval'** — Weakens Content Security Policy, though required by Next.js/React.

14. **localStorage used for application data** — Stories, reports, saved items, photocards depend on localStorage. Data lost on browser clear.

15. **All page components are client components** — Prevents SSR benefits; guidelines page is static but marked 'use client'.

16. **Missing database indexes** — Post.status, Post.type, Report.status and other frequently queried fields lack indexes.

17. **No pagination on GET endpoints** — Returns all records; performance degrades as data grows.

18. **In-memory rate limiter** — Resets on server restart, does not work across instances.

### LOW

19. **No email verification** — Accounts created without confirming email ownership.

20. **IP extraction spoofable without TRUSTED_PROXY** — `x-forwarded-for` header can be spoofed.

21. **Login labels not associated via htmlFor** — Accessibility issue.

22. **Mobile menu missing aria-expanded** — Accessibility issue.

23. **Modal lacks focus trap** — Accessibility issue.

24. **Search inputs unlabeled** — Accessibility issue.

25. **zinc-400 text fails WCAG AA contrast** — ~3.0:1 ratio.

26. **No per-page SEO metadata** — All pages share root title/description.

27. **No sitemap.xml or robots.txt**.

28. **No OpenGraph or Twitter card metadata**.

29. **DB record deleted before storage on upload DELETE** — Orphaned file possible.

30. **GoogleProvider mock fallback credentials** — Masks misconfiguration.

### INFO

31. **OAuth tokens stored unencrypted in DB** — Standard Prisma adapter behavior; should be encrypted for production.

32. **Reporter IP addresses displayed in admin UI** — Privacy consideration.

33. **No data retention or deletion policy** — No right-to-erasure mechanism.

34. **No health check endpoint**.

35. **No backup/recovery verified** — Production operational risk.

36. **Security logs only to console** — Not persisted to external service.

---

## PRODUCTION BLOCKERS

These issues **MUST** be resolved before production launch:

1. **CRITICAL: Rotate NEXTAUTH_SECRET to a cryptographically random value** (32+ bytes). Current value is guessable.

2. **CRITICAL: Fix private letters exposure** — `GET /api/letters` must filter by `visibility: 'shared'` for unauthenticated users, and only return `visibility: 'private'` letters to their owner.

3. **HIGH: Remove auto-account-creation from authorize()** — The `authorize()` function must NOT create new users. Unknown emails should throw an error directing users to the registration endpoint.

4. **HIGH: Remove password backfill for OAuth users** — `authorize()` must not set passwords on existing OAuth accounts.

5. **HIGH: Persist admin moderation actions to database** — Dismiss/hide/remove/warn actions must make API calls to update report status in the database.

6. **HIGH: Fix bannedBy field** — Set `bannedBy` from `session.user.id` in the ban API, not from the request body.

---

## Remaining Risks (Non-Blockers)

- Session revocation not implemented (requires JWT blacklist or session database)
- No email verification on registration
- In-memory rate limiter — acceptable for single-server deployment
- localStorage fallback for some features — acceptable if documented
- No pagination on some GET endpoints — acceptable at current scale
- Missing database indexes — acceptable at current scale, should be added as data grows
- CSP weakened by unsafe-inline/unsafe-eval — acceptable for Next.js/React
- No backup/recovery verified — operational risk, not a code issue
- No observability platform — should be added for production monitoring

---

## Recommended Post-Launch Improvements

1. Implement email verification on registration
2. Add session revocation (JWT blacklist via Redis/DB)
3. Add password reset flow
4. Implement pagination on all GET endpoints
5. Add missing database indexes
6. Migrate stories, saved items, photocards to database persistence
7. Add OpenGraph/Twitter metadata for social sharing
8. Add sitemap.xml and robots.txt
9. Add robots: noindex to admin and private pages
10. Encrypt OAuth tokens at rest
11. Add data retention/deletion policy
12. Add health check endpoint
13. Deploy with external logging (not console only)
14. Add automated database backups
15. Convert static pages (guidelines) to server components
16. Add `React.memo` to UnifiedPostCard for performance
17. Add debouncing to search inputs
18. Improve accessibility: modal focus traps, aria-expanded, form labels

---

## Final Score

| Category | Weight | Score | Evidence |
|---|---|---|---|
| Security | 30 | 18 | 2 critical + 4 high findings; strong controls exist but critical auth/data issues |
| Functionality | 20 | 17 | Core features work; posts like is no-op; admin moderation not persisted |
| Testing | 15 | 13 | 289/289 tests pass; no coverage; security regression tests present |
| Database/Data Integrity | 10 | 7 | Good schema design; missing indexes; orphan-prone models; no pagination |
| Performance | 10 | 7 | Client components everywhere; no memoization; no pagination; image optimization partially bypassed |
| Accessibility | 5 | 3 | Skip link + focus styles present; missing ARIA, labels, contrast issues |
| SEO | 5 | 1 | No per-page metadata, no OG, no sitemap, no robots.txt |
| Operations/Deployment | 5 | 2 | Build passes; no deployment config; no backup; no monitoring |

**Total: 68 / 100**

---

## Final Status

## 🟠 NEEDS HARDENING

---

## Final Recommendation

The Seven Appreciation & Support Community has a solid architectural foundation with meaningful security controls (rate limiting, content moderation, upload validation with magic byte detection, comprehensive CSP headers, and server-side authorization on all admin endpoints). The 289 tests all pass, the build is clean, and the core community features work.

However, **6 production blockers** must be resolved before launch:

1. The **weak, guessable NEXTAUTH_SECRET** effectively undermines all JWT-based authentication. If an attacker guesses this value, they can impersonate any user. This is the single most critical finding.

2. **Private letters are exposed to everyone** — a clear data privacy violation.

3. The **auto-account-creation in authorize()** is an architectural flaw that allows account squatting and bypasses registration controls.

4. **Admin moderation actions are not persisted** — the moderation panel appears functional but loses all work on refresh.

5. The **ban system trusts client-controlled data** (bannedBy field).

6. **Password backfill for OAuth users** creates an account takeover path.

None of these require a redesign. They are targeted fixes that can be implemented in a focused hardening sprint. Once these blockers are resolved and the NEXTAUTH_SECRET is rotated to a strong random value, the application will be ready for production deployment.

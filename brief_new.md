# MAMEN.ID — Rebuild Brief v2

> This document describes the structural rebuild of Mamen.id based on the existing codebase (Next.js 16 + Supabase + Tailwind 4 + Cloudinary) and new feature requirements.

---

## 1) Current State Summary

### Tech Stack (Unchanged)
- **Frontend**: Next.js 16 App Router + TypeScript + Tailwind CSS 4
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **Image CDN**: Cloudinary
- **Fonts**: Inter (body) + Oswald (headline)
- **Deploy**: Vercel

### Current Routes
| Route | Purpose |
|---|---|
| `/` | Home page |
| `/concerts` | Concert listing (filter by type & city) |
| `/concerts/[slug]` | Concert detail |
| `/media` | All articles (filter by category via `?cat=`) |
| `/media/[slug]` | Article detail |
| `/about` | About page |
| `/admin` | Admin CMS panel |
| `/superadmin` | Super admin panel |
| `/profile/[handle]` | User profile |
| `/setup-profile` | Profile setup |
| `/auth/callback` | Auth redirect |
| `/go/[id]` | Affiliate click redirect |

### Current Navigation (Header)
`Concerts` (dropdown: Festival, Local Artist, International, K-Pop) → `Music` → `Lifestyle` → `Sports` → `Hobbies` → `ABOUT` → Search → Login

### Current Footer
- Brand section with description
- Social media links as **text** (IG, X, TT)
- Explore links (Media, Concerts, About)
- Support links
- Affiliate disclosure + copyright

### Current Database Tables
`articles`, `article_products`, `concerts`, `featured_brands`, `affiliate_clicks`, `newsletter_subscribers`, `profiles`

### Current Article Categories
`music`, `concerts`, `lifestyle`, `sports`, `hobbies`

### Current Concert Types
`festival`, `local`, `international`, `kpop`

---

## 2) Requested Changes Overview

### 🔄 Navigation Restructure
### 🎪 Advanced Concert Filtering  
### 🔗 SEO-Friendly Route Separation  
### 🤝 New "Barengan" Feature  
### 🦶 Footer Improvements  

---

## 3) Navigation Changes

### New Header Navigation Order:
```
CONCERTS → MUSIC → LIFESTYLE → SPORTS → HOBBIES → BARENGAN → Search → Login
```

### Changes:
- **REMOVE** `ABOUT` from header navigation
- **ADD** `BARENGAN` as new nav item (link to `/barengan`)
- **KEEP** Concerts, Music, Lifestyle, Sports, Hobbies with existing dropdowns

### Files Affected:
- `src/components/Navbar.tsx` — Remove About link, add Barengan link
- `src/lib/types.ts` — Add Barengan to `NAV_CATEGORIES` or as standalone link

---

## 4) Concert Page Advanced Filtering (`/concerts`)

### Current Filters:
- Type: All / Festival / Local Artist / International / K-Pop
- City: All / Jakarta / Bandung / Bali

### New Filters to Add:

#### 4.1 Sort Options
- **Latest Added** (newest added to platform first — `created_at DESC`)
- **Soonest** (closest upcoming date first — `start_datetime ASC`, current default)
- **Most Popular** (highest `interested_count` first)

#### 4.2 Category / Type Filter (Enhanced)
Keep existing types but make them more prominent:
- All
- Festival
- Solo Concert (rename from "Local Artist" — clarify this means single-artist show)
- International
- K-Pop / Asian
- Local / Indonesian

#### 4.3 Hide Past Events Toggle
- **Default: ON** — hide concerts where `end_datetime` (or `start_datetime` if no end) is earlier than current time + 24 hours (H+1 rule)
- Toggle switch: "Show past events"
- When past events are shown, display them with a visual indicator (dimmed/greyed out, "ENDED" badge)

### Schema Impact:
- Add `status` column to concerts table: `upcoming`, `ended` (or compute from dates)
- Or simply filter by date at query time (preferred — no schema change needed)

### Files Affected:
- `src/app/concerts/page.tsx` — Add sort dropdown, hide-past toggle
- `src/lib/data.ts` — Update `getConcerts()` to accept sort and date filters
- `src/lib/types.ts` — Update `CONCERT_TYPES` if renaming, add sort type
- `src/components/ConcertTile.tsx` — Add "ENDED" badge for past events

---

## 5) SEO-Friendly Route Separation

### Current Structure:
```
/media?cat=music        → Music articles
/media?cat=lifestyle    → Lifestyle articles
/media?cat=sports       → Sports articles
/media?cat=hobbies      → Hobbies articles
/media/[slug]           → All article detail pages
```

### New Structure:
```
/music                  → Music articles listing
/music/[slug]           → Music article detail

/lifestyle              → Lifestyle articles listing
/lifestyle/[slug]       → Lifestyle article detail

/sports                 → Sports articles listing
/sports/[slug]          → Sports article detail

/hobbies                → Hobbies articles listing
/hobbies/[slug]         → Hobbies article detail

/concerts               → Concert listing (stays the same)
/concerts/[slug]        → Concert detail (stays the same)
```

### Benefits:
- Better SEO: `/music/hindia-album-review` > `/media?cat=music` with `/media/hindia-album-review`
- Cleaner, more descriptive URLs
- Category is part of the URL path, not a query parameter

### Implementation Approach:
1. Create route groups for each category: `src/app/music/`, `src/app/lifestyle/`, `src/app/sports/`, `src/app/hobbies/`
2. Each has `page.tsx` (listing) and `[slug]/page.tsx` (detail)
3. **Option A**: Shared page component with category param — DRY approach
4. **Option B**: Use Next.js route groups `(media)` to share layout
5. **Remove or redirect** old `/media` routes → `/music` as default or a hub page
6. Update all internal links (Navbar, ArticleTile, etc.)

### Navigation Links Update:
```
Music      → /music
Lifestyle  → /lifestyle
Sports     → /sports
Hobbies    → /hobbies
```

### Subcategory Routes (Optional v2):
```
/music/review/[slug]    → or keep subcategory as filter: /music?sub=review
```
> Recommendation: Keep subcategories as query params for now. Full nested routes can come later.

### Files Affected:
- **NEW** `src/app/music/page.tsx` — Music listing
- **NEW** `src/app/music/[slug]/page.tsx` — Music article detail
- **NEW** `src/app/lifestyle/page.tsx`
- **NEW** `src/app/lifestyle/[slug]/page.tsx`
- **NEW** `src/app/sports/page.tsx`
- **NEW** `src/app/sports/[slug]/page.tsx`
- **NEW** `src/app/hobbies/page.tsx`
- **NEW** `src/app/hobbies/[slug]/page.tsx`
- **DELETE or REDIRECT** `src/app/media/` — old route (301 redirect to `/music`)
- **UPDATE** `src/lib/types.ts` — Update `NAV_CATEGORIES` hrefs
- **UPDATE** `src/components/Navbar.tsx` — New hrefs
- **UPDATE** `src/components/ArticleTile.tsx` — Link to `/{category}/{slug}` instead of `/media/{slug}`
- **UPDATE** `src/app/page.tsx` — Home page links
- **UPDATE** `src/components/Footer.tsx` — Explore links

---

## 6) "Barengan" Feature (New)

### Concept:
"Barengan" (Indonesian for "together") — A semi-social/forum feature where verified users can find strangers to watch concerts or festivals together.

### How It Works:

#### 6.1 Posting a Barengan
1. User must be **logged in** and have **verified email**
2. User creates a "Barengan" post:
   - **Select a concert** from the existing concert database (autocomplete/picker)
   - **Set their status**:
     - 🎫 **Ticket Holder** — Already has ticket
     - 🔥 **Interested & Will Come** — Planning to attend
     - 🤔 **Interested but Unsure** — Likes the concert, might come
   - **Write a short message** (e.g., "Looking for 2 friends to go together! I'm in Tribune section")
   - **Optional**: Set group size they're looking for (e.g., "Looking for 1-3 people")

#### 6.2 Browsing Barengan
- `/barengan` — Main listing page more like twitter FYP or latest
- Filter by concert (linked from concert detail page too)
- Filter by status (Ticket Holder / Interested / Unsure)
- Sort by: Latest / Concert Date
- Each post card shows:
  - User avatar + display name
  - Concert name + poster thumbnail
  - Status badge (🎫 / 🔥 / 🤔)
  - Short message preview
  - How many people interested/responded
  - Timestamp

#### 6.3 Concert Integration
- On each **Concert Detail page** (`/concerts/[slug]`), add a "Find Barengan" section/button
- Shows count of active barengan posts for that concert
- Links to `/barengan?concert=[concert-slug]`

#### 6.4 Profile Integration — Concert Counter
- When a user's status is **"Ticket Holder"** and the concert's `end_datetime` has passed (event ended), they earn **+1 Concert Count** on their profile
- Profile shows: `🎪 5 Concerts Attended`
- This is computed from `barengan_posts` table, not manually tracked

### New Database Tables:

```sql
-- Barengan Posts
CREATE TABLE barengan_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ticket_holder', 'interested_will_come', 'interested_unsure')),
  message TEXT NOT NULL DEFAULT '',
  looking_for INTEGER DEFAULT 1,  -- how many people they're looking for
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barengan Responses (people interested in joining)
CREATE TABLE barengan_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barengan_post_id, user_id)  -- one response per user per post
);

-- Indexes
CREATE INDEX idx_barengan_posts_concert ON barengan_posts(concert_id);
CREATE INDEX idx_barengan_posts_user ON barengan_posts(user_id);
CREATE INDEX idx_barengan_posts_status ON barengan_posts(status);
CREATE INDEX idx_barengan_responses_post ON barengan_responses(barengan_post_id);

-- RLS
ALTER TABLE barengan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barengan_responses ENABLE ROW LEVEL SECURITY;

-- Public can read all active posts
CREATE POLICY "Public read barengan" ON barengan_posts FOR SELECT USING (is_active = true);
-- Authenticated users can create posts (must verify email at app level)
CREATE POLICY "Auth users create barengan" ON barengan_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update/delete their own posts
CREATE POLICY "Own barengan update" ON barengan_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own barengan delete" ON barengan_posts FOR DELETE USING (auth.uid() = user_id);

-- Public can read responses
CREATE POLICY "Public read responses" ON barengan_responses FOR SELECT USING (true);
-- Authenticated users can respond
CREATE POLICY "Auth users respond" ON barengan_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can delete their own responses
CREATE POLICY "Own response delete" ON barengan_responses FOR DELETE USING (auth.uid() = user_id);
```

### New Routes:
```
/barengan                    → Barengan listing (all posts)
/barengan?concert=[slug]     → Filtered by specific concert
/barengan/create             → Create a barengan post (requires auth)
/barengan/[id]               → Barengan post detail + responses
```

### New Files:
- `src/app/barengan/page.tsx` — Listing page
- `src/app/barengan/create/page.tsx` — Create form
- `src/app/barengan/[id]/page.tsx` — Post detail
- `src/components/BarenganCard.tsx` — Post card component
- `src/components/BarenganCreateForm.tsx` — Creation form
- `src/components/ConcertPicker.tsx` — Autocomplete concert selector

### Profile Update:
- Add **concert count** to profile display
- Computed query: `SELECT COUNT(*) FROM barengan_posts WHERE user_id = $1 AND status = 'ticket_holder' AND concert_id IN (SELECT id FROM concerts WHERE end_datetime < NOW())`
- Add to `src/app/profile/[handle]/page.tsx`

---

## 7) Footer Changes

### 7.1 Add "About" Link
- Move About from header to footer's "EXPLORE" section
- Already exists in footer → just remove from Navbar

### 7.2 Social Media Icons → SVG
Replace text-based social links (IG, X, TT) with proper SVG icons:

```
Current: [IG] [X] [TT]  (text in bordered boxes)
New:     [Instagram SVG] [X/Twitter SVG] [TikTok SVG]
```

### Files Affected:
- `src/components/Footer.tsx` — Replace text with inline SVGs or import from a local SVG set (avoid adding lucide dependency for brand icons since lucide doesn't have brand icons)

---

## 8) Summary of All File Changes

### New Files
| File | Purpose |
|---|---|
| `src/app/music/page.tsx` | Music articles listing |
| `src/app/music/[slug]/page.tsx` | Music article detail |
| `src/app/lifestyle/page.tsx` | Lifestyle articles listing |
| `src/app/lifestyle/[slug]/page.tsx` | Lifestyle article detail |
| `src/app/sports/page.tsx` | Sports articles listing |
| `src/app/sports/[slug]/page.tsx` | Sports article detail |
| `src/app/hobbies/page.tsx` | Hobbies articles listing |
| `src/app/hobbies/[slug]/page.tsx` | Hobbies article detail |
| `src/app/barengan/page.tsx` | Barengan listing |
| `src/app/barengan/create/page.tsx` | Create barengan post |
| `src/app/barengan/[id]/page.tsx` | Barengan post detail |
| `src/components/BarenganCard.tsx` | Barengan post card |
| `src/components/BarenganCreateForm.tsx` | Barengan creation form |
| `src/components/ConcertPicker.tsx` | Concert autocomplete selector |

### Modified Files
| File | Changes |
|---|---|
| `src/components/Navbar.tsx` | Remove About, add Barengan |
| `src/components/Footer.tsx` | SVG social icons, ensure About in explore links |
| `src/lib/types.ts` | Update NAV_CATEGORIES, add Barengan types, update article category routes |
| `src/lib/data.ts` | Add barengan data functions, update getConcerts for sort/hide-past, update article queries |
| `src/app/concerts/page.tsx` | Advanced filter (sort, hide-past toggle) |
| `src/components/ConcertTile.tsx` | "ENDED" badge for past events |
| `src/components/ArticleTile.tsx` | Update link to `/{category}/{slug}` |
| `src/app/page.tsx` | Update internal links |
| `src/app/concerts/[slug]/page.tsx` | Add "Find Barengan" section |
| `src/app/profile/[handle]/page.tsx` | Add concert attended count |
| `supabase/schema.sql` | Add barengan_posts + barengan_responses tables |

### Deleted / Redirected
| File | Action |
|---|---|
| `src/app/media/page.tsx` | Redirect to `/music` or remove |
| `src/app/media/[slug]/page.tsx` | Redirect to `/{category}/{slug}` or remove |
| `src/app/about/page.tsx` | Keep page, just remove nav link |

---

## 9) Implementation Priority / Build Order

### Phase 1 — Structure & Routes (Do First)
1. Create new category route pages (`/music`, `/lifestyle`, `/sports`, `/hobbies`)
2. Update all internal links and navigation
3. Remove About from nav, add to footer
4. Replace footer social text with SVG icons

### Phase 2 — Concert Filtering
5. Add sort options to concerts page
6. Add hide-past-events toggle
7. Add "ENDED" badge to past concert tiles

### Phase 3 — Barengan Feature
8. Create database tables (`barengan_posts`, `barengan_responses`)
9. Build Barengan listing page
10. Build Create Barengan page with ConcertPicker
11. Build Barengan detail page
12. Integrate with Concert Detail page ("Find Barengan" button)
13. Add concert count to user profiles

---

## 10) Notes & Decisions Needed

- **`/media` route**: Should it become a redirect (301 → `/music`) or a hub page showing all categories?
- **Barengan messaging**: Should users be able to chat/message each other through the platform, or just use the post + response system as a starting point?
- **Concert subcategory naming**: Rename "local" → "solo-concert" or keep as is?
- **Subcategory routes**: Keep as query params (`/music?sub=review`) or make full routes (`/music/review/[slug]`)?

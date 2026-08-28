# 🌸 Seven Appreciation — Community Platform

> **"Support without attacking anyone else. Appreciate without comparing. Celebrate without competing."**

A modern, full-stack digital sanctuary designed to celebrate the journeys, artistry, and inspirational impact of ENHYPEN members (**Heeseung, Jay, Jake, Sunghoon, Sunoo, Jungwon, and Ni-ki**) with genuine positivity and respect.

---

## ✨ Features

- **🌸 Community Appreciation Feed**: Filter posts by member or category (*Appreciation Notes, Fan Stories, Artworks, Community Discussions*). Includes content moderation and report systems.
- **🌟 Daily Member Spotlight & Prompts**: Rotating daily member spotlight and inspiration prompts to spark positive community notes.
- **📻 Real-Time Live Lounge (`/live`)**: Interactive fan room with member channels, live message feed, quick reaction chips, and animated floating hearts.
- **📇 3D Holographic Photocard Binder (`/binder`)**: Interactive 3D photocard collection with tilt parallax, holographic foil effects, mystery pack opening, and personal wishlist tracking.
- **🏆 Community-Powered Milestones (`/achievements`)**: Celebrate group achievements, music records, and member milestones together.
- **☕ Buy Me a Coffee Integration**: Direct creator support widget integrated globally into the footer and floating UI.
- **📱 PWA Support (Progressive Web App)**: Installable on iOS, Android, and Desktop with offline caching and native app feel.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React Icons
- **Database & ORM**: PostgreSQL, Prisma ORM 7 (`@prisma/adapter-pg`)
- **Authentication**: NextAuth.js
- **Form Validation & Security**: Zod, Content Moderation Filter, Rate Limiting, Security Event Logger

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v20+ 
- PostgreSQL database (or `npx prisma dev` for local Prisma Postgres)

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Installation
```bash
# Install dependencies
npm install

# Start local Prisma Postgres server
npx prisma dev --detach

# Push database schema
npx prisma db push

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License & Disclaimer

This project is an **independent, unofficial fan appreciation community project**. It is not officially operated by, endorsed by, or affiliated with any management company or parent organization. All public information and media remain the property of their respective copyright owners.

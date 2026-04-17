# Nexus Board 🎮

A high-performance, Bento-styled game completion board designed for focused gamers. Built with the latest Next.js App Router and integrated with Google Gemini for intelligent achievement roadmaps.

## ⚡ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Gemini 2.5 Flash Lite
- **Animations:** Framer Motion (Hardware-accelerated) 
- **Database:** PostgreSQL via Prisma 7
- **Styling:** Tailwind CSS v4 (Bento Grid Design)
- **State:** React Server Actions & Custom Browser Events

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone [your-repo-url]
cd nexus-board
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_api_key"
```

### 4. Sync the Database

```bash
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🛠 Features

- **Smart Fill:** AI roadmaps sent directly to your tracker via custom events
- **Bento UI:** Optimized 3-column desktop layout with locked viewport
- **Fast Search:** Debounced game art fetching via CheapShark API
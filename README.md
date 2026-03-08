# MyBizTools

A Nigerian business productivity SaaS — invoices, receipts, payslips, quotations, budget tracking, social planner, and AI assistant (DEDA) in one platform.

---

## Project Structure

```
mybiztools/
├── src/                        # Frontend (React + Vite + TypeScript)
│   ├── admin/                  # Admin module (embedded in frontend build)
│   │   ├── components/         # Admin UI components
│   │   ├── config/             # Admin constants
│   │   ├── pages/              # Admin dashboard page
│   │   ├── services/           # Admin-specific services (auth, payments, subscriptions)
│   │   ├── types/              # Admin TypeScript types
│   │   ├── utils/              # Admin helper utilities
│   │   └── index.ts            # Admin module exports
│   ├── components/             # Shared UI components
│   │   ├── auth/               # Auth helpers (ProtectedRoute, Input)
│   │   ├── businesscard/       # Business card form & preview
│   │   ├── communication/      # SMS send modal
│   │   ├── dashboard/          # DEDA chat widget, dashboard mockup
│   │   ├── invoice/            # Invoice form, preview, send modal
│   │   ├── landing/            # Landing page sections
│   │   ├── payslip/            # Payslip form & preview
│   │   ├── quotation/          # Quotation form & preview
│   │   ├── receipt/            # Receipt form & preview
│   │   ├── social/             # Social planner components
│   │   └── ui/                 # Generic UI (Button, Card, Toast)
│   ├── config/                 # API config, DEDA system prompt
│   ├── contexts/               # React contexts (AuthContext)
│   ├── hooks/                  # Custom React hooks
│   ├── layout/                 # Dashboard layout, Sidebar, TopBar
│   ├── pages/                  # Route-level page components
│   ├── services/               # Frontend API services (auth, email, termii)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Utility functions per domain
│
├── mybiztools-backend/         # Backend (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (27 models)
│   │   └── migrations/         # Migration history
│   ├── scripts/
│   │   └── createAdmin.ts      # Seed script to create admin user
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts       # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/             # Express route handlers
│   │   ├── services/           # Business logic services
│   │   └── utils/              # Validation helpers
│   ├── server.ts               # Express app entry point
│   └── .env                    # Environment variables (not committed)
│
├── admin-portal/               # Standalone admin login portal (separate Vite app)
│
├── public/                     # Static assets served by Vite
│   └── Image/                  # Product screenshots used on landing page
│
├── scripts/                    # Deployment scripts (GCP)
├── index.html                  # Vite entry HTML
├── vite.config.ts / tsconfig.json / tailwind.config.js
└── docker-compose.yml / Dockerfile / nginx.conf
```

---

## Getting Started

### Frontend

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Output to dist/
```

### Backend

```bash
cd mybiztools-backend
npm install
npm run dev          # http://localhost:3001

# Database
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

**Frontend** — `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

**Backend** — `mybiztools-backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/mybiztools
JWT_SECRET=your-secret-key
RESEND_API_KEY=re_...
ANTHROPIC_API_KEY=sk-ant-...
TERMII_API_KEY=...
MONNIFY_API_KEY=...
MONNIFY_SECRET_KEY=...
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, Framer Motion |
| Routing | React Router v7 |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| Backend | Express.js, TypeScript |
| ORM | Prisma 7 + pg adapter |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken) |
| Email | Resend |
| SMS | Termii |
| Payments | Monnify |
| AI | Anthropic Claude (DEDA assistant) |

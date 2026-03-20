# SaaSify — Full-Stack SaaS Starter

A production-ready SaaS scaffold with Next.js 15, FastAPI, Clerk Auth, Stripe billing, and PostgreSQL.

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker + Docker Compose (recommended)
- A Clerk account (free): https://clerk.com
- A Stripe account (free test mode): https://stripe.com

---

## Option A: Docker Compose (recommended)

```bash
# 1. Clone and configure secrets
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Fill in your Clerk + Stripe keys in both files, then:
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Option B: Manual

### Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
# Fill in CLERK and STRIPE keys
npm install
npm run dev
```

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your environment variables

# Start a local Postgres (or use Railway/Render free tier)
alembic upgrade head
uvicorn app.main:app --reload
```

---

## Architecture

```
/
├── frontend/           # Next.js 15 + Tailwind + Clerk
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Protected dashboard
│   │   ├── billing/page.tsx      # Stripe billing UI
│   │   ├── sign-in/              # Clerk sign-in
│   │   ├── sign-up/              # Clerk sign-up
│   │   └── api/stripe/           # Checkout + webhook handlers
│   └── middleware.ts             # Clerk auth protection
│
├── backend/            # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── main.py               # FastAPI app + CORS
│   │   ├── core/
│   │   │   ├── config.py         # Settings (pydantic-settings)
│   │   │   ├── database.py       # Async SQLAlchemy engine
│   │   │   └── auth.py           # Clerk JWT verification
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   └── project.py
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── api/routes/           # REST endpoints
│   │       ├── users.py          # GET /me, POST /sync, PATCH /me
│   │       ├── projects.py       # CRUD /projects
│   │       └── billing.py        # Stripe checkout, portal, webhook
│   └── migrations/               # Alembic migrations
│
└── docker-compose.yml  # Local dev environment
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto-increment |
| clerk_id | varchar(255) UNIQUE | Clerk user ID |
| email | varchar(255) UNIQUE | |
| first_name / last_name | varchar(100) | |
| stripe_customer_id | varchar(255) | |
| stripe_subscription_id | varchar(255) | |
| plan | varchar(50) | starter / pro / enterprise |
| plan_active | boolean | |
| created_at / updated_at | datetime | |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| user_id | int FK → users.id | |
| name | varchar(255) | |
| slug | varchar(255) UNIQUE | URL-safe name |
| description | text | |
| status | varchar(50) | active / archived |
| created_at / updated_at | datetime | |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm i -g vercel
vercel deploy --prod
```

Set these environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_API_URL` → your Railway/Render backend URL

### Backend → Railway (free tier)

1. Create a new project at https://railway.app
2. Add a PostgreSQL plugin
3. Connect your GitHub repo, set root to `backend/`
4. Add environment variables (from `.env.example`)
5. Railway auto-detects `railway.json` and deploys via Docker

### Backend → Render (free tier alternative)

```bash
# The render.yaml in backend/ is pre-configured
# Just connect your GitHub repo at https://render.com
# and point to render.yaml
```

---

## Stripe Setup

1. Create products in your Stripe dashboard (test mode)
2. Copy the **price IDs** into:
   - `frontend/app/billing/page.tsx` → `PLANS[].priceId`
   - `backend/app/api/routes/billing.py` → `PLAN_PRICE_MAP`
3. Set up webhook: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| GET | /users/me | Bearer | Get current user |
| POST | /users/sync | Bearer | Sync Clerk user to DB |
| PATCH | /users/me | Bearer | Update profile |
| GET | /projects | Bearer | List projects |
| POST | /projects | Bearer | Create project |
| GET | /projects/:slug | Bearer | Get project |
| PATCH | /projects/:slug | Bearer | Update project |
| DELETE | /projects/:slug | Bearer | Delete project |
| POST | /billing/checkout | Bearer | Create Stripe checkout |
| POST | /billing/portal | Bearer | Open billing portal |
| POST | /billing/webhook | None | Stripe webhook |

Interactive docs: http://localhost:8000/docs

---

## Running Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest tests/ -v
```

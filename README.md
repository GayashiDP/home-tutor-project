# Home Tutor System

Full-stack tutoring platform for student registration, login, role-based dashboards, and profile management.

## Tech Stack

- Frontend: React, Vite, React Router, React Hook Form, Zod, Axios
- Backend: Java 17, Spring Boot, JDBC, Supabase Postgres
- Auth: Server-issued session token stored by the frontend

## Repository Layout

```text
.
  frontend/              React client
  backend/               Spring Boot API
  PROJECT_STRUCTURE.md   Detailed source tree guide
  IMPLEMENTATION_GUIDE.md
```

## Prerequisites

- Node.js 20+
- Java 17+
- Maven 3.9+
- Supabase project with database password
- Optional: `psql` for running migrations from the terminal

## Setup

```bash
npm install --prefix frontend
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Configure `backend/.env` with your Supabase database host, database name, user, and password.

Run migrations:

```bash
psql "host=db.your-project-ref.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" -f backend/db/migrations.sql
```

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Verification

```bash
npm run lint
npm run build
```

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `PATCH /api/profile`

## GitHub Notes

- `.env` files, `node_modules`, build outputs, and Java targets are ignored.
- Use `.env.example` files as templates for local configuration.
- Do not commit secrets or generated build folders.

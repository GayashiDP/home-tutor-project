# Home Tutor System

A full-stack tutoring marketplace for students, tutors, and administrators. The application supports tutor discovery, booking management, manual payment approval, live lesson scheduling, receipts, and post-lesson reviews.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)

## Overview

Home Tutor System is built for a complete tutoring workflow:

- Students browse tutors, filter by subject, book lessons, upload payment slips, join live classes, and leave reviews after lessons end.
- Tutors manage subjects, availability, lesson prices, confirmed bookings, and live meeting links.
- Admins manage tutor status, approve or reject payment slips, issue receipts, and moderate reviews.

The frontend is a React single-page app. The backend is a Spring Boot REST API backed by PostgreSQL/Supabase.

## Key Features

| Area | Capability |
| --- | --- |
| Authentication | JWT login, student/tutor registration, seeded admin account, role-based route protection |
| Tutor browsing | Public tutor catalog, subject filters, ratings, review counts, latest feedback snippets |
| Homepage data | Live counts for active students, expert tutors, subjects covered, and satisfaction rate |
| Bookings | Student booking requests, tutor pricing, cancellation handling, booking status tracking |
| Payments | Student payment slip upload, admin approval/rejection, receipt generation and download |
| Live lessons | Tutor-created meeting links for confirmed bookings, schedule conflict checks, join window control |
| Reviews | One review per student booking, available only after the scheduled lesson end time |
| Administration | Tutor suspension/reactivation, payment approval queue, review moderation |
| Database support | Supabase/PostgreSQL schema repair on startup for operational columns and indexes |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 6, React Hook Form, Axios |
| Styling | Custom CSS, responsive layout, light/dark theme support |
| Backend | Java 17, Spring Boot 3.3.5, Spring Web, Spring JDBC, Bean Validation |
| Auth | JWT with `jjwt`, BCrypt password hashing |
| Database | PostgreSQL, Supabase-compatible connection settings |
| Tooling | npm, Maven |

## Project Structure

```text
.
├── README.md
├── package.json
├── LIVE_SESSION_INTEGRATION.md
├── backend/
│   ├── pom.xml
│   ├── package.json
│   ├── .env
│   └── src/main/
│       ├── resources/
│       │   └── application.properties
│       └── java/com/hometutor/
│           ├── HomeTutorApplication.java
│           ├── admin/
│           ├── auth/
│           ├── availability/
│           ├── booking/
│           ├── config/
│           ├── home/
│           ├── live/
│           ├── payment/
│           ├── profile/
│           ├── review/
│           ├── shared/
│           ├── subject/
│           ├── tutor/
│           └── user/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env
    └── src/
        ├── App.jsx
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── pages/
        ├── services/
        └── utils/
```

## Prerequisites

- Java 17
- Maven 3.9 or newer
- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL database, or a Supabase project with direct database credentials

## Environment Configuration

Create `backend/.env`:

```env
PORT=5002

DB_HOST=your-supabase-db-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_SSL_MODE=require

DB_POOL_MAX_SIZE=2
DB_POOL_MIN_IDLE=0
DB_CONNECTION_TIMEOUT_MS=10000
DB_IDLE_TIMEOUT_MS=30000
DB_MAX_LIFETIME_MS=300000

JWT_SECRET=replace-this-with-a-long-random-production-secret
JWT_EXPIRATION_MS=86400000

ADMIN_EMAIL=admin@hometutor.lk
ADMIN_PASSWORD=change-this-password
ADMIN_NAME=Admin User
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5002/api
```

Notes:

- The backend default port is `5001`, but this workspace is configured to use `5002`.
- If you change `PORT`, update `VITE_API_URL` to match.
- Use `DB_SSL_MODE=require` for Supabase.
- Use `DB_SSL_MODE=disable` only for a local PostgreSQL instance without SSL.
- Do not commit real `.env` values.

## Database

The backend expects the main application tables to exist in PostgreSQL/Supabase:

- `users`
- `subjects`
- `availability_slots`
- `bookings`
- `payments`
- `receipts`
- `live_sessions`
- `reviews`
- `notifications`
- `audit_logs`

On startup, `SchemaInitializer` also applies safe compatibility updates, including:

- user status support
- session price support
- payment slip storage columns
- payment approval columns
- live session table/columns/check constraints
- live session time indexes
- unique review-per-booking/student index

This allows the app to work with the current Supabase schema while still repairing missing operational columns needed by the latest code.

## Installation

Install frontend dependencies:

```bash
npm --prefix frontend install
```

The backend dependencies are resolved by Maven when the backend is built or started.

## Running Locally

Start the backend from the project root:

```bash
PORT=5002 mvn -f backend/pom.xml spring-boot:run
```

Backend health checks:

```text
http://localhost:5002/health
http://localhost:5002/api/health
```

Start the frontend in another terminal:

```bash
npm --prefix frontend run dev
```

Frontend URL:

```text
http://localhost:5173
```

You can also use the root scripts:

```bash
npm run dev:backend
npm run dev:frontend
```

If you use `npm run dev:backend`, make sure `PORT=5002` is set in `backend/.env` or your shell.

## Makefile Shortcuts

The project includes a root `Makefile` for common development commands:

```bash
make help          # Show all available commands
make env           # Create .env files from .env.example when missing
make setup         # Create env files and install dependencies
make install       # Install frontend packages and resolve backend dependencies
make doctor        # Show Node, npm, Java, and Maven versions
make frontend      # Run only the React/Vite frontend
make backend       # Run only the Spring Boot backend on PORT=5002
make dev           # Run frontend and backend together
make both          # Alias for make dev
make preview       # Preview the built frontend
make build         # Build frontend and run backend tests
make check         # Alias for make build
make health        # Check the backend health endpoint
make stop-backend  # Stop the process listening on the backend port
make clean         # Remove frontend dist, backend target, and .DS_Store files
make clean-deps    # Remove frontend/node_modules
make clean-all     # Remove generated files and frontend/node_modules
make clear         # Alias for make clean-all
make push-ready    # Verify, clean generated files, and show git status
make status        # Show git status if this folder is a git repository
```

You can override ports when needed:

```bash
make backend PORT=5003
make frontend FRONTEND_PORT=5174
make dev PORT=5003 FRONTEND_PORT=5174
```

`make push-ready` runs the build checks first, then removes generated files and `frontend/node_modules`. It does not delete local `.env` files, and `.gitignore` prevents those secrets from being committed.

## Build and Verification

Run the frontend production build:

```bash
npm --prefix frontend run build
```

Compile and test the backend:

```bash
mvn -f backend/pom.xml test
```

Run both from the root package script:

```bash
npm run build
```

Important: there is no root Maven `pom.xml`. Run Maven with `-f backend/pom.xml` from the project root, or run Maven commands inside the `backend/` directory.

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage with live platform statistics and subject entry points |
| `/login` | Public | User login |
| `/signup` | Public | Student/tutor registration |
| `/tutors` | Public/student flow | Browse tutors and filter by subject |
| `/tutors/:id` | Public/student flow | Tutor profile, availability, and booking form |
| `/dashboard` | Authenticated | Role-based dashboard |
| `/sessions` | Student, Tutor | Bookings, payments, live lessons, reviews |
| `/profile` | Authenticated | Profile details and tutor subject summary |
| `/transactions` | Student | Payment history and receipts |
| `/tutor/availability` | Tutor | Manage weekly availability |
| `/tutor/subjects` | Tutor | Manage tutor subjects |
| `/admin/users` | Admin | Tutor account management |
| `/admin/payments` | Admin | Payment approval queue |
| `/admin/reviews` | Admin | Review moderation |

## API Reference

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

Base URL in local development:

```text
http://localhost:5002/api
```

Endpoint paths below are relative to `/api`, except the root health check which is shown as a full URL.

### Public and Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `http://localhost:5002/health` or `/health` | Server health check |
| `GET` | `/home/summary` | Homepage statistics and active subjects |
| `POST` | `/auth/register` | Register a student or tutor |
| `POST` | `/auth/login` | Login and receive user data/JWT |
| `POST` | `/auth/logout` | Logout response endpoint |
| `GET` | `/tutors?name=&subject=` | List active tutors, optionally filtered |
| `GET` | `/tutors/{id}` | Get tutor details |
| `GET` | `/availability/tutors/{tutorId}` | Get public tutor availability |
| `GET` | `/reviews/tutors/{tutorId}` | Get public tutor reviews |

### Profile and Tutor Tools

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Current user profile |
| `PATCH` | `/profile` | Update current user profile |
| `GET` | `/subjects/my` | Tutor subject list |
| `POST` | `/subjects` | Create tutor subject |
| `DELETE` | `/subjects/{id}` | Remove tutor subject |
| `GET` | `/availability/my` | Tutor availability slots |
| `POST` | `/availability/my` | Create tutor availability slot |
| `PATCH` | `/availability/my/{slotId}` | Update tutor availability slot |

### Bookings, Payments, and Receipts

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/bookings` | Student creates a booking request |
| `GET` | `/bookings/my` | Current user's bookings |
| `GET` | `/bookings/{bookingId}` | Booking details |
| `PATCH` | `/bookings/{bookingId}/cancel` | Cancel a booking |
| `PATCH` | `/bookings/{bookingId}/price` | Tutor sets session price |
| `POST` | `/payments/slips/{bookingId}` | Student uploads payment slip |
| `GET` | `/payments/history` | Student payment history |
| `GET` | `/payments/receipt/{receiptOrPaymentId}` | Download receipt |
| `GET` | `/payments/approvals` | Admin payment approval list |
| `PATCH` | `/payments/{paymentId}/approve` | Admin approves payment |
| `PATCH` | `/payments/{paymentId}/reject` | Admin rejects payment |
| `GET` | `/payments/{paymentId}/slip` | Admin downloads uploaded slip |

### Live Sessions

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/live-sessions/my` | Current user's live sessions |
| `GET` | `/live-sessions/booking/{bookingId}` | Live session attached to a booking |
| `POST` | `/live-sessions` | Tutor creates or updates a live session |
| `PATCH` | `/live-sessions/{liveSessionId}/cancel` | Tutor cancels a live session |
| `PATCH` | `/live-sessions/{liveSessionId}/complete` | Tutor marks a live session complete |

### Reviews and Admin

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/reviews` | Student submits a lesson review |
| `GET` | `/reviews` | Admin lists all reviews |
| `DELETE` | `/reviews/{reviewId}` | Admin deletes a review |
| `GET` | `/admin/users` | Admin user dashboard data |
| `PATCH` | `/admin/tutors/{tutorId}/suspend` | Suspend a tutor |
| `PATCH` | `/admin/tutors/{tutorId}/activate` | Reactivate a tutor |

## Core Business Rules

### Booking and Payment

1. A student creates a booking request from a tutor's profile.
2. The tutor sets the session price.
3. The student uploads a payment slip.
4. The admin approves or rejects the payment.
5. Approval confirms the booking and enables live lesson scheduling.
6. A receipt is issued after approval.

### Live Lessons

- Only tutors can create or update live sessions.
- Live sessions can be scheduled only for confirmed bookings.
- Meeting links must start with `http://` or `https://`.
- Session end time must be after start time.
- Live sessions must be at least 15 minutes and no longer than 4 hours.
- Past start times are rejected.
- Tutor and student schedule overlaps are rejected.
- Students can only see/join the meeting link when the join window opens.

### Reviews

- Only students can leave reviews.
- A review is allowed only after the scheduled lesson end time.
- Each student can review a booking only once.
- Browse Tutors shows real ratings, review counts, and latest feedback from the database.

## Common Troubleshooting

### `mvn clean install` says there is no POM

You are running Maven from the project root. Use:

```bash
mvn -f backend/pom.xml clean install
```

or:

```bash
cd backend
mvn clean install
```

### Frontend shows `ERR_CONNECTION_REFUSED`

The backend is not running on the URL configured in `frontend/.env`.

Check:

```bash
lsof -nP -iTCP:5002 -sTCP:LISTEN
curl http://localhost:5002/api/health
```

Then start the backend:

```bash
PORT=5002 mvn -f backend/pom.xml spring-boot:run
```

### Backend says port `5002` is already in use

Find and stop the process:

```bash
lsof -nP -iTCP:5002 -sTCP:LISTEN
kill <PID>
```

Then restart the backend.

### `POST /api/auth/register` returns `400`

The registration request is invalid. The backend requires:

- `fullName`
- `email`
- `password`
- `confirmPassword`
- `role` as `Student` or `Tutor`

The frontend signup form includes the confirm password field and displays the backend validation message.

### `POST /api/live-sessions` returns `409`

The request conflicts with live session rules. Common causes:

- booking is not confirmed
- start time is in the past
- meeting link is invalid
- session overlaps another tutor live lesson
- session overlaps another student live lesson

The scheduler modal displays the exact backend message.

### `subjects.map is not a function`

The subject manager must read `subjects` from the API response wrapper:

```json
{ "subjects": [] }
```

The current frontend normalizes that shape before rendering.

## Development Notes

- Frontend API calls are centralized in `frontend/src/services/api.js`.
- Auth state is managed in `frontend/src/contexts/AuthContext.jsx`.
- Backend data access is centralized in `backend/src/main/java/com/hometutor/user/UserRepository.java`.
- Cross-origin requests are allowed for local Vite ports matching `localhost:517*` and `127.0.0.1:517*`.
- Admin user creation is handled by `AdminUserSeeder` when admin environment variables are provided.
- Schema compatibility updates run on startup through `SchemaInitializer`.

## Production Checklist

- Use a strong `JWT_SECRET`.
- Change the default admin password.
- Store environment variables outside source control.
- Restrict CORS origins to production domains.
- Use HTTPS for frontend, backend, and meeting links.
- Keep Supabase credentials private.
- Run frontend build and backend tests before deployment.
- Review database backup and retention policies.

## License

Academic project. Update this section if a formal license is required.

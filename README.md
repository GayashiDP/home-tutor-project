<div align="center">

# 🎓 Home Tutor System

**A full-stack tutoring platform connecting students with qualified tutors in Sri Lanka**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Academic-yellow?style=for-the-badge)](#-license)

[🚀 Live Demo](#) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>

---

## 📌 Overview

**Home Tutor System** is a full-stack platform that bridges the gap between students and verified tutors. Students can discover tutors, book sessions, and manage payments — while tutors control their schedule, subjects, and pricing. Admins keep the platform running smoothly.

> 3 Roles Supported &nbsp;•&nbsp; Secure JWT Auth &nbsp;•&nbsp; Manual Payment Verification &nbsp;•&nbsp; Light / Dark Theme

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Auth** | Separate dashboards for Student, Tutor, and Admin |
| 👩‍🎓 **Student Dashboard** | Browse tutors, book sessions, upload payment slips, leave reviews |
| 👨‍🏫 **Tutor Dashboard** | Manage subjects, availability slots, bookings, and session prices |
| 🛡️ **Admin Panel** | User management, payment approval, and review moderation |
| 💳 **Payment Workflow** | Manual bank slip upload → Admin verify → Receipt issued |
| ⭐ **Review System** | Students review tutors after completed sessions |
| 🌗 **Light / Dark Theme** | Fully themed responsive UI |
| ⚡ **Fast & Modern** | Vite-powered frontend with instant HMR |

---

## 🛠️ Tech Stack

```
Frontend     → React 18 + Vite 5 + React Router v6 + React Hook Form
Styling      → Tailwind CSS 3 + Custom CSS (light/dark theme)
Backend      → Java 17 + Spring Boot 3.3.5 + Spring JDBC + Spring Web
Auth         → JWT (jjwt 0.12.6) + BCrypt password hashing
Database     → PostgreSQL / Supabase
Build Tools  → npm + Maven 3.9+
```

---

## 📁 Project Structure

```
.
├── README.md
├── package.json                   # Root scripts
├── backend/
│   ├── pom.xml
│   ├── .env                       # Backend env vars (not committed)
│   └── src/main/
│       ├── resources/
│       │   └── application.properties
│       └── java/com/hometutor/
│           ├── HomeTutorApplication.java
│           ├── auth/
│           ├── admin/
│           ├── availability/
│           ├── booking/
│           ├── config/
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
    ├── .env                        # Frontend env vars (not committed)
    └── src/
        ├── App.jsx
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── pages/
        ├── services/
        └── utils/
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17** ([download](https://adoptium.net/))
- **Maven 3.9+** ([download](https://maven.apache.org/))
- **Node.js 18+** ([download](https://nodejs.org/))
- A PostgreSQL database or a [Supabase](https://supabase.com/) project (free tier works!)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/home-tutor-system.git
cd home-tutor-system
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Set up environment variables

Create `backend/.env`:

```env
PORT=5001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_SSL_MODE=disable

JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRATION_MS=86400000

ADMIN_EMAIL=admin@hometutor.lk
ADMIN_PASSWORD=admin12345
ADMIN_NAME=Admin User
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

> 💡 Using Supabase? Set your Supabase DB credentials and change `DB_SSL_MODE=require`

### 4. Start the development servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
npm run dev:backend
# or: cd backend && mvn spring-boot:run
```
API runs at: **http://localhost:5001** &nbsp;|&nbsp; Health check: **http://localhost:5001/api/health**

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```
App runs at: **http://localhost:5173** 🎉

---

## 📜 Available Scripts

**From the project root:**
```bash
npm run dev:frontend     # Start Vite dev server
npm run dev:backend      # Start Spring Boot
npm run build            # Build frontend + run backend Maven tests
npm run build:frontend   # Build frontend only
npm run test:backend     # Run backend Maven tests
```

**From `frontend/`:**
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
```

**From `backend/`:**
```bash
mvn spring-boot:run    # Start the API
mvn test               # Run unit tests
mvn clean package      # Build the JAR
```

---

## 🗺️ Routes

### Frontend

| Path | Access |
|---|---|
| `/` | Public |
| `/login` | Public |
| `/signup` | Public |
| `/tutors` | Students only |
| `/tutors/:id` | Students only |
| `/dashboard` | Authenticated users |
| `/sessions` | Students & Tutors |
| `/profile` | Authenticated users |
| `/transactions` | Students |
| `/tutor/availability` | Tutors only |
| `/tutor/subjects` | Tutors only |
| `/admin/users` | Admins only |
| `/admin/payments` | Admins only |
| `/admin/reviews` | Admins only |

### Backend API

**Base URL:** `http://localhost:5001/api`

> All protected endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a student or tutor |
| `POST` | `/auth/login` | Sign in and receive a JWT |
| `GET` | `/profile` | Get current user profile |
| `PATCH` | `/profile` | Update current user profile |
| `GET` | `/tutors` | List active tutors |
| `GET` | `/tutors/{id}` | Get tutor details |
| `GET/POST` | `/subjects/my` | Get or add tutor subjects |
| `DELETE` | `/subjects/{id}` | Remove tutor subject |
| `GET/POST` | `/availability/mine` | Get or save tutor availability |
| `GET` | `/availability/tutors/{tutorId}` | Get public tutor availability |
| `POST` | `/bookings` | Create a booking |
| `GET` | `/bookings/my` | Get current user's bookings |
| `PATCH` | `/bookings/{bookingId}/cancel` | Cancel a booking |
| `PATCH` | `/bookings/{bookingId}/price` | Tutor sets session price |
| `POST` | `/payments/slips/{bookingId}` | Upload a payment slip |
| `GET` | `/payments/history` | Student payment history |
| `GET` | `/payments/approvals` | Admin payment approval list |
| `PATCH` | `/payments/{paymentId}/approve` | Admin approves payment |
| `PATCH` | `/payments/{paymentId}/reject` | Admin rejects payment |
| `POST` | `/reviews` | Submit a review |
| `GET` | `/reviews` | Admin: list all reviews |
| `DELETE` | `/reviews/{reviewId}` | Admin: delete a review |
| `GET` | `/admin/users` | Admin user summaries |
| `PATCH` | `/admin/tutors/{tutorId}/suspend` | Suspend a tutor |
| `PATCH` | `/admin/tutors/{tutorId}/activate` | Reactivate a tutor |

---

## 💳 Payment Slip Workflow

```
Student books a session
        ↓
Tutor sets the session price
        ↓
Student uploads a bank/payment slip
        ↓
  Status → PendingApproval
        ↓
Admin reviews the slip
        ↓
  Approved ✅            Rejected ❌
      ↓
Appears in transaction history & admin summaries
```

> No card payment gateway — all payments are manual bank transfers verified by the admin.

---

## 👥 Roles

| Role | Capabilities |
|---|---|
| 👩‍🎓 `Student` | Browse tutors, book sessions, upload payment slips, leave reviews |
| 👨‍🏫 `Tutor` | Manage profile, subjects, availability, bookings, session prices |
| 🛡️ `Admin` | Manage all users, approve/reject payments, moderate reviews |

---

## 🌐 Deployment

### Vercel (Frontend — Recommended)

```bash
cd frontend && npm run build
# Deploy the dist/ folder to Vercel
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Netlify (Frontend)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

> ⚠️ Remember to add your `VITE_API_URL` environment variable in the deployment platform's settings!

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 🔒 Security Notes

- **Never commit `.env` files** — add them to `.gitignore`
- **Never commit** `node_modules/`, `dist/`, or `backend/target/`
- Use a strong, random `JWT_SECRET` in production
- Keep all database credentials in environment variables only

---

## 👥 Team

**Home Tutor System Development Team**

> Built with ❤️ for students and tutors across Sri Lanka

---

## 📄 License

This project is for **academic and learning purposes**. Add a `LICENSE` file before publishing if you plan to distribute it publicly.

---

<div align="center">

**⭐ Star this repo if you found it useful!**

</div>

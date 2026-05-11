# Project Structure

This repository uses a conventional full-stack layout with separate frontend and backend applications.

## Frontend

```text
frontend/src
  App.jsx              App shell and route definitions
  main.jsx             React entry point
  index.css            Global styles
  assets/              Static frontend assets
    images/            App images
    icons/             Icons and SVGs
  components/          Shared UI components
    common/            Cross-page components such as ProtectedRoute
  contexts/            React context providers and values
  hooks/               Custom React hooks
  layout/              Shared layout shells
  pages/               Route-level pages
    auth/              Login and signup pages
    dashboard/         Student and tutor dashboard pages
    profile/           Profile view and edit page
  services/            API client and API service modules
  utils/               Validators, constants, storage helpers
  data/                Local mock data and fixtures
  tests/               Frontend tests
```

## Backend

```text
backend/src/main/java/com/hometutor
  auth/                Authentication feature
    controller/        REST controllers
    dto/               Request/response DTOs
    exception/         Auth-specific exceptions
    service/           Business logic
  profile/             Profile feature
    controller/
    dto/
    exception/
    service/
  user/                User persistence
  config/              Application configuration
  shared/exception/    Global API exception handling
```

## Conventions

- Frontend route screens live under `pages`, reusable pieces under `components`, and API calls under `services`.
- Backend code is grouped by feature, then by technical role (`controller`, `service`, `dto`, `exception`).
- Global CSS lives in `frontend/src/index.css`.
- The shared Axios client lives in `frontend/src/services/api.js`.

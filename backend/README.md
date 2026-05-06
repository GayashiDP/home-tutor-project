# Home Tutor Backend API

Java + Spring Boot backend for the Home Tutor System.

## Setup

### 1. Install Dependencies
```bash
mvn dependency:resolve
```

### 2. Database Setup

#### Update .env
Edit `.env` with your Supabase Postgres credentials:
```
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-database-password
DB_SSL_MODE=require
```

#### Run Migrations
```bash
psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=$DB_SSL_MODE" -f db/migrations.sql
```

### 3. Start Server
```bash
mvn spring-boot:run
```

Server will run on `http://localhost:5001`

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "Student"
  }
  ```
- Response: `201 Created`
  ```json
  {
    "message": "Registration successful",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Student"
    }
  }
  ```

## Validation Rules

- **fullName**: 2-255 characters, required
- **email**: Valid email format, unique in database
- **password**: Min 8 characters
- **confirmPassword**: Must match password
- **role**: Must be 'Student' or 'Tutor'

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "path": "email",
      "msg": "Please provide a valid email address"
    }
  ]
}
```

### 409 Conflict (Duplicate Email)
```json
{
  "error": "Email already registered",
  "field": "email"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

## Development

Use `mvn spring-boot:run` to start the API locally.

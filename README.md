# VaultBox

A simplified Dropbox-like web application for secure file storage and management.

## Overview

VaultBox allows users to upload, store, and manage files through a clean web interface. Files are stored securely in AWS S3 with metadata managed in MongoDB.

## Features

- **User Authentication**: Register/Login with JWT-based authentication
- **File Upload**: Drag-and-drop or click to upload (max 5MB)
- **Supported Formats**: PDF, TXT, JPG, JPEG, PNG, GIF, WEBP, JSON
- **File Management**: List, download, view, and delete files
- **In-Browser Preview**: View images, PDFs, text files, and JSON directly
- **Role-Based Access**:
  - Users can only see and manage their own files
  - Admin can view and manage all users' files

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Redux Toolkit |
| Backend | Java 17, Spring Boot 3.2 |
| Database | MongoDB 6 |
| File Storage | AWS S3 |
| Infrastructure | Docker, Docker Compose |

## Prerequisites

- Docker Desktop (v20+)
- AWS Account with S3 bucket configured
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vaultbox
```

### 2. Configure Environment

Create a `.env` file in the project root (copy from `.env.example`):

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
MONGODB_DATABASE=vaultbox

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION_MS=86400000

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-southeast-2

# Admin Account
ADMIN_EMAIL=admin@vaultbox.com
ADMIN_PASSWORD=admin123
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This will start all services:
- Frontend (React)
- Backend (Spring Boot)
- MongoDB
- Mongo Express (DB Admin UI)

### 4. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080 | - |
| MongoDB Admin | http://localhost:8081 | admin / admin123 |

### 5. Login

**Admin Account** (created on first startup):
- Email: `admin@vaultbox.com`
- Password: `admin123`

Or register a new user account.

## Stopping the Application

```bash
docker-compose down
```

To remove all data (including MongoDB volumes):
```bash
docker-compose down -v
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file (multipart) |
| GET | `/api/files` | List files |
| GET | `/api/files/{id}` | Get file metadata |
| GET | `/api/files/{id}/download` | Download file |
| DELETE | `/api/files/{id}` | Delete file |

## Project Structure

```
vaultbox/
├── backend/
│   ├── src/main/java/com/vaultbox/
│   │   ├── config/          # Spring configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── exception/       # Exception handling
│   │   ├── model/           # MongoDB entities
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # JWT authentication
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── store/           # Redux store
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## File Storage

Files are stored in S3 with the following key structure:
```
s3://bucket-name/vaultbox/{userId}/{uuid}_{filename}
```

## Security

- JWT tokens expire after 24 hours
- Passwords are hashed with BCrypt
- AWS credentials are stored in environment variables (never committed)
- All file operations are authorized per-user

## License

This project was created as part of a technical assessment.

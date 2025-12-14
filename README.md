# VaultBox

A simplified Dropbox-like web application for secure file storage and management.

## Overview

VaultBox allows users to upload, store, and manage files through a clean web interface. Files are stored securely in AWS S3 with metadata managed in MongoDB.

### Features

- User authentication (register/login)
- File upload (max 5MB, supported formats: txt, jpg, png, json)
- File listing and management
- File download and in-browser preview
- Role-based access control (User/Admin)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Redux |
| Backend | Java Spring Boot |
| Database | MongoDB |
| File Storage | AWS S3 |
| Infrastructure | Docker, Docker Compose |

## Prerequisites

- Docker Desktop
- AWS Account with S3 bucket

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vaultbox
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and preferences
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - MongoDB Admin: http://localhost:8081

## Default Admin Account

On first startup, an admin account is created:
- Email: `admin@vaultbox.com`
- Password: `admin123`

(Configurable via environment variables)

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file |
| GET | `/api/files` | List files |
| GET | `/api/files/{id}` | Get file metadata |
| GET | `/api/files/{id}/download` | Download file |
| DELETE | `/api/files/{id}` | Delete file |

## Project Structure

```
vaultbox/
├── backend/          # Spring Boot application
├── frontend/         # React application
├── docker-compose.yml
├── .env.example
└── README.md
```

## License

This project was created as part of a technical assessment.


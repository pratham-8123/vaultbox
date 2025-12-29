# VaultBox

A simplified Dropbox-like web application for secure file storage and management.

## Overview

VaultBox allows users to upload, store, and manage files through a clean web interface. Files are stored securely in AWS S3 with metadata managed in MongoDB. The application features a full folder hierarchy system with intuitive navigation and search capabilities.

## Features

- **User Authentication**: Register/Login with JWT-based authentication
- **Folder Hierarchy**: Create nested folders with unlimited depth
- **File Upload**: Drag-and-drop or click to upload into any folder (max 5MB)
- **Supported Formats**: PDF, TXT, JPG, JPEG, PNG, GIF, WEBP, JSON
- **File Management**: List, download, view, and delete files
- **Folder Management**: Create, rename, and delete folders (cascade delete supported)
- **Breadcrumb Navigation**: Clickable path navigation from root to current folder
- **Search**: Find files and folders with partial match, case-insensitive search
- **In-Browser Preview**: View images, PDFs, text files, and JSON directly
- **Role-Based Access**:
  - Users can only see and manage their own files and folders
  - Admin can view and manage all users' files via user selector dropdown

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

### Browse

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/browse` | Browse folder contents (supports `parentId`, `userId` params) |

### Folders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/folders` | Create folder |
| GET | `/api/folders/{id}` | Get folder details |
| GET | `/api/folders` | List folders (supports `parentId`, `userId` params) |
| PATCH | `/api/folders/{id}/rename` | Rename folder |
| DELETE | `/api/folders/{id}` | Delete folder and contents |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file (multipart, supports `parentFolderId` param) |
| GET | `/api/files` | List all files |
| GET | `/api/files/{id}` | Get file metadata |
| GET | `/api/files/{id}/download` | Download file |
| DELETE | `/api/files/{id}` | Delete file |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search files and folders (`q`, `type`, `userId`, `page`, `size` params) |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |

## Project Structure

```
vaultbox/
├── backend/
│   ├── src/main/java/com/vaultbox/
│   │   ├── config/          # Spring configuration, data seeder
│   │   ├── controller/      # REST controllers (Auth, File, Folder, Browse, Search, User)
│   │   ├── dto/             # Data transfer objects
│   │   ├── exception/       # Exception handling
│   │   ├── model/           # MongoDB entities (User, FileMetadata, Folder)
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # JWT authentication
│   │   └── service/         # Business logic (Auth, File, Folder, Browse, Search, User)
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Breadcrumb, SearchBar, SearchResults
│   │   │   ├── files/       # FileCard, FolderCard, UploadModal, CreateFolderModal
│   │   │   └── layout/      # Header
│   │   ├── pages/           # Dashboard, Login, Register, FileView
│   │   ├── services/        # API services (auth, file, browse, search, user)
│   │   └── store/           # Redux slices (auth, files, browse)
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

## Folder Structure

Folders use a hybrid storage pattern:
- **Adjacency List**: `parentId` field for tree traversal
- **Materialized Path**: `path` field (e.g., `/Documents/Projects`) for breadcrumb generation

## Security

- JWT tokens expire after 24 hours
- Passwords are hashed with BCrypt
- AWS credentials are stored in environment variables (never committed)
- All file and folder operations are authorized per-user
- Admin role has elevated access to view all users' data

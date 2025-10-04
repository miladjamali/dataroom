# DataRoom API

> Backend API server for the DataRoom MVP application

## 🚀 Overview

The DataRoom API is built with **Hono** - a fast, lightweight web framework for modern JavaScript/TypeScript applications. It provides secure endpoints for authentication, file management, and data room operations.

## 🛠️ Technology Stack

- **Framework**: [Hono](https://hono.dev/) - Fast web framework
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Vercel Blob for secure file uploads
- **Validation**: Zod for runtime type validation
- **Runtime**: Node.js with TypeScript

## 📁 Project Structure

```
src/
├── index.ts          # Main application entry point
├── routes/           # API route handlers
├── middleware/       # Authentication & validation middleware
├── lib/             # Database connection & utilities
└── types/           # Local type definitions
```

## 🚀 Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Configure your database URL and JWT secret
   ```

3. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

5. **API available at:**
   ```
   http://localhost:3000
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Files & Folders
- `GET /api/files` - List files and folders
- `POST /api/files/upload` - Upload new file
- `POST /api/folders` - Create new folder
- `DELETE /api/files/:id` - Delete file
- `DELETE /api/folders/:id` - Delete folder

### Data Rooms
- `GET /api/datarooms` - List user's data rooms
- `POST /api/datarooms` - Create new data room
- `GET /api/datarooms/:id` - Get data room details

## 🗄️ Database Schema

The API uses Drizzle ORM with PostgreSQL. Database schemas are defined in the `@dataroom/models` package:

- **Users** - Authentication and user profiles
- **DataRooms** - Virtual data room containers
- **Files** - File metadata and storage references
- **Folders** - Hierarchical folder organization
- **Permissions** - Access control and sharing

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schema validation
- **CORS Configuration** - Controlled cross-origin requests
- **Rate Limiting** - API endpoint protection

## 🚀 Deployment

Recommended platforms for production deployment:

- **Vercel** - Serverless functions
- **Railway** - Container-based deployment
- **Render** - Managed hosting
- **Docker** - Containerized deployment

### Environment Variables

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
BLOB_READ_WRITE_TOKEN=vercel-blob-token
CORS_ORIGIN=http://localhost:5000
```

## 📖 Documentation

API documentation is available in the main project documentation at `/apps/docs` or visit [http://localhost:3001](http://localhost:3001) when running locally.

---

**Part of DataRoom MVP** - Take-Home Assessment Project

# DataRoom MVP

> **Take-Home Assessment Project**  
> A comprehensive secure virtual data room solution for Acme Corp's multi-billion dollar acquisition.

## 🎯 Project Overview

DataRoom MVP is a modern web application built to demonstrate real-world engineering capabilities through the development of a secure virtual data room solution. This project showcases:

- **User Experience & Functionality** - Intuitive UX flows, comprehensive edge case handling, and polished error states
- **Design & Polish** - Clean, professional design without unimplemented features
- **Code Quality & Architecture** - Well-structured, maintainable, and scalable codebase

## 🏗️ Architecture

Built as a **TypeScript monorepo** using modern web technologies:

### Apps
- **`web/`** - React 19 frontend with Vite, TanStack Router, and Tailwind CSS
- **`api/`** - Hono backend API with Drizzle ORM and PostgreSQL  
- **`docs/`** - Next.js documentation site using Nextra

### Packages
- **`@dataroom/ui`** - Shared React component library with Radix UI primitives
- **`@dataroom/types`** - TypeScript type definitions and API contracts
- **`@dataroom/auth`** - Authentication utilities and JWT handling
- **`@dataroom/models`** - Database models and Drizzle ORM schemas
- **`@dataroom/constants`** - Shared constants and configuration
- **`@dataroom/utils`** - Utility functions and helpers
- **`@repo/eslint-config`** - ESLint configurations for the monorepo
- **`@repo/typescript-config`** - TypeScript configurations

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/miladjamali/dataroom.git
   cd dataroom
   pnpm install
   ```

2. **Start development servers:**
   ```bash
   pnpm run dev
   ```

3. **Access applications:**
   - **Web App**: http://localhost:5000
   - **API Server**: http://localhost:3000
   - **Documentation**: http://localhost:3001

## 🛠️ Development

### Build all applications
```bash
pnpm run build
```

### Run tests
```bash
pnpm run test
```

### Lint codebase
```bash
pnpm run lint
```

## 📦 Technology Stack

- **Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS, Vite
- **Backend**: Hono, Drizzle ORM, PostgreSQL, Node.js
- **UI**: Custom component library, Radix UI, Lucide React icons
- **Build Tools**: Turbo (monorepo), Vite, pnpm workspaces
- **Storage**: Vercel Blob for file uploads
- **Documentation**: Next.js, Nextra, MDX

## 📚 Documentation

Comprehensive documentation is available at `/apps/docs` or visit the [online documentation](http://localhost:3001) when running locally.

## 🎨 Features

- ✅ **Secure Authentication** - JWT-based auth with password hashing
- ✅ **File Management** - Upload, organize, and manage documents
- ✅ **Folder Organization** - Hierarchical folder structure
- ✅ **Responsive Design** - Mobile-first, fully responsive interface
- ✅ **Type Safety** - End-to-end TypeScript implementation
- ✅ **Modern UI** - Clean design with smooth animations

## 🚀 Deployment

Recommended deployment platforms:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Vercel
- **Database**: Vercel Postgres, Supabase, PlanetScale

---

**Assessment Timeline**: 4-6 hours (flexible for thorough implementation)  
**Author**: Milad Jamali  
**License**: MIT
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

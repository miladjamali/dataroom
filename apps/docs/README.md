# DataRoom Documentation

> Comprehensive documentation site for the DataRoom MVP project

## 🚀 Overview

This documentation site is built with **Next.js** and **Nextra** to provide comprehensive documentation for the DataRoom MVP take-home assessment project. It includes setup guides, API references, architecture details, and deployment instructions.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React-based web framework
- **Documentation**: [Nextra](https://nextra.site/) - Next.js based documentation framework
- **Styling**: Tailwind CSS for custom styling
- **Icons**: Lucide React for consistent iconography
- **Content**: MDX for rich markdown content with React components

## 📁 Project Structure

```
pages/
├── index.mdx           # Documentation homepage
├── getting-started.mdx # Setup and installation guide
├── features.mdx        # Feature overview and capabilities
├── architecture.mdx    # Technical architecture details
├── api.mdx            # API reference and endpoints
├── deployment.mdx     # Deployment and hosting guide
└── _app.tsx           # Custom Next.js app component
```

## 🚀 Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm run dev
   ```

3. **Access documentation:**
   ```
   http://localhost:3001
   ```

4. **Build for production:**
   ```bash
   pnpm run build
   ```

## 📖 Content Structure

The documentation covers:

### 🏠 **Overview**
- Project introduction and assessment context
- Technology stack overview
- Quick start guide

### 🚀 **Getting Started**
- Prerequisites and system requirements
- Installation and setup instructions
- Environment configuration
- Development workflow

### ✨ **Features**
- Core functionality overview
- User interface components
- Authentication system
- File management capabilities

### 🏗️ **Architecture**
- Monorepo structure explanation
- Frontend architecture (React, TanStack Router)
- Backend architecture (Hono, Drizzle ORM)
- Database design and schemas
- Security implementation

### 🔌 **API Reference**
- Authentication endpoints
- File management APIs
- Data room operations
- Request/response examples

### 🚀 **Deployment**
- Production deployment guides
- Environment configuration
- Hosting platform recommendations
- Performance optimization

## 🎨 Customization

The documentation theme is configured in `theme.config.tsx`:

- **Branding**: DataRoom MVP logo and colors
- **Navigation**: Sidebar and page organization
- **SEO**: Meta tags and social sharing
- **Footer**: Project attribution and links

## 📝 Content Editing

Documentation content is written in **MDX** format, allowing:

- Standard Markdown syntax
- React component integration
- Code syntax highlighting
- Interactive examples
- Custom styling with Tailwind CSS

## 🔗 Integration

The documentation site is integrated with the main DataRoom application:

- **Navigation Link**: Accessible from web app header
- **Consistent Branding**: Matching design system
- **Cross-References**: Links between docs and application

## 🚀 Deployment

Recommended deployment platforms:

- **Vercel** - Optimal for Next.js applications
- **Netlify** - Static site hosting with continuous deployment
- **GitHub Pages** - Free hosting for public repositories

### Build Command
```bash
pnpm run build
```

### Output Directory
```
out/
```

---

**Part of DataRoom MVP** - Take-Home Assessment Project  
**Documentation Framework**: Next.js + Nextra  
**Live URL**: [http://localhost:3001](http://localhost:3001)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

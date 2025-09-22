# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Навигапп** is a Telegram Mini App for creating structured navigation within Telegram channels, groups, and chats through interactive cards and menus. It helps course creators, channel owners, and teams organize their content with an intuitive tool.

### Key Features
- **Free version**: 1 page, up to 8 cards, vertical list only
- **Pro version**: Unlimited pages/cards, multiple block types (grid, horizontal scroll, feed), internal pages, advanced analytics
- **Target users**: Course creators, channel owners, company teams

### Technology Stack ✅ (РЕАЛИЗОВАНО)
- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS, Zustand, @twa-dev/sdk ✅
- **Backend**: Deno (Supabase Edge Functions), PostgreSQL (Supabase), Prisma ORM ✅
- **Deployment**: Vercel (frontend) ✅, Supabase Edge Functions (backend) ✅
- **Current Status**: Phase 1 infrastructure completed and deployed

## Development Commands ✅ (РАБОТАЮТ)

**Frontend (развернуто на https://navigapp.vercel.app):**
```bash
cd frontend
npm run dev          # Start development server (работает)
npm run build        # Build for production (работает)
npm run lint         # Run ESLint (настроено)
npm run typecheck    # Run TypeScript checks (работает)
npm test             # Run Jest tests (настроено)
```

**Backend (Supabase Edge Functions - развернуто):**
```bash
# Automated deployment script
./deploy-functions.sh                    # Deploy all Edge Functions (работает)

# Manual deployment (if needed)
supabase functions deploy navigapp-api   # Deploy single function (работает)

# Database management
cd backend
npx prisma migrate deploy               # Apply migrations (готово)
npx prisma generate                     # Generate Prisma client (готово)

# API testing
curl https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api/health
```

**Project Setup (для новых разработчиков):**
```bash
# Clone and setup
git clone [repo-url]
cd navigapp

# Install dependencies
cd shared && npm install && npm run build
cd ../frontend && npm install

# Copy environment
cp .env.local frontend/.env.local

# Start development
cd frontend && npm run dev

# Test in Telegram
# Use ngrok http 5173 for local testing in Telegram
```

## Architecture Guidelines

### Frontend Architecture
- **Component Structure**: Atomic design methodology with reusable UI components
- **State Management**: Zustand for global state, React Hook Form for forms
- **Styling**: Tailwind CSS with CSS Modules for component-specific styles
- **Telegram Integration**: @twa-dev/sdk for haptic feedback, theming, and native buttons
- **Mobile-First**: Progressive enhancement for Telegram Mini Apps environment

### Backend Architecture ✅ (РЕАЛИЗОВАНО)
- **Runtime**: Deno (Supabase Edge Functions) ✅
- **API Design**: RESTful endpoints with CORS configured for Telegram ✅
- **Database**: PostgreSQL (Supabase) with Prisma schema ✅
- **Authentication**: Telegram WebApp initData validation ✅
- **Error Handling**: Standardized JSON responses ✅
- **Deployment**: Automated via deploy-functions.sh script ✅
- **Current Endpoints**: Health check, auth, pages (mock responses) ✅
- **Next Phase**: Database integration, real CRUD operations

### Key Components
- **Page Builder**: Multi-step wizard for creating navigation pages
- **Card Types**: Vertical lists (free), grid/horizontal/feed layouts (pro)
- **Analytics**: View/click tracking with dashboard (pro only)
- **Subscription System**: Free/Pro tiers with 7-day trial

## Documentation References

- **Product Vision**: `docs/navigapp_prd.md` - Complete product requirements and specifications
- **Backend Guidelines**: `docs/backend.md` - API design, database schema, authentication
- **Frontend Guidelines**: `docs/frontend.md` - Component architecture, UI patterns, Telegram integration

## Important Notes

- Always reference the comprehensive documentation in the `docs/` directory
- Follow Telegram Mini Apps guidelines for UI/UX patterns
- Implement subscription limits based on user tier (free vs pro)
- Ensure haptic feedback for all interactive elements
- Support both light and dark themes from Telegram
- Validate Telegram WebApp authentication properly
- Handle offline scenarios gracefully

## Development Workflow

1. **Planning**: Reference PRD for feature specifications
2. **Backend Development**: Follow `docs/backend.md` for API standards
3. **Frontend Development**: Follow `docs/frontend.md` for component patterns
4. **Testing**: Implement comprehensive unit and integration tests
5. **Deployment**: Use Vercel for frontend, Supabase for backend infrastructure

## Notes for Future Development

- When generating code, always reference the markdown documentation inside the "docs/" directory.
- Use navigapp_prd.md as a source of product vision
- Use the guidelines in
'docs/backend.md* for backend development
- Use the guidelines in 'docs/frontend. md*
for frontend

# Claude MCP Tools Guide for Navigapp Development

## Overview of Available Tools

This document describes the use of MCP (Model Context Protocol) tools for efficient development of the Telegram mini app "Navigapp". All tools are configured and ready to use.

---

## 🧠 Sequential Thinking
**Purpose:** Step-by-step problem solving and architecture planning

### When to use for Navigapp:
- **API endpoints design** — analyzing requirements for each endpoint
- **Component architecture planning** — breaking down React component structure
- **Integration task solving** — step-by-step Telegram WebApp API integration
- **Complex bug debugging** — systematic problem analysis
- **Development phase planning** — task decomposition into subtasks

### Usage examples:
```markdown
🎯 "Plan the PageBuilder component architecture considering all requirements"
🎯 "Analyze the best way to implement the Free/Pro version limits system"
🎯 "Break down step-by-step T-Bank API integration for subscriptions"
```

### Best practices:
- Use for tasks requiring multi-stage analysis
- Allow the tool to reconsider solutions during the process
- Apply for critically important architectural decisions

---

## 🔍 Brave Search
**Purpose:** Searching for current information on the internet

### When to use for Navigapp:
- **Telegram Mini Apps API research** — finding latest updates and examples
- **T-Bank API documentation study** — current payment methods
- **Best practices search** — modern approaches in React/Node.js development
- **Competitor research** — analyzing similar solutions in Telegram
- **Technical problem solutions** — Stack Overflow, GitHub issues

### Query examples:
```markdown
🔍 "Telegram Mini Apps haptic feedback implementation 2024"
🔍 "T-Bank API recurring payments webhook setup"
🔍 "React Zustand best practices TypeScript"
🔍 "Supabase Edge Functions deployment guide"
🔍 "Telegram WebApp theme integration CSS variables"
```

### Best practices:
- Search for current documentation (specify year 2024-2025)
- Use specific technical terms
- Verify official sources

---

## 🌐 Tavily MCP
**Purpose:** Deep web research and content analysis

### When to use for Navigapp:
- **Comprehensive technology research** — comparing frameworks and libraries
- **Documentation analysis** — extracting and structuring information from docs
- **Architectural patterns research** — studying enterprise solutions
- **Security analysis** — researching security best practices
- **Platform updates monitoring** — tracking API changes

### Usage examples:
```markdown
🌐 "Analyze Telegram Bot API documentation for Mini Apps"
🌐 "Research best practices for payment integration security"
🌐 "Find examples of successful Telegram Mini Apps with similar functionality"
🌐 "Study architectural solutions for SaaS with subscription model"
```

### Best practices:
- Use for deep analysis of technical solutions
- Combine with Sequential Thinking to structure found information
- Apply for researching enterprise-grade solutions

---

## 📁 Filesystem
**Purpose:** Working with project files (Desktop and projects folders)

### Navigapp project structure:
```
/Users/kirillshmonin/projects/navigapp/
├── backend/           # Node.js API
├── frontend/          # React Mini App
├── docs/             # Documentation
├── shared/           # Common types and utilities
└── deployment/       # Deploy scripts
```

### Main operations:

#### Project structure creation:
```markdown
📁 "Create directory /Users/kirillshmonin/projects/navigapp"
📁 "Create subdirectories: backend, frontend, docs, shared"
```

#### File operations:
```markdown
📁 "Create package.json for backend with required dependencies"
📁 "Read PRD.md content and create technical specification based on it"
📁 "Save database schema to backend/schema.sql file"
```

#### Configuration management:
```markdown
📁 "Create .env.example with necessary environment variables"
📁 "Set up tsconfig.json for frontend"
📁 "Create docker-compose.yml for local development"
```

### Best practices:
- Maintain clean folder structure
- Create README files for each module
- Use for rapid configuration prototyping

---

## 🎭 Playwright (main)
**Purpose:** Browser automation and testing

### Application for Navigapp:
- **Mini App E2E testing** — automating user scenarios
- **Telegram WebApp integration testing** — verifying correct operation in Telegram
- **UI component screenshots** — documenting interface
- **Deployment automation** — checking functionality after deployment

### Test scenario examples:
```markdown
🎭 "Open local mini app version and test page creation"
🎭 "Take screenshots of all main application screens"
🎭 "Test responsiveness on mobile screen sizes"
🎭 "Check correct operation of card creation forms"
```

### Best practices:
- Test critical user scenarios
- Use for regression testing
- Automate routine checks before deployment

---

## 🎭 Playwright MCP Server (additional)
**Purpose:** Extended automation and more complex scenarios

### Additional capabilities:
- **API testing** — checking backend endpoints
- **Integration testing** — testing frontend-backend connection
- **Load testing** — performance verification
- **Development task automation** — code generation, test data filling

### Usage examples:
```markdown
🎭 "Test API endpoints for page creation and management"
🎭 "Create automatic test for full cycle: registration → page creation → publishing"
🎭 "Fill test database with example pages and cards"
```

---

## 🔧 Tool Integration

### Typical development workflow:

#### 1. Planning (Sequential Thinking)
```markdown
"Plan implementation of subscription system with trial period"
```

#### 2. Research (Brave Search + Tavily)
```markdown
"Find current examples of T-Bank API integration"
"Study Telegram Mini Apps payments documentation"
```

#### 3. Implementation (Filesystem)
```markdown
"Create file structure for payments module"
"Implement API endpoints for subscription management"
```

#### 4. Testing (Playwright)
```markdown
"Test trial period activation flow"
"Check correct operation of Free version limits"
```

### Combined tasks:

#### Research + Planning:
```markdown
🔍 Brave Search: "Telegram Mini Apps authentication best practices"
🧠 Sequential Thinking: "Plan secure authentication based on found information"
```

#### Implementation + Testing:
```markdown
📁 Filesystem: "Create PageBuilder component"
🎭 Playwright: "Test created component in browser"
```

---

## ⚠️ Important Notes

### Tool limitations:
- **Filesystem** works only in specified directories
- **Playwright** requires running application for testing
- **Search tools** may have request quantity limits

### Usage recommendations:
1. **Always start with planning** (Sequential Thinking)
2. **Research before implementation** (Search tools)
3. **Test after each stage** (Playwright)
4. **Document the process** (Filesystem)

### Security:
- Don't pass real API keys in examples
- Use .env files for confidential data
- Test only on dev/staging environments

---

## 🎯 Quick Start for Navigapp

### First steps:
1. **Project setup:**
   ```markdown
   📁 "Create navigapp project structure in /Users/kirillshmonin/projects/"
   📁 "Create basic configuration files"
   ```

2. **Architecture planning:**
   ```markdown
   🧠 "Plan MVP version implementation considering Free tier limitations"
   ```

3. **Technology research:**
   ```markdown
   🔍 "Find current examples of Telegram Mini Apps with React"
   🌐 "Study Supabase Edge Functions documentation"
   ```

4. **Development start:**
   ```markdown
   📁 "Create basic React application structure"
   🎭 "Test browser functionality"
   ```

---

## 🚀 Development Workflow Examples

### Feature Development Cycle:

#### Phase 1: Analysis and Planning
```markdown
🧠 "Analyze requirements for user subscription management feature"
🔍 "Research T-Bank API subscription methods and webhooks"
🌐 "Study enterprise patterns for subscription billing systems"
```

#### Phase 2: Implementation
```markdown
📁 "Create subscription service module in backend/"
📁 "Implement subscription React components in frontend/"
📁 "Add database migrations for subscription tables"
```

#### Phase 3: Testing and Validation
```markdown
🎭 "Test subscription creation flow end-to-end"
🎭 "Verify webhook handling for payment confirmations"
🎭 "Screenshot subscription management UI for documentation"
```

### Bug Investigation Workflow:

```markdown
🧠 "Systematically analyze reported login issue with Telegram WebApp"
🔍 "Search for known issues with Telegram WebApp authentication"
📁 "Check authentication logs and error handling code"
🎭 "Reproduce login flow to identify failure point"
```

### Architecture Decision Workflow:

```markdown
🧠 "Evaluate pros/cons of different state management solutions for Mini App"
🌐 "Research React state management best practices for Telegram WebApps"
🔍 "Find performance comparisons between Zustand, Redux, and Context API"
📁 "Create proof-of-concept implementations for comparison"
🎭 "Performance test different state management approaches"
```

---

## 📋 Tool-Specific Commands for Navigapp

### Sequential Thinking Commands:
```markdown
🧠 "Break down the card creation component into sub-components with props"
🧠 "Plan the database schema optimization for analytics queries"
🧠 "Analyze the best error handling strategy for API failures"
🧠 "Design the user flow for upgrading from Free to Pro subscription"
```

### Brave Search Commands:
```markdown
🔍 "Telegram Mini Apps CSS custom properties theme integration"
🔍 "Node.js Fastify middleware authentication patterns"
🔍 "React Hook Form with TypeScript validation best practices"
🔍 "Supabase Row Level Security policies examples"
```

### Tavily MCP Commands:
```markdown
🌐 "Deep dive into Telegram WebApp MainButton and BackButton APIs"
🌐 "Comprehensive analysis of Supabase realtime subscriptions"
🌐 "Research modern React component testing strategies"
🌐 "Study enterprise-grade error monitoring and logging solutions"
```

### Filesystem Commands:
```markdown
📁 "Create complete TypeScript interface definitions in shared/types/"
📁 "Set up ESLint and Prettier configuration for both frontend and backend"
📁 "Generate API client code based on OpenAPI specification"
📁 "Create deployment scripts for Vercel and Supabase"
```

### Playwright Commands:
```markdown
🎭 "Test page creation wizard with all card types (grid, list, feed)"
🎭 "Verify responsive design on various mobile device sizes"
🎭 "Test Telegram theme switching (light/dark mode)"
🎭 "Automate user journey from onboarding to first page publication"
```

---

## 🎨 UI/UX Development with MCP Tools

### Design System Creation:
```markdown
🧠 "Plan component hierarchy for Navigapp design system"
📁 "Create Tailwind CSS configuration with Telegram theme variables"
🎭 "Screenshot all component variants for design documentation"
```

### Accessibility Testing:
```markdown
🔍 "Research WCAG compliance requirements for Telegram Mini Apps"
🎭 "Test keyboard navigation and screen reader compatibility"
📁 "Document accessibility guidelines for team"
```

### Performance Optimization:
```markdown
🌐 "Study React performance optimization techniques for mobile"
🎭 "Measure page load times and interaction responsiveness"
📁 "Implement code splitting and lazy loading strategies"
```

---

## 🔒 Security and Testing Workflows

### Security Review Process:
```markdown
🧠 "Systematically review authentication flow for security vulnerabilities"
🔍 "Search for common security issues in Telegram Mini Apps"
🌐 "Research OAuth 2.0 security best practices for mobile apps"
📁 "Implement security headers and CSP policies"
🎭 "Test for XSS and injection vulnerabilities"
```

### API Testing Strategy:
```markdown
🧠 "Plan comprehensive API testing strategy for all endpoints"
📁 "Create automated API test suite with Jest"
🎭 "Test API rate limiting and error responses"
🎭 "Verify webhook payload validation and processing"
```

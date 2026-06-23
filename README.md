# GR Groups — Luxury E-Commerce Platform

> A modern, production-ready full-stack e-commerce application built with **Next.js 15**, **DynamoDB**, and **Tailwind CSS**. Migrated from a Java Spring Boot + React (Vite) stack.

## ✨ Features

- **Premium UI** — Glassmorphism design, Framer Motion animations, dark theme
- **Authentication** — JWT-based login/register with bcrypt password hashing
- **DynamoDB Backend** — All data (users, products, orders) stored in AWS DynamoDB
- **Shopping Cart** — Zustand-powered persistent cart with price calculations
- **Checkout** — Multi-step checkout with receipt printing
- **Order History** — View past orders, print receipts, download PDF bills
- **Search** — Real-time product search with filtered results
- **Categories** — Visual category browsing with product counts
- **Route Protection** — JWT middleware protects checkout and order pages
- **Responsive** — Mobile-first design with animated mobile menu
- **SEO Optimized** — Proper metadata, semantic HTML, Open Graph tags

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS 3, Framer Motion |
| State | Zustand (persisted) |
| Auth | JWT (jose library), bcryptjs |
| Database | AWS DynamoDB (SDK v3) |
| PDF | pdfkit |
| Icons | Lucide React |
| Toasts | react-hot-toast |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (auth, products, orders)
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout page
│   ├── products/           # Products listing
│   ├── categories/         # Category browser
│   ├── about/              # Our Story page
│   ├── search/             # Search results
│   ├── orders/             # Order history
│   ├── login/              # Login page
│   └── register/           # Register page
├── components/
│   ├── layout/             # Navbar, Footer
│   └── ui/                 # LoadingSpinner, ToastProvider
├── lib/
│   ├── auth.js             # JWT utilities
│   └── dynamodb.js         # DynamoDB client
├── services/
│   ├── user.service.js     # User CRUD
│   ├── product.service.js  # Product CRUD
│   ├── order.service.js    # Order CRUD
│   └── email.service.js    # Email notifications
├── store/
│   ├── useAuthStore.js     # Auth state
│   ├── useCartStore.js     # Cart state
│   └── useOrderStore.js    # Order state
├── utils/
│   └── helpers.js          # Shared utilities
└── middleware.js            # Route protection
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- AWS account with DynamoDB access

### Installation

```bash
# 1. Navigate to project
cd gr-groups-nextjs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your AWS credentials and JWT secret

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRATION_MS` | Token expiration (default: 86400000 = 24h) |
| `AWS_REGION` | AWS region (e.g., `ap-south-2`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name (default: `E-commerce-main`) |

## 🗄️ DynamoDB Table Design

Single-table design using `pk` (partition key) and `sk` (sort key):

| Entity | pk | sk |
|--------|----|----|
| User | `USER` | `USER#<id>` |
| Product | `PRODUCT` | `PRODUCT#<id>` |
| Order | `ORDER` | `ORDER#<id>` |

## 🔐 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user (protected) |
| GET | `/api/products` | List all products |
| GET | `/api/products/new-arrivals` | Get new arrivals |
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/[id]` | Get order by ID |
| GET | `/api/orders/[id]/bill` | Download PDF invoice |
| GET | `/api/orders/user/[userId]` | Get user's orders |

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Migration Summary

| Java Component | Next.js Equivalent |
|----------------|-------------------|
| Spring Boot Controllers | `app/api/` route handlers |
| Spring Security + JWT | `middleware.js` + `lib/auth.js` |
| MongoDB Repositories | `services/*.service.js` (DynamoDB) |
| React + Vite Frontend | Next.js App Router pages |
| Redux Toolkit | Zustand stores |
| react-router-dom | Next.js file-based routing |

---

Built with ❤️ by GR Groups

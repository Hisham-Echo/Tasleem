# Tasleem Frontend

Luxury marketplace Vue 3 frontend — buy, sell & rent across Egypt.

## Quick Start (with Mock Data — no backend needed)

```bash
npm install
cp .env.mock .env.local   # enables VITE_USE_MOCKS=true
npm run dev               # → http://localhost:3000
```

That's it. All API calls are intercepted by the mock adapter.
A **purple MOCK pill** will appear bottom-right — click it to:
- Switch between buyer / seller / admin accounts instantly
- See live mock state counts
- Reset mock state

## Quick Start (real Laravel backend)

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set VITE_API_BASE_URL=http://your-backend/api/v1
# and VITE_USE_MOCKS=false
npm run dev
```

## Mock Accounts

| Name | Email | Role |
|------|-------|------|
| Ahmed Mohamed | ahmed@example.com | Buyer |
| Nour El-Sayed | nour@example.com | Seller |
| Omar Hassan | omar@example.com | Admin |
| Karim Farouk | karim@example.com | Seller |

> Password can be anything in mock mode.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, categories, featured, AI recs |
| `/products` | Product grid with filters & search |
| `/products/:id` | Product detail + reviews |
| `/search` | Global search with suggestions |
| `/cart` | Shopping cart |
| `/checkout` | 3-step checkout wizard |
| `/orders` | My orders |
| `/orders/:id` | Order detail + cancel |
| `/rentals` | My rentals + return flow |
| `/wishlist` | Saved items |
| `/payments` | Payment history |
| `/profile` | Profile, orders, rentals, notifications |
| `/seller` | Seller dashboard |
| `/seller/products/new` | Create listing |
| `/seller/products/:id/edit` | Edit listing |
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/logs` | Activity logs |
| `/login` `/register` | Auth pages with forgot/reset password |
| `/verify-email` | Email verification |

## Scripts

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Tech Stack

Vue 3 · Vite · Pinia · Vue Router 4 · Axios · Bootstrap 5 · SASS

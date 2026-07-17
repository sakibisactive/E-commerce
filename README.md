# Apex E-Commerce Platform

A premium, production-ready, full-stack e-commerce application built with Node.js, Express, MongoDB, and React (Vite). The platform features an MVC backend architecture with 16 database schemas, a dynamic pricing recommendation engine, automatic PDF invoice generation, transactional email workflows (with SMS/OTP fallbacks), and a high-fidelity interactive payment sandbox.

---

## 🚀 Key Features

* **Glassmorphism & Neon Visuals**: A gorgeous dark UI featuring slate backgrounds, translucent cards, subtle gradients, and premium micro-animations.
* **16 Structured MongoDB Schemas**: Comprehensive schema designs to support profiles, categories, products, carts, orders, invoices, promotions, and activity logs.
* **Pricing Recommendation Engine**: Suggests optimal product prices using 6 market factors (competitor pricing, profit margins, brand premium index, demand multipliers, build specifications, and campaigns).
* **Dynamic PDF Invoice Generator**: Automatically compiles itemized bills with custom indigo styling and renders them as PDF files using `pdfkit`.
* **Interactive Payment Sandbox**: A custom-built sandbox simulator matching local Bangladeshi payment channels (bKash, Nagad, Rocket, Card) with auto-formatted inputs and fake SMS OTP toast triggers.
* **Keep-Alive Uptime Workflow**: Configured via GitHub Actions to maintain the Render-hosted backend awake and bypass container spin-down.

---

## 🛠️ Technology Stack

* **Frontend**: React (v18), Vite, React Router, Axios, Lucide React icons, and Vanilla CSS Modules.
* **Backend**: Node.js, Express.js (ES Modules syntax).
* **Database**: MongoDB & Mongoose.
* **Tooling & Services**: `pdfkit`, `nodemailer`, `dotenv`, GitHub Actions.

---

## 📂 Project Structure

```text
├── backend/                  # Express REST API Server
│   ├── config/               # Database connection configs
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Authentication and route security
│   ├── models/               # 16 Mongoose Schemas
│   ├── routes/               # REST Route definitions
│   ├── services/             # Helper utilities (PDF, Pricing, Email)
│   ├── uploads/              # Generated invoice PDFs and logos
│   ├── package.json
│   └── server.js
├── frontend/                 # Vite + React Client App
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Cards, Carousels)
│   │   ├── config/           # API URLs
│   │   ├── context/          # State management (Auth, Cart, Wishlist)
│   │   ├── pages/            # Application views (Shop, Checkout, Dashboard)
│   │   └── index.css         # Global design system & theme tokens
│   ├── package.json
│   └── vite.config.js
├── PROJECT_DETAILS.md        # Technical specifications reference
└── package.json              # Workspace script runner
```

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **MongoDB** installed (or use a MongoDB Atlas URI).

### 2. Dependency Installation
Run the workspace installer from the root directory:
```bash
npm run install-all
```

### 3. Environment Variables Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
BREVO_API_KEY=your_brevo_api_key
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=465
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Apex E-Commerce" <your_sender_email>
FRONTEND_URL=http://localhost:5173
```

### 4. Database Seeding
To populate the database with categories, products, and admin credentials:
```bash
npm run seed
```

### 5. Running the Application
To run both backend and frontend development servers concurrently:
```bash
npm run dev
```
* Backend runs on: `http://localhost:5000`
* Frontend runs on: `http://localhost:5173`

---

## 💾 Database Architecture (16 Schemas)

The database schema mapping in `backend/models/` is structured as follows:

1. **User**: Manages users, accounts, authorization levels (Admin vs Customer), verification states, and 2FA secrets.
2. **Address**: Stores multiple billing and shipping profiles linked to a User.
3. **Product**: Tracks catalog entries, brand, category, SKU, stock levels, pricing history, and promotion tags.
4. **Category**: Dynamic category taxonomy.
5. **Brand**: Brand metadata and logo mappings.
6. **Review**: Product reviews with a `verifiedPurchase` check to ensure reviewers have bought the item.
7. **Cart**: Keeps customer baskets persistent and tracks applied discount codes.
8. **Wishlist**: Manages saved/bookmarked products.
9. **Order**: Stores transactional logs, invoice records, status flows, and customer details.
10. **Invoice**: References the disk path of generated PDF invoices.
11. **Coupon**: Configures percent or flat discounts with expiration limits.
12. **Campaign**: Controls custom promotional landing pages and banner overrides.
13. **Banner**: Slider configurations for the homepage.
14. **Notification**: Dispatches real-time alerts for system events (deliveries, payment verification, etc.).
15. **ActivityLog**: Logs security audits (logins, deletions, modifications) for security auditing.
16. **Payment**: Audits and records payment gateway transactions.

---

## 🧪 Interactive Payment Sandbox

The platform features an advanced mock gateway endpoint (`/api/payments/mock-gateway`) simulating top local Bangladeshi wallets:
* **Adapting Accents**: Adapts themes dynamically (bKash Pink, Nagad Orange, Rocket Purple, Card Indigo).
* **Auto-Formatter**: Formats card inputs (`XXXX XXXX XXXX XXXX`) and blocks character inputs.
* **OTP SMS Toast**: Generates simulated SMS OTP payloads on screen for easy verification flows.

---

## 🛜 Local Network Previews
To run reviews on physical mobile devices connected to the same local Wi-Fi:
1. Start the server with `npm run dev`. Vite will list your network IP (e.g. `192.168.0.x`).
2. Navigate to `http://192.168.0.x:5173` on your mobile browser.
3. Request endpoints automatically resolve to your computer's IP address instead of localhost.

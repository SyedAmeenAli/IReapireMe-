<h1 align="center">
  <br />
  <img src="public/images/logo.png" alt="iRepairMe Logo" width="180" />
  <br /><br />
  iRepairMe
  <br />
</h1>

<h4 align="center">
  A professional, full-featured device repair web application built with <a href="https://react.dev" target="_blank">React 19</a> + <a href="https://vitejs.dev" target="_blank">Vite</a>.
</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-pages--routes">Pages</a> •
  <a href="#-admin-panel">Admin Panel</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Features

- 🔧 **Multi-step Repair Booking** — Device → Brand → Model → Issue → Quote flow
- 💰 **Live Pricing Management** — Admin can update service prices in real-time
- 🗺️ **Store Locator** — Embedded Google Maps with store location
- 🛒 **Spare Parts Shop** — Browse and add accessories/spares to cart
- 📦 **Order Tracking** — Track repair status with a ticket ID
- 📱 **Fully Responsive** — Optimized for all screen sizes (mobile, tablet, desktop)
- 🔐 **Admin Dashboard** — Protected `/admin` route for store management
- 🎨 **Premium UI** — Glassmorphism, smooth animations, micro-interactions
- 🌐 **WhatsApp Integration** — One-click WhatsApp contact button
- 📝 **Blog & Learn** — DIY repair guides and blog articles
- ⭐ **Customer Reviews** — Testimonials with star ratings
- ❓ **FAQ Page** — Common questions with accordion layout
- 🏪 **Services & Devices** — Browse all supported devices and repair services

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Routing** | React Router 7 (Hash Router) |
| **Styling** | Tailwind CSS 3.4 + Custom CSS |
| **UI Components** | Radix UI primitives |
| **Icons** | Lucide React |
| **State Management** | Zustand |
| **Animations** | GSAP + Lenis (smooth scroll) |
| **3D** | React Three Fiber + Three.js |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/irepairme.git

# 2. Navigate into the project
cd irepairme/app

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
app/
├── public/
│   ├── images/              # Static images & logo
│   └── videos/              # Background videos
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── shared/          # CartDrawer, LoginModal, WhatsAppButton
│   │   └── ui/              # Radix-based UI primitives
│   ├── data/                # Static data (brands, devices, services, pricing…)
│   │   ├── brands.ts
│   │   ├── devices.ts
│   │   ├── services.ts
│   │   ├── pricing.ts
│   │   ├── products.ts
│   │   ├── blogPosts.ts
│   │   ├── faq.ts
│   │   └── testimonials.ts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Route-level page components
│   ├── store/               # Zustand global state (useStore)
│   ├── App.tsx              # Route configuration
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles & design tokens
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 📄 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page with hero video, services, brands, map |
| `/repair` | Repair | Multi-step repair booking flow |
| `/services` | Services | All available repair services |
| `/devices` | Devices | Browse by brand / model |
| `/shop` | Shop | Spare parts & accessories store |
| `/booking` | Booking | Appointment confirmation |
| `/track-repair` | Track Repair | Repair status tracker |
| `/my-account` | My Account | User profile page |
| `/contact` | Contact | Contact form & store info |
| `/about` | About | About iRepairMe |
| `/learn` | Learn | DIY repair guides |
| `/blog` | Blog | Articles and tips |
| `/faq` | FAQ | Frequently asked questions |
| `/admin` | Admin | 🔐 Protected admin dashboard |

---

## 🔐 Admin Panel

Access the admin panel at:

```
http://localhost:3000/#/admin
```

**Login credentials (default):**
- **Email:** `amelio123ali@gmail.com`
- **Password:** *(any password — authentication is local/demo)*

### Admin Capabilities

- 📊 **Dashboard** — Overview stats and recent activity
- 💰 **Pricing** — Update live prices for all repair services
- 📋 **Submissions** — View and manage repair requests
- ⚙️ **Settings** — Store information and configuration

> **Note:** Admin data is managed client-side. For a production deployment, connect to a backend API and implement proper authentication.

---

## 🗺️ Store Location

The app embeds a live Google Maps iframe pointing to the **iRepairMe Service Center** in Hyderabad, India. To update the location, replace the `src` in the `StoreLocation` component inside `src/pages/Home.tsx`.

---

## 🎨 Design System

The app uses a custom design system built on top of Tailwind CSS:

- **Primary Color:** `#1abc9c` (Turquoise Green)
- **Font:** Inter (Google Fonts)
- **Radius:** `0.75rem`
- **Shadows:** Custom `shadow-nav`, `shadow-card` utilities

Color tokens are defined in `src/index.css` under `:root`.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**iRepairMe Service Center**
- 📍 Hyderabad, India
- 📞 +91 98765 43210
- 💬 [WhatsApp](https://wa.me/919876543210)

---

<p align="center">Made with ❤️ by the iRepairMe team</p>

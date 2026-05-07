# NexCode — Full-Stack MERN Web Application

A production-quality MERN stack website for **NexCode Software Development**, featuring a public-facing site with 5 pages, customer interaction forms, and a fully secured admin dashboard.

---

## 🗂 Project Structure

```
nexcode/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Inquiry.js
│   │   ├── Project.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── inquiries.js
│   │   ├── projects.js
│   │   ├── contacts.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── admin/
    │   │   ├── AdminLogin.jsx
    │   │   ├── AdminLayout.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminInquiries.jsx
    │   │   ├── AdminProjects.jsx
    │   │   └── AdminContacts.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   └── ServiceCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ServicesPage.jsx
    │   │   ├── AboutPage.jsx
    │   │   ├── ContactPage.jsx
    │   │   └── ProjectRequestPage.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

---

## 🚀 Setup & Installation

### 1. Clone / Download the project

```bash
cd nexcode
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexcode
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
ADMIN_SEED_EMAIL=admin@nexcode.lk
ADMIN_SEED_PASSWORD=NexCode@Admin2024
```

> ✅ **MongoDB Atlas** users: replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nexcode`

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# OR Production
npm start
```

The API will run at **http://localhost:5000**

On first start, the admin account is automatically seeded using `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

> The Vite proxy forwards `/api` requests to `http://localhost:5000` automatically.

---

## 🔐 Admin Login

Navigate to: **http://localhost:5173/admin/login**

Default credentials (from your `.env`):
- **Email:** `admin@nexcode.lk`
- **Password:** `NexCode@Admin2024`

> ⚠️ Change these in production!

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Admin login |
| GET | `/api/auth/me` | Admin | Get current admin |
| POST | `/api/auth/change-password` | Admin | Change password |

### Inquiries
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/inquiries` | Public | Submit inquiry |
| GET | `/api/inquiries` | Admin | List all inquiries |
| GET | `/api/inquiries/:id` | Admin | Get single inquiry |
| PATCH | `/api/inquiries/:id` | Admin | Update status/notes |
| DELETE | `/api/inquiries/:id` | Admin | Delete inquiry |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects` | Public | Submit project request |
| GET | `/api/projects` | Admin | List all project requests |
| PATCH | `/api/projects/:id` | Admin | Update project status |
| DELETE | `/api/projects/:id` | Admin | Delete project request |

### Contacts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/contacts` | Public | Send contact message |
| GET | `/api/contacts` | Admin | List all messages |
| PATCH | `/api/contacts/:id` | Admin | Update read status |
| DELETE | `/api/contacts/:id` | Admin | Delete message |

### Admin Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/analytics` | Admin | Dashboard metrics & charts |
| POST | `/api/admin/create` | Superadmin | Create new admin user |

---

## 🌐 Pages

| Route | Page |
|-------|------|
| `/` | Home — Hero, Services, Stats, FAQ, CTA |
| `/services` | Services — All 7 services with details |
| `/about` | About — Mission, Vision, Values, Timeline |
| `/contact` | Contact — Form + contact details |
| `/start-project` | Multi-step project request form |
| `/admin/login` | Admin login |
| `/admin` | Dashboard with charts |
| `/admin/inquiries` | Manage customer inquiries |
| `/admin/projects` | Manage project requests |
| `/admin/contacts` | Manage contact messages |

---

## 🗃️ MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `admins` | Admin users with hashed passwords |
| `inquiries` | Customer service inquiries |
| `projects` | Project/quotation requests |
| `contacts` | General contact form messages |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router v6
- Axios
- React Hot Toast
- Recharts (admin charts)
- React Icons

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- CORS

---

## 🏗️ Build for Production

### Frontend
```bash
cd frontend
npm run build
# Output in: frontend/dist/
```

### Backend
```bash
cd backend
# Set NODE_ENV=production in .env
npm start
```

Serve the `frontend/dist` folder with a static server (Nginx, Vercel, Netlify, etc.) and deploy the backend to Railway, Render, Heroku, or your own VPS.

---

## 📞 Contact Details in App

- **WhatsApp:** +94 76 974 7244
- **Phone:** +94 75 312 5140
- **Website:** www.nexcode.lk

---

## 📄 License

Built for NexCode Software Development. All rights reserved.

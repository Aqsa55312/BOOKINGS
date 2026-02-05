# Room Booking System

Sistem peminjaman ruangan kelas kampus yang dibangun dengan React, GraphQL, dan PostgreSQL.

## 📁 Struktur Project

```
BOOKINGS/
├── booking_backend/     # Backend API (Node.js, GraphQL, Prisma)
└── booking-frontend/    # Frontend Web App (React, Vite, TailwindCSS)
```

## 🚀 Features

### User Features
- ✅ Register & Login
- ✅ Browse ruangan kelas tersedia
- ✅ Lihat jadwal booking yang sudah ada
- ✅ Book ruangan dengan deteksi konflik otomatis
- ✅ Upload dokumen peminjaman
- ✅ Track status booking (Pending → Processing → Approved → Completed)
- ✅ Selesaikan booking sendiri setelah approved

### Admin Features
- ✅ Dashboard statistik lengkap
- ✅ Kelola data mahasiswa
- ✅ Kelola ruangan kelas
- ✅ Proses booking (Approve/Reject)
- ✅ Upload dokumen persetujuan yang sudah distempel
- ✅ Monitor semua peminjaman

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express
- Apollo Server (GraphQL)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt

**Frontend:**
- React 18
- Vite
- Apollo Client
- TailwindCSS
- React Router
- Lucide Icons

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Backend Setup

```bash
cd booking_backend

# Install dependencies
npm install

# Setup environment variables
# Create .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/booking_db"
JWT_SECRET="your-secret-key"
PORT=4000

# Run Prisma migrations
npm run prisma:generate
npm run prisma:push

# Seed database (optional)
node prisma/seed.js

# Start server
npm run dev
```

### Frontend Setup

```bash
cd booking-frontend

# Install dependencies
npm install

# Setup environment variables
# Create .env file with:
VITE_GRAPHQL_URL=http://localhost:4000

# Start development server
npm run dev
```

## 🔐 Default Credentials

**Admin:**
- Email: kemahasiswaan@kampus.ac.id
- Password: kemahasiswaan123

**User:**
- Email: aqsa@gmail.com
- Password: aqsa123

## 📖 API Documentation

GraphQL Playground: `http://localhost:4000/`

## 🎯 Workflow

1. **Mahasiswa** membuat booking ruangan
2. **Admin** melihat di dashboard (status: PENDING)
3. **Admin** klik "Proses" → status jadi PROCESSING
4. **Admin** review dan Approve/Reject
   - Jika Approve: Upload dokumen persetujuan yang sudah distempel
5. **Mahasiswa** bisa mark booking sebagai "Selesai" (COMPLETED)
6. **Admin** juga bisa mark sebagai selesai

## 🚀 Deployment

### Backend
- Deploy ke platform seperti Railway, Render, atau Heroku
- Setup PostgreSQL database
- Set environment variables

### Frontend  
- Build: `npm run build`
- Deploy dist folder ke Vercel, Netlify, atau hosting lainnya
- Set VITE_GRAPHQL_URL ke production backend URL

## 📄 License

MIT

## 👨‍💻 Author

Faisal Rahman

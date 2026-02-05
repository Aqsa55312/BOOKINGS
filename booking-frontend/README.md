# 🏢 Room Booking System - Frontend

Aplikasi booking ruangan lengkap dengan fitur CRUD (Create, Read, Update, Delete) untuk user dan admin.

## ✨ Fitur Utama

### 👤 User Features
- **Authentication** - Login & Register dengan GraphQL
- **Browse Rooms** - Lihat semua ruangan dengan:
  - Grid & List view toggle
  - Search & Filter (kapasitas, status)
  - Detail ruangan lengkap dengan gambar
- **Book Room (CREATE)** - Booking ruangan dengan:
  - Form waktu mulai & selesai
  - Jumlah peserta
  - Tujuan/keperluan
  - Kalkulasi harga otomatis
- **My Bookings (READ)** - Lihat semua booking dengan:
  - Filter by status (Pending, Approved, Rejected, Cancelled, Completed)
  - Statistics dashboard
- **Edit Booking (UPDATE)** - Edit booking yang masih pending/approved
- **Delete/Cancel Booking (DELETE)** - Hapus atau batalkan booking

### 👨‍💼 Admin Features
- **Dashboard Admin** - Statistik lengkap:
  - Total users, rooms, bookings
  - Revenue, occupancy rate
  - Pending approvals
- **Manage Rooms** - CRUD Ruangan:
  - Create - Tambah ruangan baru
  - Read - Lihat semua ruangan
  - Update - Edit ruangan
  - Delete - Hapus ruangan
- **Manage Bookings** - Kelola semua booking:
  - Approve booking
  - Reject booking dengan alasan
  - Delete booking
  - View detail lengkap

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router v6** - Routing
- **Apollo Client** - GraphQL client
- **TailwindCSS** - Styling
- **Lucide React** - Icons

## 📁 Struktur Folder

```
src/
├── components/
│   ├── ProtectedRoute.jsx         # Auth guard
│   └── EditBookingModal.jsx       # Modal edit booking
├── context/
│   └── AuthContext.jsx            # Auth state management
├── graphql/
│   ├── queries.js                 # GraphQL queries
│   └── mutations.js               # GraphQL mutations
├── lib/
│   └── apolloClient.js            # Apollo setup
├── pages/
│   ├── Home.jsx                   # Landing page
│   ├── Login.jsx                  # Login page
│   ├── Register.jsx               # Register page
│   ├── Dashboard.jsx              # User dashboard
│   ├── Rooms.jsx                  # Daftar ruangan
│   ├── RoomDetail.jsx             # Detail & booking ruangan
│   ├── MyBookings.jsx             # Booking user (READ, UPDATE, DELETE)
│   └── admin/
│       ├── AdminDashboard.jsx     # Admin dashboard
│       ├── ManageRooms.jsx        # CRUD ruangan
│       └── ManageBookings.jsx     # Manage booking
├── App.jsx                        # Main app component
└── main.jsx                       # Entry point
```

## 🚀 Cara Menjalankan

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   Buat file `.env` di root folder:
   ```env
   VITE_GRAPHQL_URL=http://localhost:4000/graphql
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build untuk production**
   ```bash
   npm run build
   ```

## 📝 GraphQL Schema Requirements

Backend GraphQL harus menyediakan:

### Queries
- `rooms(filter, limit, offset)` - Get all rooms
- `room(id)` - Get room by ID
- `myBookings(status)` - Get user bookings
- `bookings(filter)` - Get all bookings (admin)
- `dashboardStats` - User statistics
- `adminStats` - Admin statistics

### Mutations
- `login(email, password)` - User login
- `register(email, password, name, phone)` - User register
- `createBooking(input)` - Create booking
- `updateBooking(id, input)` - Update booking
- `deleteBooking(id)` - Delete booking
- `cancelBooking(id)` - Cancel booking
- `createRoom(input)` - Create room (admin)
- `updateRoom(id, input)` - Update room (admin)
- `deleteRoom(id)` - Delete room (admin)
- `approveBooking(id)` - Approve booking (admin)
- `rejectBooking(id, reason)` - Reject booking (admin)

## 🔐 Authentication

Aplikasi menggunakan JWT token:
- Token disimpan di localStorage
- Automatic redirect berdasarkan role (USER/ADMIN)
- Protected routes untuk user dan admin

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Loading states & error handling
- Success/error notifications
- Modal confirmations
- Real-time price calculation
- Image galleries
- Status badges dengan color coding
- Quick action cards

## 📊 Dashboard Features

### User Dashboard
- Booking statistics (Active, Completed, Pending)
- Quick actions untuk browse rooms & view bookings
- Personalized greeting

### Admin Dashboard
- Complete statistics:
  - Total users, rooms, bookings
  - Revenue tracking
  - Occupancy rate
  - Pending approvals count
- Color-coded stat cards
- Quick actions untuk management

## 🔄 CRUD Operations

### Rooms (Admin Only)
- **Create**: Form dengan validasi lengkap
- **Read**: Table view dengan sorting & filtering
- **Update**: Modal edit dengan pre-filled data
- **Delete**: Confirmation dialog

### Bookings (User)
- **Create**: Booking form dengan validation
- **Read**: List dengan filter & search
- **Update**: Edit waktu, peserta, tujuan
- **Delete**: Soft delete dengan confirmation

### Bookings Management (Admin)
- Approve/Reject dengan reason
- View all bookings dari semua user
- Delete booking
- Detail view modal

## 🎯 Key Features Implementation

1. **Multi-view Toggle**: Grid/List view untuk rooms
2. **Advanced Filtering**: By capacity, status, date
3. **Price Calculator**: Auto-calculate berdasarkan durasi
4. **Status Workflow**: Pending → Approved → Completed
5. **Role-based Access**: User vs Admin permissions
6. **Image Gallery**: Multiple images per room
7. **Facilities Display**: Tags untuk fasilitas ruangan

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Color Scheme

- Primary: Indigo (#4F46E5)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Gray scale untuk text & backgrounds

## 🔧 Development Tips

1. Pastikan backend GraphQL server running
2. Update `VITE_GRAPHQL_URL` sesuai backend
3. Check browser console untuk GraphQL errors
4. Use Apollo Client DevTools untuk debugging

## 📦 Dependencies

```json
{
  "@apollo/client": "^3.11.0",
  "graphql": "^16.12.0",
  "lucide-react": "^0.562.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0"
}
```

## 🚀 Deployment

1. Build project: `npm run build`
2. Deploy folder `dist/` ke hosting (Vercel, Netlify, etc)
3. Set environment variable `VITE_GRAPHQL_URL` di hosting

## 👥 Team

Developed by Aqsa - Room Booking System

## 📄 License

MIT License

---

**Happy Coding! 🎉**

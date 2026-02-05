import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_DASHBOARD_STATS } from '../graphql/queries';
import Rooms from './Rooms';
import RoomDetail from './RoomDetail';
import MyBookings from './MyBookings';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }) => 
    isActive 
      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1 font-medium" 
      : "text-gray-700 hover:text-indigo-600 pb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-indigo-600">Dashboard User</h1>
              <div className="flex gap-4">
                <NavLink to="/dashboard" end className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/dashboard/rooms" className={navLinkClass}>
                  Ruangan
                </NavLink>
                <NavLink to="/dashboard/my-bookings" className={navLinkClass}>
                  Pemesanan Saya
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Halo, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <Routes>
        <Route path="/" element={<DashboardHome user={user} />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </div>
  );
};

const DashboardHome = ({ user }) => {
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: 'network-only'
  });

  const stats = data?.dashboardStats || {
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Selamat Datang, {user?.name}!
      </h2>
      <p className="text-gray-600 mb-8">
        Sistem Peminjaman Ruangan Kelas - Kelola booking ruangan kelas Anda dengan mudah
      </p>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">⏳</div>
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Menunggu
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              <p className="text-xs text-gray-600 mt-2">Menunggu diproses admin</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">📅</div>
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Aktif
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Booking Aktif</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeBookings}</p>
              <p className="text-xs text-gray-600 mt-2">Sedang diproses/disetujui</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">✅</div>
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Selesai
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedBookings}</p>
              <p className="text-xs text-gray-600 mt-2">Peminjaman selesai</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Aksi Cepat
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/dashboard/rooms"
                className="p-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏫</div>
                <h4 className="font-semibold text-lg mb-2">Pinjam Ruangan Kelas</h4>
                <p className="text-sm text-gray-600">Lihat ruangan kelas yang tersedia dan buat booking baru</p>
              </Link>
              
              <Link
                to="/dashboard/my-bookings"
                className="p-6 border-2 border-green-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                <h4 className="font-semibold text-lg mb-2">Riwayat Peminjaman</h4>
                <p className="text-sm text-gray-600">Lihat dan kelola semua peminjaman ruangan Anda</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

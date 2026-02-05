import { Routes, Route, NavLink } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { GET_ADMIN_STATS } from '../../graphql/queries';
import ManageUsers from './ManageUsers';
import ManageRooms from './ManageRooms';
import ManageBookings from './ManageBookings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }) => 
    isActive 
      ? "border-b-2 border-white pb-1 font-medium" 
      : "hover:text-indigo-200 pb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <div className="flex gap-4">
                <NavLink to="/admin" end className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass}>
                  Users
                </NavLink>
                <NavLink to="/admin/rooms" className={navLinkClass}>
                  Ruangan
                </NavLink>
                <NavLink to="/admin/bookings" className={navLinkClass}>
                  Booking
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span>Admin: {user?.name}</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/rooms" element={<ManageRooms />} />
          <Route path="/bookings" element={<ManageBookings />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const { loading, error, data } = useQuery(GET_ADMIN_STATS, {
    fetchPolicy: 'network-only'
  });

  const stats = data?.adminStats || {
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeBookings: 0,
    availableRooms: 0,
    occupancyRate: 0
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin Kemahasiswaan
        </h2>
        <p className="text-gray-600">
          Kelola peminjaman ruangan kelas dan monitoring penggunaan fasilitas kampus
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">👥</div>
                <div className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full font-semibold">
                  Total
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Mahasiswa</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">🏫</div>
                <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-semibold">
                  Total
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Ruangan Kelas</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalRooms}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">📅</div>
                <div className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                  Aktif
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Booking Aktif</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeBookings}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl">⏳</div>
                <div className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-semibold">
                  Perlu Tindakan
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Approval</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Ruangan Tersedia</h3>
                <div className="text-3xl">✅</div>
              </div>
              <p className="text-3xl font-bold">{stats.availableRooms}</p>
              <p className="text-xs opacity-75 mt-1">Siap dipinjam</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Tingkat Penggunaan</h3>
                <div className="text-3xl">📊</div>
              </div>
              <p className="text-3xl font-bold">{Math.round(stats.occupancyRate)}%</p>
              <p className="text-xs opacity-75 mt-1">Occupancy rate</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Total Peminjaman</h3>
                <div className="text-3xl">📋</div>
              </div>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
              <p className="text-xs opacity-75 mt-1">Sepanjang waktu</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Kelola Data
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <NavLink
                to="/admin/users"
                className="p-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <h4 className="font-semibold text-lg mb-2">Kelola Mahasiswa</h4>
                <p className="text-sm text-gray-600">Lihat dan kelola data mahasiswa</p>
              </NavLink>

              <NavLink
                to="/admin/rooms"
                className="p-6 border-2 border-green-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏫</div>
                <h4 className="font-semibold text-lg mb-2">Kelola Ruangan</h4>
                <p className="text-sm text-gray-600">Tambah, edit, atau hapus ruangan kelas</p>
              </NavLink>
              
              <NavLink
                to="/admin/bookings"
                className="p-6 border-2 border-yellow-200 rounded-lg hover:border-yellow-600 hover:bg-yellow-50 transition group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📅</div>
                <h4 className="font-semibold text-lg mb-2">Kelola Peminjaman</h4>
                <p className="text-sm text-gray-600">Proses, approve, atau tolak peminjaman</p>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

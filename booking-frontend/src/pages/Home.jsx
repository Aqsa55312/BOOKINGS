import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Room Booking</h1>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistem Pemesanan Ruangan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Kelola dan pesan ruangan dengan mudah. Sistem booking yang efisien
            untuk organisasi Anda.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Mulai Sekarang
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Booking Mudah</h3>
            <p className="text-gray-600">
              Pesan ruangan dengan mudah dan cepat melalui sistem online
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Kelola Ruangan</h3>
            <p className="text-gray-600">
              Manajemen ruangan yang efisien dengan panel admin
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Laporan Real-time</h3>
            <p className="text-gray-600">
              Monitor booking dan ketersediaan ruangan secara real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

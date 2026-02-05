import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROOM_BY_ID, GET_ROOM_BOOKINGS } from '../graphql/queries';
import { CREATE_BOOKING } from '../graphql/mutations';
import { Calendar, Users, MapPin, Clock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    date: '',
    startHour: '08:00',
    endHour: '10:00',
    purpose: '',
    attendees: '',
    documentName: ''
  });
  const [documentFile, setDocumentFile] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const { loading, error, data } = useQuery(GET_ROOM_BY_ID, {
    variables: { id }
  });

  // Query existing bookings for this room - always fetch to have data ready
  const { data: bookingsData, refetch: refetchBookings } = useQuery(GET_ROOM_BOOKINGS, {
    variables: { 
      roomId: id
    },
    fetchPolicy: 'network-only'
  });

  // Filter bookings by selected date
  const [dateBookings, setDateBookings] = useState([]);
  
  useEffect(() => {
    if (formData.date && bookingsData?.bookings) {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const filtered = bookingsData.bookings
        .filter(booking => {
          const bookingStart = new Date(parseInt(booking.startTime));
          const bookingEnd = new Date(parseInt(booking.endTime));
          const bookingDate = new Date(bookingStart);
          bookingDate.setHours(0, 0, 0, 0);
          
          // Show only active bookings (PENDING, PROCESSING, APPROVED)
          const isActiveStatus = ['PENDING', 'PROCESSING', 'APPROVED'].includes(booking.status);
          
          // Check if booking is on selected date
          return isActiveStatus && bookingDate.getTime() === selectedDate.getTime();
        })
        .sort((a, b) => parseInt(a.startTime) - parseInt(b.startTime));
      
      setDateBookings(filtered);
    } else {
      setDateBookings([]);
    }
  }, [formData.date, bookingsData]);

  const [createBooking, { loading: bookingLoading, error: bookingError, reset: resetBooking }] = useMutation(CREATE_BOOKING, {
    onCompleted: () => {
      resetBooking(); // Clear any previous errors
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/my-bookings');
      }, 2000);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      // Error akan ditampilkan di UI, tidak perlu alert
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data?.room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading room</p>
          <button 
            onClick={() => navigate('/dashboard/rooms')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Kembali ke Daftar Ruangan
          </button>
        </div>
      </div>
    );
  }

  const room = data.room;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStartEndTimes = () => {
    if (!formData.date || !formData.startHour || !formData.endHour) return { startTime: null, endTime: null };
    
    const [startH, startM] = formData.startHour.split(':');
    const [endH, endM] = formData.endHour.split(':');
    
    const start = new Date(formData.date);
    start.setHours(parseInt(startH), parseInt(startM), 0, 0);
    
    const end = new Date(formData.date);
    end.setHours(parseInt(endH), parseInt(endM), 0, 0);
    
    // If end hour is less than start hour, assume it's next day
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    
    return {
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      if (!formData.documentName) {
        setFormData({ ...formData, documentName: file.name });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startHour || !formData.endHour || !formData.purpose || !formData.attendees) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const { startTime, endTime } = getStartEndTimes();
    
    if (!startTime || !endTime) {
      alert('Format waktu tidak valid');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('Jam selesai harus setelah jam mulai');
      return;
    }

    const now = new Date();
    if (start < now) {
      alert('Waktu mulai tidak boleh di masa lalu');
      return;
    }

    if (parseInt(formData.attendees) > room.capacity) {
      alert(`Jumlah peserta melebihi kapasitas ruangan (${room.capacity} orang)`);
      return;
    }

    try {
      let documentUrl = null;
      
      // Convert file to base64 if exists
      if (documentFile) {
        const reader = new FileReader();
        documentUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(documentFile);
        });
      }

      await createBooking({
        variables: {
          roomId: id,
          startTime: startTime,
          endTime: endTime,
          purpose: formData.purpose,
          attendees: parseInt(formData.attendees),
          documentUrl: documentUrl,
          documentName: formData.documentName || null
        }
      });
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
            <p className="text-gray-600 mb-4">
              Booking Anda sedang menunggu konfirmasi admin
            </p>
            <p className="text-sm text-gray-500">
              Mengalihkan ke halaman pemesanan...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard/rooms')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Daftar Ruangan
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Details */}
          <div>
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <img
                src={room.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"800\" height=\"600\" viewBox=\"0 0 800 600\"%3E%3Crect fill=\"%23f0f0f0\" width=\"800\" height=\"600\"/%3E%3Ctext fill=\"%23999\" font-family=\"Arial\" font-size=\"40\" text-anchor=\"middle\" x=\"400\" y=\"310\"%3ERuangan Kelas%3C/text%3E%3C/svg%3E'}
                alt={room.name}
                className="w-full h-96 object-cover"
              />
              {room.images && room.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {room.images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${room.name} ${idx + 2}`}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin size={18} className="mr-2" />
                    <span>{room.location} - Lantai {room.floor}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  room.status === 'AVAILABLE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.status === 'AVAILABLE' ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center text-gray-700 mb-3">
                  <Users size={20} className="mr-3 text-indigo-600" />
                  <span className="font-medium">Kapasitas: {room.capacity} orang</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">{room.description}</p>
              </div>

              {room.facilities && room.facilities.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fasilitas</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.facilities.map((facility, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Booking</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Tanggal
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  />
                </div>

                {/* Show existing bookings for selected date */}
                {formData.date && dateBookings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          ⚠️ Jadwal yang sudah dibooking:
                        </p>
                        <div className="space-y-2">
                          {dateBookings.map((booking) => {
                            const start = new Date(parseInt(booking.startTime));
                            const end = new Date(parseInt(booking.endTime));
                            const statusClass = 
                              booking.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                              booking.status === 'PROCESSING' ? 'bg-blue-200 text-blue-800' :
                              'bg-green-200 text-green-800';
                            const statusText = 
                              booking.status === 'PENDING' ? 'Menunggu' : 
                              booking.status === 'PROCESSING' ? 'Diproses' : 'Disetujui';
                            
                            return (
                              <div key={booking.id} className="text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
                                <span className="font-medium">
                                  {start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-yellow-700"> • {booking.user?.name || 'User lain'}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${statusClass}`}>
                                  {statusText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">
                          Silakan pilih jam yang tidak bentrok dengan jadwal di atas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.date && dateBookings.length === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Tidak ada booking pada tanggal ini. Ruangan tersedia sepanjang hari.
                    </p>
                  </div>
                )}\n\n                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Mulai
                  </label>
                  <select
                    name="startHour"
                    value={formData.startHour}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  >
                    <option value="07:00">07:00</option>
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Selesai
                  </label>
                  <select
                    name="endHour"
                    value={formData.endHour}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
                  >
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="22:00">22:00</option>
                  </select>
                  {formData.date && formData.startHour && formData.endHour && (
                    <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-900">
                        📅 Waktu Booking:
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        {new Date(formData.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-indigo-700">
                        ⏰ {formData.startHour} - {formData.endHour}
                      </p>
                    </div>
                  )}
                </div>
                {/* Display booking error if any */}
                {bookingError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900">
                      ❌ Gagal Membuat Booking
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {bookingError.message}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    min="1"
                    max={room.capacity}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal {room.capacity} orang
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan/Keperluan
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows="4"
                    required
                    placeholder="Jelaskan tujuan booking ruangan..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Dokumen Peminjaman (Opsional)</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Dokumen
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: PDF, Word, atau gambar (JPG/PNG). Maksimal 5MB
                    </p>
                    {documentFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ File terpilih: {documentFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Dokumen
                    </label>
                    <input
                      type="text"
                      name="documentName"
                      value={formData.documentName}
                      onChange={handleChange}
                      placeholder="Surat_Peminjaman_Ruangan.pdf"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || room.status !== 'AVAILABLE'}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {bookingLoading ? 'Memproses...' : 'Booking Sekarang'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Booking akan menunggu konfirmasi dari admin
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

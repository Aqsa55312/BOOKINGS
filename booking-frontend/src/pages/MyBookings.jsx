import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_BOOKINGS } from '../graphql/queries';
import { DELETE_BOOKING, CANCEL_BOOKING, COMPLETE_BOOKING } from '../graphql/mutations';
import { Calendar, Clock, Users, MapPin, Edit, Trash2, X, FileText, Download, CheckCircle } from 'lucide-react';
import EditBookingModal from '../components/EditBookingModal';

export default function MyBookings() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_MY_BOOKINGS, {
    variables: statusFilter !== 'ALL' ? { status: statusFilter } : {},
    fetchPolicy: 'network-only'
  });

  const [deleteBooking] = useMutation(DELETE_BOOKING, {
    onCompleted: () => {
      alert('Booking berhasil dihapus');
      refetch();
    },
    onError: (error) => {
      alert('Error: ' + error.message);
    }
  });

  const [cancelBooking] = useMutation(CANCEL_BOOKING, {
    onCompleted: () => {
      alert('Booking berhasil dibatalkan');
      refetch();
    },
    onError: (error) => {
      alert('Error: ' + error.message);
    }
  });

  const [completeBooking] = useMutation(COMPLETE_BOOKING, {
    onCompleted: () => {
      alert('Booking berhasil diselesaikan. Terima kasih!');
      refetch();
    },
    onError: (error) => {
      alert('Error: ' + error.message);
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus booking ini?')) {
      await deleteBooking({ variables: { id } });
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      await cancelBooking({ variables: { id } });
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Apakah Anda sudah selesai menggunakan ruangan?')) {
      await completeBooking({ variables: { id } });
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading bookings</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const bookings = data?.myBookings || [];
  const filteredBookings = statusFilter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  // Sort bookings: COMPLETED at bottom, others at top, both sorted by date (newest first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    // If one is COMPLETED and the other is not, COMPLETED goes to bottom
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
    if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
    
    // If both have the same completion status, sort by date (newest first)
    return parseInt(b.startTime) - parseInt(a.startTime);
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Konfirmasi';
      case 'PROCESSING': return 'Sedang Diproses';
      case 'APPROVED': return 'Disetujui';
      case 'REJECTED': return 'Ditolak';
      case 'CANCELLED': return 'Dibatalkan';
      case 'COMPLETED': return 'Selesai';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            refetch();
            setShowEditModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Pemesanan Saya</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola semua pemesanan ruangan Anda
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'ALL' ? 'Semua' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Booking</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-800">Menunggu</p>
            <p className="text-2xl font-bold text-yellow-900">
              {bookings.filter(b => b.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-800">Disetujui</p>
            <p className="text-2xl font-bold text-green-900">
              {bookings.filter(b => b.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-800">Selesai</p>
            <p className="text-2xl font-bold text-blue-900">
              {bookings.filter(b => b.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        {sortedBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada pemesanan</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter === 'ALL' 
                ? 'Anda belum memiliki pemesanan' 
                : `Tidak ada pemesanan dengan status ${getStatusText(statusFilter)}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCancel={handleCancel}
                onComplete={handleComplete}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, onEdit, onDelete, onCancel, onComplete, getStatusColor, getStatusText }) {
  const canEdit = booking.status === 'PENDING';
  const canCancel = booking.status === 'PENDING';
  const canComplete = booking.status === 'APPROVED';
  const canDelete = booking.status === 'CANCELLED' || booking.status === 'REJECTED';

  const formatDate = (dateString) => {
    const date = new Date(parseInt(dateString));
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Booking Details */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{booking.room.name}</h3>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                <span>Lantai {booking.room.floor}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center text-gray-700 text-sm mb-2">
                <Calendar size={16} className="mr-2 text-indigo-600" />
                <div>
                  <p className="font-medium">Waktu Mulai</p>
                  <p className="text-gray-600">{formatDate(booking.startTime)}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700 text-sm">
                <Clock size={16} className="mr-2 text-indigo-600" />
                <div>
                  <p className="font-medium">Waktu Selesai</p>
                  <p className="text-gray-600">{formatDate(booking.endTime)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center text-gray-700 text-sm mb-2">
                <Users size={16} className="mr-2 text-indigo-600" />
                <div>
                  <p className="font-medium">Jumlah Peserta</p>
                  <p className="text-gray-600">{booking.attendees} orang</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">Tujuan</p>
                <p className="text-gray-600 line-clamp-2">{booking.purpose}</p>
              </div>
            </div>
          </div>

          {/* Document Section */}
          {booking.documentUrl && (
            <div className="mb-4 bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Dokumen Peminjaman Anda</p>
              <a 
                href={booking.documentUrl}
                download={booking.documentName || 'dokumen.pdf'}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <FileText size={16} className="mr-2" />
                {booking.documentName || 'Download Dokumen'}
              </a>
            </div>
          )}

          {/* Admin Note */}
          {booking.adminNote && (
            <div className="mb-4 bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
              <p className="text-sm font-semibold text-yellow-900 mb-1 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Catatan dari Admin
              </p>
              <p className="text-sm text-gray-700">{booking.adminNote}</p>
            </div>
          )}

          {/* Approved Document Section */}
          {booking.approvedDocumentUrl && (
            <div className="mb-4 bg-green-50 rounded-lg p-4 border-2 border-green-300">
              <p className="text-base font-semibold text-green-900 mb-3 flex items-center">
                <Download size={18} className="mr-2" />
                ✓ Surat Yang Sudah Di-cap Tersedia!
              </p>
              <a 
                href={booking.approvedDocumentUrl}
                download={booking.approvedDocumentName || 'surat_persetujuan.pdf'}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md"
              >
                <Download size={18} className="mr-2" />
                {booking.approvedDocumentName || 'Download Surat Persetujuan'}
              </a>
            </div>
          )}

          <div className="flex justify-end items-center pt-4 border-t border-gray-200"
>
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit(booking)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Batal
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => onComplete(booking.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Selesai
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => onDelete(booking.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

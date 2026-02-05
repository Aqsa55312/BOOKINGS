import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '../../graphql/queries';
import { UPDATE_BOOKING_STATUS, DELETE_BOOKING } from '../../graphql/mutations';
import { Calendar, Users, MapPin, Check, X, Trash2, Eye, FileText, Upload } from 'lucide-react';

export default function ManageBookings() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_ALL_BOOKINGS, {
    variables: statusFilter !== 'ALL' ? { status: statusFilter } : {},
    fetchPolicy: 'network-only'
  });

  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS, {
    onCompleted: () => {
      alert('Status booking berhasil diupdate!');
      setShowApproveModal(false);
      setShowRejectModal(false);
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const [deleteBooking] = useMutation(DELETE_BOOKING, {
    onCompleted: () => {
      alert('Booking berhasil dihapus!');
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setShowApproveModal(true);
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus booking ini?')) {
      await deleteBooking({ variables: { id } });
    }
  };

  const handleMarkInProgress = async (booking) => {
    if (window.confirm('Tandai booking ini sebagai sedang diproses?')) {
      await updateBookingStatus({
        variables: {
          id: booking.id,
          status: 'PROCESSING',
          adminNotes: 'Sedang diproses oleh kemahasiswaan'
        }
      });
    }
  };

  const handleMarkCompleted = async (booking) => {
    if (window.confirm('Tandai booking ini sebagai selesai?')) {
      await updateBookingStatus({
        variables: {
          id: booking.id,
          status: 'COMPLETED'
        }
      });
    }
  };

  const showDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  const bookings = data?.bookings || [];
  const filteredBookings = statusFilter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Approve Modal */}
      {showApproveModal && selectedBooking && (
        <ApproveModal
          booking={selectedBooking}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedBooking(null);
          }}
          onSubmit={updateBookingStatus}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBooking && (
        <RejectModal
          booking={selectedBooking}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedBooking(null);
          }}
          onSubmit={updateBookingStatus}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Booking</h2>
        <p className="text-gray-600">Approve, reject, atau hapus booking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-800">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {bookings.filter(b => b.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Approved</p>
          <p className="text-2xl font-bold text-green-900">
            {bookings.filter(b => b.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-800">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {bookings.filter(b => b.status === 'REJECTED').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-800">Completed</p>
          <p className="text-2xl font-bold text-blue-900">
            {bookings.filter(b => b.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peserta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.user?.name}</div>
                  <div className="text-sm text-gray-500">{booking.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.room?.name}</div>
                  <div className="text-sm text-gray-500">Lantai {booking.room?.floor}</div>
                </td>
                <td className="px-6 py-4">
                  {booking.startTime && booking.endTime ? (
                    <>
                      <div className="text-sm text-gray-900">
                        {new Date(parseInt(booking.startTime)).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(parseInt(booking.startTime)).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(parseInt(booking.endTime)).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.attendees} orang
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => showDetail(booking)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Detail"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkInProgress(booking)}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        title="Sedang Diproses"
                      >
                        Proses
                      </button>
                    )}
                    {booking.status === 'PROCESSING' && (
                      <>
                        <button
                          onClick={() => handleApprove(booking)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {booking.status === 'APPROVED' && (
                      <button
                        onClick={() => handleMarkCompleted(booking)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        title="Selesai"
                      >
                        Selesai
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada booking</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingDetailModal({ booking, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(parseInt(dateString)).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Detail Booking</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Pemesan</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm"><span className="font-medium">Nama:</span> {booking.user?.name}</p>
              <p className="text-sm mt-2"><span className="font-medium">Email:</span> {booking.user?.email}</p>
            </div>
          </div>

          {/* Room Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Ruangan</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{booking.room?.name}</p>
              {booking.room?.location && (
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin size={14} className="mr-1" />
                  {booking.room.location}
                </p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail Pemesanan</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start">
                <Calendar size={18} className="mr-3 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Waktu Mulai</p>
                  <p className="text-sm text-gray-600">{formatDate(booking.startTime)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar size={18} className="mr-3 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Waktu Selesai</p>
                  <p className="text-sm text-gray-600">{formatDate(booking.endTime)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users size={18} className="mr-3 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">Jumlah Peserta</p>
                  <p className="text-sm text-gray-600">{booking.attendees} orang</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Tujuan/Keperluan</p>
                <p className="text-sm text-gray-600">{booking.purpose}</p>
              </div>
              {booking.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Catatan</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Document */}
          {booking.documentUrl && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Dokumen Peminjaman</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <a 
                  href={booking.documentUrl}
                  download={booking.documentName || 'dokumen.pdf'}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  <FileText size={18} className="mr-2" />
                  {booking.documentName || 'Download Dokumen'}
                </a>
              </div>
            </div>
          )}

          {/* Approved Document */}
          {booking.approvedDocumentUrl && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Surat Yang Sudah Di-cap</h4>
              <div className="bg-green-50 rounded-lg p-4">
                <a 
                  href={booking.approvedDocumentUrl}
                  download={booking.approvedDocumentName || 'surat_persetujuan.pdf'}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <FileText size={18} className="mr-2" />
                  {booking.approvedDocumentName || 'Download Surat'}
                </a>
              </div>
            </div>
          )}

          {/* Admin Note */}
          {booking.adminNote && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Catatan Admin</h4>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{booking.adminNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApproveModal({ booking, onClose, onSubmit }) {
  const [adminNote, setAdminNote] = useState('');
  const [approvedDocumentName, setApprovedDocumentName] = useState('');
  const [approvedDocumentFile, setApprovedDocumentFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setApprovedDocumentFile(file);
      if (!approvedDocumentName) {
        setApprovedDocumentName(file.name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert file to base64 if exists
    if (approvedDocumentFile) {
      const reader = new FileReader();
      reader.onload = () => {
        onSubmit({
          variables: {
            id: booking.id,
            status: 'APPROVED',
            adminNote: adminNote || null,
            approvedDocumentUrl: reader.result,
            approvedDocumentName: approvedDocumentName || null,
          }
        });
      };
      reader.readAsDataURL(approvedDocumentFile);
    } else {
      onSubmit({
        variables: {
          id: booking.id,
          status: 'APPROVED',
          adminNote: adminNote || null,
          approvedDocumentUrl: null,
          approvedDocumentName: null,
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Setujui Peminjaman</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm"><span className="font-medium">Ruangan:</span> {booking.room?.name}</p>
            <p className="text-sm mt-1"><span className="font-medium">Pemohon:</span> {booking.user?.name}</p>
            <p className="text-sm mt-1"><span className="font-medium">Tanggal:</span> {booking.startTime && booking.endTime ? (
              <>
                {new Date(parseInt(booking.startTime)).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </>
            ) : '-'}</p>
            <p className="text-sm mt-1"><span className="font-medium">Waktu:</span> {booking.startTime && booking.endTime ? (
              <>
                {new Date(parseInt(booking.startTime)).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} - {new Date(parseInt(booking.endTime)).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            ) : '-'}</p>
            <p className="text-sm mt-1"><span className="font-medium">Keperluan:</span> {booking.purpose}</p>
          </div>

          {/* User's Document */}
          {booking.documentUrl && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-2" />
                Dokumen Peminjaman dari User
              </p>
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

          {/* Upload Approved Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload size={16} className="inline mr-2" />
              Upload Surat Yang Sudah Di-cap (Opsional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: PDF, Word, atau gambar (JPG/PNG). Maksimal 5MB
            </p>
            {approvedDocumentFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ File terpilih: {approvedDocumentFile.name}
              </p>
            )}
            <input
              type="text"
              placeholder="Nama file (misal: Surat_Persetujuan.pdf)"
              value={approvedDocumentName}
              onChange={(e) => setApprovedDocumentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
            />
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Setujui
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectModal({ booking, onClose, onSubmit }) {
  const [adminNote, setAdminNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      alert('Harap berikan alasan penolakan');
      return;
    }
    onSubmit({
      variables: {
        id: booking.id,
        status: 'REJECTED',
        adminNote: adminNote,
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Tolak Peminjaman</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm"><span className="font-medium">Ruangan:</span> {booking.room?.name}</p>
            <p className="text-sm mt-1"><span className="font-medium">Pemohon:</span> {booking.user?.name}</p>
            <p className="text-sm mt-1"><span className="font-medium">Tanggal:</span> {booking.startTime && booking.endTime ? (
              <>
                {new Date(parseInt(booking.startTime)).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </>
            ) : '-'}</p>
            <p className="text-sm mt-1"><span className="font-medium">Waktu:</span> {booking.startTime && booking.endTime ? (
              <>
                {new Date(parseInt(booking.startTime)).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} - {new Date(parseInt(booking.endTime)).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </>
            ) : '-'}</p>
            <p className="text-sm mt-1"><span className="font-medium">Keperluan:</span> {booking.purpose}</p>
          </div>

          {/* User's Document */}
          {booking.documentUrl && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-2" />
                Dokumen Peminjaman
              </p>
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

          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={4}
              required
              placeholder="Jelaskan alasan penolakan peminjaman ini..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tolak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

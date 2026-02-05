import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROOMS } from '../../graphql/queries';
import { CREATE_ROOM, UPDATE_ROOM, DELETE_ROOM } from '../../graphql/mutations';
import { Plus, Edit, Trash2, X, Save, Building2, MapPin, Users } from 'lucide-react';

export default function ManageRooms() {
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    floor: '',
    facilities: '',
    status: 'AVAILABLE'
  });

  const { loading, error, data, refetch } = useQuery(GET_ROOMS);

  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM, {
    onCompleted: () => {
      alert('Ruangan berhasil ditambahkan!');
      resetForm();
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const [updateRoom, { loading: updating }] = useMutation(UPDATE_ROOM, {
    onCompleted: () => {
      alert('Ruangan berhasil diupdate!');
      resetForm();
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const [deleteRoom] = useMutation(DELETE_ROOM, {
    onCompleted: () => {
      alert('Ruangan berhasil dihapus!');
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      floor: '',
      facilities: '',
      status: 'AVAILABLE'
    });
    setEditingRoom(null);
    setShowModal(false);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      capacity: room.capacity.toString(),
      floor: room.floor || '',
      facilities: room.facilities?.join(', ') || '',
      status: room.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
      await deleteRoom({ variables: { id } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const variables = {
      name: formData.name,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      floor: formData.floor,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
      status: formData.status
    };

    if (editingRoom) {
      await updateRoom({ variables: { id: editingRoom.id, ...variables } });
    } else {
      await createRoom({ variables });
    }
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

  const rooms = data?.rooms || [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Ruangan</h2>
          <p className="text-gray-600">Tambah, edit, atau hapus ruangan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Tambah Ruangan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Ruangan</p>
          <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Tersedia</p>
          <p className="text-2xl font-bold text-green-900">
            {rooms.filter(r => r.status === 'AVAILABLE').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-800">Maintenance</p>
          <p className="text-2xl font-bold text-red-900">
            {rooms.filter(r => r.status === 'MAINTENANCE').length}
          </p>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lantai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kapasitas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{room.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{room.floor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {room.capacity} orang
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    room.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-800'
                      : room.status === 'MAINTENANCE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      title="Edit"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      title="Hapus"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada ruangan. Klik tombol "Tambah Ruangan" untuk menambah.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 size={16} className="inline mr-2" />
                    Nama Ruangan
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Lantai
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    required
                    placeholder="Gedung A - Lantai 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-2" />
                    Kapasitas
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="WiFi, Projector, AC, Whiteboard"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {creating || updating ? 'Menyimpan...' : editingRoom ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

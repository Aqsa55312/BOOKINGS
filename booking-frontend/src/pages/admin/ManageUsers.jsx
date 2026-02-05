import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../../graphql/queries';
import { UPDATE_USER_ROLE, DELETE_USER } from '../../graphql/mutations';
import { Users, Edit, Trash2, X, Save, Mail, Phone, Shield, User } from 'lucide-react';

export default function ManageUsers() {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_USERS);

  const [updateUserRole, { loading: updating }] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => {
      alert('Role user berhasil diupdate!');
      setShowModal(false);
      setEditingUser(null);
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      alert('User berhasil dihapus!');
      refetch();
    },
    onError: (error) => alert('Error: ' + error.message)
  });

  const handleEditRole = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setShowModal(true);
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?`)) {
      await deleteUser({ variables: { id } });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !selectedRole) return;
    
    await updateUserRole({
      variables: {
        id: editingUser.id,
        role: selectedRole
      }
    });
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

  const users = data?.users || [];

  return (
    <div>
      {/* Edit Role Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Role User</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{editingUser.name}</p>
                  <p className="text-sm text-gray-600">{editingUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="USER"
                      checked={selectedRole === 'USER'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mr-3"
                    />
                    <User size={20} className="mr-2 text-gray-600" />
                    <div>
                      <p className="font-medium">User</p>
                      <p className="text-xs text-gray-500">Regular user dengan akses terbatas</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={selectedRole === 'ADMIN'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mr-3"
                    />
                    <Shield size={20} className="mr-2 text-indigo-600" />
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-gray-500">Full access ke semua fitur</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <p className="text-gray-600 mt-1">Kelola user dan role mereka</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="text-indigo-600 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Shield className="text-green-600 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <User className="text-blue-600 mr-3" size={32} />
            <div>
              <p className="text-sm text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'USER').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bergabung
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <User size={20} className="text-indigo-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={16} className="mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={16} className="mr-2" />
                      {user.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50"
                        title="Edit Role"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
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
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Tidak ada user</p>
          </div>
        )}
      </div>
    </div>
  );
}

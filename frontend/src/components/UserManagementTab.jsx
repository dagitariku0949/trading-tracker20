import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagementTab = () => {
  const { getUsers, updateUser, deleteUser, resetUserPassword } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data since we removed the backend functions
  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-12-13',
      trades: 45,
      profit: 2340
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-02-20',
      lastLogin: '2024-12-12',
      trades: 78,
      profit: 5670
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@tradingdashboard.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-01',
      lastLogin: '2024-12-13',
      trades: 0,
      profit: 0
    },
    {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2024-03-10',
      lastLogin: '2024-11-15',
      trades: 23,
      profit: -450
    }
  ];

  useEffect(() => {
    // Simulate loading users
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            switch (action) {
              case 'update':
                return { ...user, ...data };
              case 'activate':
                return { ...user, status: 'active' };
              case 'deactivate':
                return { ...user, status: 'inactive' };
              case 'delete':
                return null;
              default:
                return user;
            }
          }
          return user;
        }).filter(Boolean)
      );
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      handleUserAction(editingUser.id, 'update', userData);
    } else {
      const newUser = {
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
        trades: 0,
        profit: 0,
        status: 'active',
        ...userData
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
    setShowUserForm(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-900 text-red-300',
      user: 'bg-blue-900 text-blue-300'
    };
    return colors[role] || colors.user;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-900 text-green-300',
      inactive: 'bg-gray-900 text-gray-300'
    };
    return colors[status] || colors.inactive;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">👥 User Management</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          + Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded">👥</div>
            <div>
              <p className="text-gray-400 text-sm">TOTAL USERS</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded">✅</div>
            <div>
              <p className="text-gray-400 text-sm">ACTIVE</p>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded">👑</div>
            <div>
              <p className="text-gray-400 text-sm">ADMINS</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600 p-2 rounded">📈</div>
            <div>
              <p className="text-gray-400 text-sm">TOTAL TRADES</p>
              <p className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.trades, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Trades</th>
              <th className="text-left p-4 font-medium">Profit/Loss</th>
              <th className="text-left p-4 font-medium">Last Login</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t border-slate-700">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500">Joined: {user.joinDate}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(user.status)}`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">{user.trades}</td>
                <td className="p-4">
                  <span className={user.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${user.profit >= 0 ? '+' : ''}{user.profit}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-400">{user.lastLogin}</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleUserAction(user.id, 'deactivate')}
                        className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-xs"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user.id, 'activate')}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          handleUserAction(user.id, 'delete');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveUser({
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingUser?.name || ''}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email || ''}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'user'}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
                >
                  {editingUser ? 'Update' : 'Create'} User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                  className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;
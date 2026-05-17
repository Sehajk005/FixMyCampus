import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLoading from '../components/PageLoading';

function getStatusBadgeStyle(status) {
  if (status === 'active') {
    return {
      color: 'var(--success)',
      background: 'color-mix(in oklab, var(--success) 14%, transparent)',
      border: '1px solid color-mix(in oklab, var(--success) 28%, transparent)',
    };
  }
  return {
    color: 'var(--danger-soft)',
    background: 'color-mix(in oklab, var(--danger) 14%, transparent)',
    border: '1px solid color-mix(in oklab, var(--danger) 28%, transparent)',
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', department: '' });
  const [addLoading, setAddLoading] = useState(false);
  
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to change role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Failed to change status');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await api.post('/admin/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers([...users, res.data]);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'student', department: '' });
      alert('User created successfully with default password: Test@1234');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return <PageLoading label="Loading users…" />;
  if (error) return <div className="p-8 text-center motion-surface-enter animate-fade-in" style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <div className="page-shell animate-fade-up" style={{ maxWidth: 1280 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text)' }}>User Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '0.55rem 1rem' }}
        >
          + Add User
        </button>
      </div>
      
      <div className="rounded-xl shadow-md overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Name</th>
                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Email</th>
                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Role</th>
                <th className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-6 py-4">
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{user.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.department || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm rounded block w-full p-2"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <option value="student">Student</option>
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={getStatusBadgeStyle(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                      className="text-sm font-medium"
                      style={{ color: user.status === 'active' ? 'var(--danger-soft)' : 'var(--success)' }}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 motion-backdrop-enter">
          <div className="rounded-xl shadow-xl w-full max-w-md overflow-hidden motion-dropdown-enter" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)' }}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="label">Email Address *</label>
                <input 
                  type="email" 
                  required 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Role *</label>
                <select 
                  value={newUser.role} 
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="label">Department</label>
                <input 
                  type="text" 
                  value={newUser.department} 
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Computer Science, Electrical..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.95rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addLoading}
                  className="btn-primary"
                  style={{ padding: '0.5rem 0.95rem' }}
                >
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

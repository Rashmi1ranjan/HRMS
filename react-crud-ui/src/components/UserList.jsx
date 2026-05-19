import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { userService } from '../services/userService';
import UserFormModal from './UserFormModal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getUsers(page, limit);
      if (response.success) {
        setUsers(response.data || []);
        const total = response.pagination?.total ?? response.data?.length ?? 0;
        const pages = response.pagination?.totalPages ?? Math.ceil(total / limit);
        setTotalUsers(total);
        setTotalPages(pages);
      } else {
        setError(response.message || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with the server. Please verify the Express backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      // In this backend, user search endpoint might differ, let's call the api directly for Search or mock it
      // Let's filter client-side first or use backend searching if available.
      // The backend has `exports.findByIdOrName` in model, let's filter client-side for immediate premium response.
      const response = await userService.getUsers(1, 100);
      if (response.success) {
        const filtered = (response.data || []).filter(u => 
          u.name.toLowerCase().includes(query.toLowerCase()) || 
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          (u.role_name && u.role_name.toLowerCase().includes(query.toLowerCase())) ||
          (u.designation_name && u.designation_name.toLowerCase().includes(query.toLowerCase()))
        );
        setUsers(filtered);
        setTotalUsers(filtered.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      const res = await userService.deleteUser(id);
      if (res.success) {
        showSuccess('User deleted successfully.');
        fetchUsers();
      } else {
        setError(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while deleting user.');
      setLoading(false);
    }
  };

  const handleSaveUser = () => {
    showSuccess(selectedUser ? 'User updated successfully!' : 'User created successfully!');
    fetchUsers();
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="glass-card animate-slide-up">
      <div className="card-header">
        <div>
          <h2 className="card-title">User Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage organization users, departments, and roles.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <button onClick={fetchUsers} className="btn btn-secondary btn-icon-only" title="Refresh">
            <RefreshCw size={18} />
          </button>

          <button onClick={handleAddUser} className="btn btn-primary">
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success animate-fade-in">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="alert alert-danger animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Fetching latest user records...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="loading-container" style={{ minHeight: '150px' }}>
          <p>No user accounts found matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Designation / Dept</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-avatar-info">
                        <div className="avatar">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {user.role_name || `Role #${user.role_id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>
                        {user.designation_name || `Desg #${user.designation_id}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {user.department_name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.status ? 'badge-success' : 'badge-danger'}`}>
                        {user.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn btn-secondary btn-icon-only"
                          title="Edit details"
                          style={{ padding: '0.4rem' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn btn-secondary btn-icon-only"
                          title="Delete user"
                          style={{ padding: '0.4rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Showing <b>{users.length}</b> of <b>{totalUsers}</b> entries
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-actions">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span style={{ fontSize: '0.9rem', margin: '0 0.5rem' }}>
                  Page <b>{page}</b> of <b>{totalPages}</b>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserList;

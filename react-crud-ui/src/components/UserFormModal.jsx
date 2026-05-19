import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { userService } from '../services/userService';

const UserFormModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    designation_id: '',
    status: true,
  });

  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFormOptions();
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '', // blank by default on update
          role_id: user.role_id || '',
          designation_id: user.designation_id || '',
          status: user.status === undefined ? true : !!user.status,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role_id: '',
          designation_id: '',
          status: true,
        });
      }
      setError('');
    }
  }, [isOpen, user]);

  const fetchFormOptions = async () => {
    try {
      const [rolesRes, designationsRes] = await Promise.all([
        userService.getRoles(),
        userService.getDesignations()
      ]);
      
      // Handle standard and wrapped API response arrays
      setRoles(rolesRes.data || rolesRes || []);
      setDesignations(designationsRes.data || designationsRes || []);
    } catch (err) {
      console.error('Failed to load roles/designations:', err);
      setError('Could not load drop-down choices. Make sure server is running.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      setLoading(false);
      return;
    }

    if (!user && !formData.password) {
      setError('Password is required for new users.');
      setLoading(false);
      return;
    }

    try {
      let savedUser;
      if (user) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Do not update password if left blank
        }
        savedUser = await userService.updateUser(user.id, updateData);
      } else {
        // Create user
        savedUser = await userService.createUser(formData);
      }
      
      onSave(savedUser);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong saving the user.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-zoom-in">
        <div className="modal-header">
          <h3 className="modal-title">{user ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john.doe@company.com"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {user ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required={!user}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="role_id">System Role</label>
                <select
                  id="role_id"
                  name="role_id"
                  className="form-input"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="designation_id">Designation</label>
                <select
                  id="designation_id"
                  name="designation_id"
                  className="form-input"
                  value={formData.designation_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map((desg) => (
                    <option key={desg.id} value={desg.id}>
                      {desg.name} {desg.department_name ? `(${desg.department_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="checkbox"
                id="status"
                name="status"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                checked={formData.status}
                onChange={handleChange}
              />
              <label htmlFor="status" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Active Status
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Saving...
                </>
              ) : (
                'Save User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

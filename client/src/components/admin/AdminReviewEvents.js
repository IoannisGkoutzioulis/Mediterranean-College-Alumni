import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const AdminReviewEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editEvent, setEditEvent] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const editModalRef = useRef();
  const deleteModalRef = useRef();
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/api/events');
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading events.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Edit modal logic
  const openEdit = (event) => {
    setEditEvent(event);
    setFormData({ ...event });
  };
  const closeEdit = () => {
    setEditEvent(null);
    setFormData({});
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/events/${editEvent.id}`, formData);
      setEvents(events.map(ev => ev.id === editEvent.id ? { ...ev, ...formData } : ev));
      setSuccessMessage('Event updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      closeEdit();
    } catch (err) {
      setError('Error updating event.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete modal logic
  const openDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/events/${deleteId}`);
      setEvents(events.filter(ev => ev.id !== deleteId));
      setSuccessMessage('Event deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDelete(false);
      setDeleteId(null);
    } catch (err) {
      setError('Error deleting event.');
      setTimeout(() => setError(''), 3000);
    }
  };
  const cancelDelete = () => {
    setShowDelete(false);
    setDeleteId(null);
  };

  // Backdrop click
  const handleBackdropClick = (e, ref, closeFn) => {
    if (ref.current && e.target === ref.current) {
      closeFn();
    }
  };

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editEvent) closeEdit();
        if (showDelete) cancelDelete();
      }
    };
    if (editEvent || showDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editEvent, showDelete]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Review Events</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {events.map(event => (
              <li key={event.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold mb-1">
                      <i className="bi bi-calendar-event me-1"></i> {event.title || event.event_title}
                    </div>
                    <div className="small text-muted mb-1">
                      <i className="bi bi-clock me-1"></i> {event.date ? new Date(event.date).toLocaleDateString() : event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'} {event.time || ''}
                    </div>
                    <div className="small text-muted">
                      <i className="bi bi-geo-alt me-1"></i> {event.location || 'Online'}
                      {event.is_virtual && <span className="badge bg-info ms-2">Virtual</span>}
                    </div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(event)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => openDelete(event.id)}>Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Edit Modal */}
      {editEvent && (
        <div
          className="modal-overlay"
          ref={editModalRef}
          tabIndex={-1}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => handleBackdropClick(e, editModalRef, closeEdit)}
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 500, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24 }}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Event</h5>
                <button type="button" className="btn-close" onClick={closeEdit}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Event Title</label>
                  <input type="text" className="form-control" name="title" value={formData.title || formData.event_title || ''} onChange={handleEditChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" name="date" value={formData.date || formData.event_date || ''} onChange={handleEditChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" name="time" value={formData.time || ''} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" name="location" value={formData.location || ''} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Virtual Event</label>
                  <input type="checkbox" className="form-check-input ms-2" name="is_virtual" checked={!!formData.is_virtual} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" rows={3} value={formData.description || ''} onChange={handleEditChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEdit}>Close</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div
          className="modal-overlay"
          ref={deleteModalRef}
          tabIndex={-1}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => handleBackdropClick(e, deleteModalRef, cancelDelete)}
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24 }}>
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this event?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewEvents; 
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const ReviewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editJob, setEditJob] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const editModalRef = useRef();
  const deleteModalRef = useRef();
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get('/api/jobs');
        setJobs(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setLoading(false);
      } catch (err) {
        setError('Error loading jobs.');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Edit modal logic
  const openEdit = (job) => {
    setEditJob(job);
    setFormData({ ...job });
  };
  const closeEdit = () => {
    setEditJob(null);
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
      await axiosInstance.put(`/api/jobs/${editJob.id}`, formData);
      setJobs(
        jobs
          .map(j => j.id === editJob.id ? { ...j, ...formData } : j)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setSuccessMessage('Job updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      closeEdit();
    } catch (err) {
      setError('Error updating job.');
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
      await axiosInstance.delete(`/api/jobs/${deleteId}`);
      setJobs(jobs.filter(j => j.id !== deleteId));
      setSuccessMessage('Job deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDelete(false);
      setDeleteId(null);
    } catch (err) {
      setError('Error deleting job.');
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
        if (editJob) closeEdit();
        if (showDelete) cancelDelete();
      }
    };
    if (editJob || showDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editJob, showDelete]);

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
      <h1 className="mb-4">Review Job Opportunities</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {jobs.map(job => (
              <li key={job.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold mb-1">
                      <i className="bi bi-briefcase me-1"></i> {job.job_title}
                    </div>
                    <div className="small text-muted mb-1">
                      <i className="bi bi-building me-1"></i> {job.company_name}
                      {job.is_remote && <span className="badge bg-success ms-2">Remote</span>}
                    </div>
                    <div className="small text-muted">
                      <i className="bi bi-geo-alt me-1"></i> {job.location || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(job)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => openDelete(job.id)}>Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Edit Modal */}
      {editJob && (
        <div
          className="modal-overlay"
          ref={editModalRef}
          tabIndex={-1}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 500, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24, pointerEvents: 'auto' }}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Job</h5>
                <button type="button" className="btn-close" onClick={closeEdit}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Job Title</label>
                  <input type="text" className="form-control" name="job_title" value={formData.job_title || ''} onChange={handleEditChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-control" name="company_name" value={formData.company_name || ''} onChange={handleEditChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" name="location" value={formData.location || ''} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Remote</label>
                  <input type="checkbox" className="form-check-input ms-2" name="is_remote" checked={!!formData.is_remote} onChange={handleEditChange} />
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
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24, pointerEvents: 'auto' }}>
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this job?
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

export default ReviewJobs; 
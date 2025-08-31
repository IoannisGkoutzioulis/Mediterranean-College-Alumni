import React, { useState, useEffect, useRef } from 'react';

const ContentManagement = ({ jobs, events, handleContentAction }) => {
  const [editType, setEditType] = useState(null); // 'job' or 'event'
  const [editItem, setEditItem] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const editModalRef = useRef();
  const deleteModalRef = useRef();

  // Placeholder for edit modal (expand as needed)
  const handleEdit = (type, item) => {
    setEditType(type);
    setEditItem(item);
  };
  const closeEdit = () => {
    setEditType(null);
    setEditItem(null);
  };

  // Delete modal logic
  const handleDelete = (type, id) => {
    setDeleteType(type);
    setDeleteId(id);
    setShowDelete(true);
  };
  const confirmDelete = () => {
    handleContentAction(deleteType, deleteId, 'delete');
    setShowDelete(false);
    setDeleteType(null);
    setDeleteId(null);
  };
  const cancelDelete = () => {
    setShowDelete(false);
    setDeleteType(null);
    setDeleteId(null);
  };

  // Backdrop click: only close if clicking the backdrop, not the modal itself
  const handleBackdropClick = (e, ref, closeFn) => {
    if (ref.current && e.target === ref.current) {
      closeFn();
    }
  };

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editItem) closeEdit();
        if (showDelete) cancelDelete();
      }
    };
    if (editItem || showDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editItem, showDelete]);

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Job Opportunities</h5>
          </div>
          <div className="card-body p-0">
            {jobs.length === 0 ? (
              <div className="text-muted p-3">No job opportunities.</div>
            ) : (
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
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit('job', job)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('jobs', job.id)}>Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Events</h5>
          </div>
          <div className="card-body p-0">
            {events.length === 0 ? (
              <div className="text-muted p-3">No events.</div>
            ) : (
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
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit('event', event)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete('events', event.id)}>Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (placeholder, expand as needed) */}
      {editItem && (
        <div
          className="modal-overlay"
          ref={editModalRef}
          tabIndex={-1}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={e => handleBackdropClick(e, editModalRef, closeEdit)}
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 500, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24 }}>
            <div className="modal-header">
              <h5 className="modal-title">Edit {editType === 'job' ? 'Job' : 'Event'}</h5>
              <button type="button" className="btn-close" onClick={closeEdit}></button>
            </div>
            <div className="modal-body">
              <div className="text-muted">(Editing is not implemented in this placeholder. Add your form here.)</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEdit}>Close</button>
              <button className="btn btn-primary" disabled>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div
          className="modal-overlay"
          ref={deleteModalRef}
          tabIndex={-1}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={e => handleBackdropClick(e, deleteModalRef, cancelDelete)}
        >
          <div className="modal-dialog" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.15)', width: '100%', maxWidth: 400, margin: '0 16px', zIndex: 2001, position: 'relative', padding: 24 }}>
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" onClick={cancelDelete}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this {deleteType === 'jobs' ? 'job' : 'event'}?
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

export default ContentManagement; 
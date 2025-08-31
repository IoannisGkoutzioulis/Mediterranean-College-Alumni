import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const AdminJobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/job-applications');
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading applications');
      setLoading(false);
    }
  };

  const handleAction = async (applicationId, action) => {
    try {
      await axiosInstance.patch(`/api/job-applications/${applicationId}/${action}`, {
        comment
      });
      setSuccessMessage(`Application ${action}ed successfully`);
      setShowModal(false);
      setComment('');
      fetchApplications();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Error ${action}ing application`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const openActionModal = (application, action) => {
    setSelectedApplication(application);
    setComment('');
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

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
    <div className="container-fluid py-5">
      <h1 className="mb-4">Job Applications Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="row">
        <div className="col-md-2" style={{ minWidth: 220 }}>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Filter Applications</h5>
            </div>
            <div className="card-body">
              <ul className="nav nav-pills flex-column">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <i className="bi bi-list-ul me-2"></i>All Applications
                    <span className="badge bg-primary ms-2">{applications.length}</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'submitted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submitted')}
                  >
                    <i className="bi bi-hourglass me-2"></i>Pending
                    <span className="badge bg-warning ms-2">
                      {applications.filter(a => a.status === 'submitted').length}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'accepted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accepted')}
                  >
                    <i className="bi bi-check-circle me-2"></i>Accepted
                    <span className="badge bg-success ms-2">
                      {applications.filter(a => a.status === 'accepted').length}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                  >
                    <i className="bi bi-x-circle me-2"></i>Rejected
                    <span className="badge bg-danger ms-2">
                      {applications.filter(a => a.status === 'rejected').length}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Applicant</th>
                      <th>Job Title</th>
                      <th>Posted By</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map(application => (
                      <tr key={application.id}>
                        <td>
                          <div className="fw-semibold">{application.first_name} {application.last_name}</div>
                          <div className="small text-muted">{application.email}</div>
                        </td>
                        <td>{application.job_title}</td>
                        <td>
                          <div className="fw-semibold">{application.poster_first_name} {application.poster_last_name}</div>
                          <div className="small text-muted">{application.poster_email}</div>
                        </td>
                        <td>{new Date(application.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${
                            application.status === 'submitted' ? 'warning' :
                            application.status === 'accepted' ? 'success' :
                            'danger'
                          }`}>
                            {application.status}
                          </span>
                        </td>
                        <td>
                          {application.status === 'submitted' && (
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => openActionModal(application, 'accept')}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => openActionModal(application, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedApplication && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedApplication.status === 'submitted' ? 'Review Application' : 'Update Application'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Applicant</label>
                  <p className="form-control-static">
                    {selectedApplication.first_name} {selectedApplication.last_name}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Job Title</label>
                  <p className="form-control-static">{selectedApplication.job_title}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Cover Letter</label>
                  <p className="form-control-static">{selectedApplication.cover_letter}</p>
                </div>
                <div className="mb-3">
                  <label htmlFor="comment" className="form-label">Admin Comment</label>
                  <textarea
                    className="form-control"
                    id="comment"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment about this application..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleAction(selectedApplication.id, 'accept')}
                >
                  Accept
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleAction(selectedApplication.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplications; 
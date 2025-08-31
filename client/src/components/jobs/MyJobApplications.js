import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const MyJobApplications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/api/my-job-applications');
        setApplications(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading applications.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group applications by job
  const appsArray = Array.isArray(applications) ? applications : [];
  const grouped = appsArray.reduce((acc, app) => {
    if (!acc[app.job_id]) acc[app.job_id] = { job_title: app.job_title, apps: [] };
    acc[app.job_id].apps.push(app);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  if (error) {
    return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  }

  // Only job poster or admin can view
  if (!(user && (user.role === 'administrative' || user.role === 'registered_alumni'))) {
    return <div className="container py-5"><div className="alert alert-danger">You do not have permission to view these applications.</div></div>;
  }

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to="/jobs" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back to Job Listings
        </Link>
        <h2 className="mb-0">Applications to My Jobs</h2>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="alert alert-info">No applications received for your jobs yet.</div>
      ) : (
        Object.entries(grouped).map(([jobId, { job_title, apps }]) => (
          <div className="card shadow-sm mb-4" key={jobId}>
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">{job_title} <span className="badge bg-secondary">{apps.length}</span></h5>
              <Link to={`/jobs/${jobId}`} className="btn btn-link btn-sm">View Job</Link>
            </div>
            <div className="card-body">
              {apps.map(application => (
                <div className="list-group-item mb-3" key={application.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Applicant:</strong> {application.first_name} {application.last_name}
                      <br />
                      <a href={`mailto:${application.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {application.email}
                      </a>
                      <br />
                      <span className="text-muted small">
                        <strong>Posted by:</strong> {application.poster_first_name} {application.poster_last_name} (<a href={`mailto:${application.poster_email}`}>{application.poster_email}</a>)
                      </span>
                    </div>
                    <small className="text-muted">Applied: {formatDate(application.created_at)}</small>
                  </div>
                  {application.cover_letter && (
                    <div className="mt-2">
                      <p className="mb-1"><strong>Cover Letter:</strong></p>
                      <p className="mb-0 small">{application.cover_letter}</p>
                    </div>
                  )}
                  {application.resume_url && (
                    <a 
                      href={application.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary mt-2"
                    >
                      <i className="bi bi-file-earmark-text me-1"></i>
                      View Resume
                    </a>
                  )}
                  <div className="mt-3 d-flex align-items-center gap-2">
                    <span className={`badge ${application.status === 'accepted' ? 'bg-success' : application.status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`.trim()}>
                      {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                    </span>
                    {application.status !== 'accepted' && application.status !== 'rejected' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={async () => {
                            try {
                              await axiosInstance.patch(`/api/job-applications/${application.id}/accept`);
                              setApplications(apps => apps.map(app => app.id === application.id ? { ...app, status: 'accepted' } : app));
                            } catch (err) {
                              alert('Error accepting application');
                            }
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={async () => {
                            try {
                              await axiosInstance.patch(`/api/job-applications/${application.id}/reject`);
                              setApplications(apps => apps.map(app => app.id === application.id ? { ...app, status: 'rejected' } : app));
                            } catch (err) {
                              alert('Error rejecting application');
                            }
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyJobApplications; 
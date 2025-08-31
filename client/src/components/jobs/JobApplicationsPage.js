import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await axiosInstance.get(`/api/jobs/${jobId}`);
        setJob(jobRes.data);
        const appsRes = await axiosInstance.get(`/api/jobs/${jobId}/applications`);
        setApplications(appsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading applications or job info.');
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

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
  if (!job) {
    return <div className="container py-5"><div className="alert alert-warning">Job not found.</div></div>;
  }

  // Only job poster or admin can view
  if (!(user && (user.role === 'administrative' || user.id === job.alumni_id))) {
    return <div className="container py-5"><div className="alert alert-danger">You do not have permission to view these applications.</div></div>;
  }

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to={`/jobs/${jobId}`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back to Job Details
        </Link>
        <h2 className="mb-0">Applications for: {job.job_title}</h2>
      </div>
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Applications ({applications.length})</h5>
        </div>
        <div className="card-body">
          {applications.length === 0 ? (
            <p className="text-muted mb-0">No applications received yet.</p>
          ) : (
            <div className="list-group">
              {applications.map(application => (
                <div className="list-group-item" key={application.id}>
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
                              setApplications(applications => applications.map(app => app.id === application.id ? { ...app, status: 'accepted' } : app));
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
                              setApplications(applications => applications.map(app => app.id === application.id ? { ...app, status: 'rejected' } : app));
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
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsPage; 
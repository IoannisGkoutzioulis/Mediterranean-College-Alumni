import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    cover_letter: '',
    resume_url: ''
  });
  
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // Fetch job details
        const jobResponse = await axiosInstance.get(`/api/jobs/${id}`);
        setJob(jobResponse.data);
        
        // If user is the job poster, fetch applications
        if (user && user.role === 'registered_alumni' && user.id === jobResponse.data.alumni_id) {
          try {
            const applicationsResponse = await axiosInstance.get(`/api/jobs/${id}/applications`);
            setApplications(applicationsResponse.data);
          } catch (appErr) {
            console.error('Error fetching applications:', appErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Error loading job details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchJobData();
  }, [id, user]);
  
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!job || !user || !job.id || !user.id) return;
      try {
        const response = await axiosInstance.get(`/api/jobs/${job.id}/has-applied`);
        setHasApplied(response.data.hasApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    checkApplicationStatus();
  }, [job, user]);
  
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!job || !user || !job.id || !user.id) return;
      if (user.id !== job.alumni_id && user.role !== 'administrative') return;
      try {
        const response = await axiosInstance.get(`/api/jobs/${job.id}/applications`);
        const pending = response.data.filter(app => app.status !== 'accepted' && app.status !== 'rejected').length;
        setPendingCount(pending);
      } catch (error) {
        // ignore
      }
    };
    fetchPendingCount();
  }, [job, user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm({
      ...applicationForm,
      [name]: value
    });
  };
  
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axiosInstance.post(`/api/jobs/${id}/apply`, applicationForm);
      setSuccessMessage('Your application has been submitted successfully!');
      setShowApplyModal(false);
      
      // Clear form
      setApplicationForm({
        cover_letter: '',
        resume_url: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.message || 'Error submitting application');
    }
  };
  
  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/jobs/${id}`);
      navigate('/jobs');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Error deleting job. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Job posting not found.
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Back to Job Listings
        </Link>
      </div>
    );
  }
  
  const isJobPoster = user && user.id === job.alumni_id;
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to="/jobs" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Job Listings
        </Link>
        
        {isJobPoster && (
          <div>
            <Link to={`/jobs/${id}/edit`} className="btn btn-outline-primary me-2">
              <i className="bi bi-pencil me-1"></i>
              Edit
            </Link>
            <button 
              className="btn btn-outline-danger"
              onClick={handleDeleteJob}
            >
              <i className="bi bi-trash me-1"></i>
              Delete
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h1 className="h3 mb-0">{job.job_title}</h1>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-8">
              <h5>{job.company_name}</h5>
              <div className="d-flex mb-3">
                <div className="badge bg-secondary me-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  {job.location || 'Location not specified'}
                </div>
                {job.is_remote && (
                  <div className="badge bg-success">
                    <i className="bi bi-laptop me-1"></i>
                    Remote
                  </div>
                )}
              </div>
              <p className="text-muted mb-0">
                <small>Posted by: {job.alumni_first_name} {job.alumni_last_name}</small>
              </p>
              <p className="text-muted">
                <small>Posted on: {formatDate(job.created_at)}</small>
                {job.expires_at && (
                  <span className="ms-3">Expires: {formatDate(job.expires_at)}</span>
                )}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              {/* Apply Button or Already Applied Text */}
              {!isJobPoster && (
                hasApplied ? (
                  <div className="text-center mt-3">
                    <p className="text-muted">Already Applied</p>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowApplyModal(true)}
                  >
                    <i className="bi bi-briefcase me-2"></i>
                    Apply for this Job
                  </button>
                )
              )}
            </div>
          </div>
          
          <hr />
          
          <div className="mb-4">
            <h5>Job Description</h5>
            <div className="mb-3">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {job.requirements && (
            <div className="mb-4">
              <h5>Requirements</h5>
              <div className="mb-3">
                {job.requirements.split('\n').map((requirement, index) => (
                  <p key={index}>{requirement}</p>
                ))}
              </div>
            </div>
          )}
          
          {(!isJobPoster && (job.application_link || job.contact_email)) && (
            <div className="mb-4">
              <h5>Other Methods of Application</h5>
              {job.application_link && (
                <p>
                  <a 
                    href={job.application_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm me-3"
                  >
                    <i className="bi bi-link-45deg me-1"></i>
                    Apply via Website
                  </a>
                </p>
              )}
              {job.contact_email && (
                <p>
                  <a 
                    href={`mailto:${job.contact_email}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="bi bi-envelope me-1"></i>
                    Contact via Email
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Apply Modal */}
      {showApplyModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Apply for {job.job_title}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowApplyModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleApplySubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="cover_letter" className="form-label">Cover Letter</label>
                      <textarea
                        className="form-control"
                        id="cover_letter"
                        name="cover_letter"
                        rows="5"
                        value={applicationForm.cover_letter}
                        onChange={handleInputChange}
                        placeholder="Explain why you are a good fit for this position..."
                        required
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="resume_url" className="form-label">Resume URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        id="resume_url"
                        name="resume_url"
                        value={applicationForm.resume_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/your-resume.pdf"
                      />
                      <small className="form-text text-muted">
                        Add a link to your resume if hosted online (Google Drive, Dropbox, etc.)
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowApplyModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Submit Application</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default JobDetail;
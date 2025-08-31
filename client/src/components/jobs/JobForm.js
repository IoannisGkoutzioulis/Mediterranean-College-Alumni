import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const JobForm = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    description: '',
    requirements: '',
    location: '',
    is_remote: false,
    application_link: '',
    contact_email: '',
    expires_at: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Calculate default expiry date (60 days from now)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  };
  
  useEffect(() => {
    // Set default expiry date for new job postings
    if (!isEditMode) {
      setFormData(prevState => ({
        ...prevState,
        expires_at: getDefaultExpiryDate()
      }));
      return;
    }
    
    // Fetch job data for editing
    const fetchJobData = async () => {
      try {
        const response = await axiosInstance.get(`/api/jobs/${id}`);
        const jobData = response.data;
        
        // Convert date format
        if (jobData.expires_at) {
          jobData.expires_at = new Date(jobData.expires_at).toISOString().split('T')[0];
        }
        
        setFormData(jobData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError('Error loading job data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchJobData();
  }, [id, isEditMode]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.company_name || !formData.job_title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (isEditMode) {
        // Update existing job
        await axiosInstance.put(`/api/jobs/${id}`, formData);
        setSuccessMessage('Job posting updated successfully');
      } else {
        // Create new job
        await axiosInstance.post('/api/jobs', formData);
        setSuccessMessage('Job posting created successfully');
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err.response?.data?.message || 'Error saving job posting');
    }
  };
  
  // Only registered alumni can post jobs
  useEffect(() => {
    if (user && user.role !== 'registered_alumni') {
      navigate('/jobs');
    }
  }, [user, navigate]);
  
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
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h1 className="h3 mb-0">{isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}</h1>
            </div>
            <div className="card-body p-4">
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
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="company_name" className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="job_title" className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="job_title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Job Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="requirements" className="form-label">Requirements</label>
                  <textarea
                    className="form-control"
                    id="requirements"
                    name="requirements"
                    rows="3"
                    value={formData.requirements || ''}
                    onChange={handleInputChange}
                    placeholder="List the qualifications, skills, and experience required..."
                  ></textarea>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Athens, Greece"
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_remote"
                        name="is_remote"
                        checked={formData.is_remote}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_remote">
                        This is a remote position
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="application_link" className="form-label">Application Link</label>
                  <input
                    type="url"
                    className="form-control"
                    id="application_link"
                    name="application_link"
                    value={formData.application_link || ''}
                    onChange={handleInputChange}
                    placeholder="https://company.com/careers/job-application"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="contact_email" className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email || ''}
                    onChange={handleInputChange}
                    placeholder="hr@company.com"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="expires_at" className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="expires_at"
                    name="expires_at"
                    value={formData.expires_at || ''}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <small className="form-text text-muted">
                    The job posting will no longer be visible after this date.
                  </small>
                </div>
                
                <div className="d-flex justify-content-between">
                  <Link to="/jobs" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Update Job Posting' : 'Create Job Posting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
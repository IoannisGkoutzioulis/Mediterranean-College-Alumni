import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const JobsList = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    remote: false,
    companyName: ''
  });
  const [pendingTotal, setPendingTotal] = useState(0);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get('/api/jobs');
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Error loading job listings. Please try again.');
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  useEffect(() => {
    const fetchPendingTotal = async () => {
      if (!user || user.role !== 'registered_alumni') return;
      try {
        const res = await axiosInstance.get('/api/my-job-applications');
        const pending = res.data.filter(app => app.status !== 'accepted' && app.status !== 'rejected').length;
        setPendingTotal(pending);
      } catch (err) {
        // ignore
      }
    };
    fetchPendingTotal();
  }, [user]);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      location: '',
      remote: false,
      companyName: ''
    });
  };
  
  const filteredJobs = () => {
    return jobs.filter(job => {
      // Filter by location
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by remote
      if (filters.remote && !job.is_remote) {
        return false;
      }
      
      // Filter by company name
      if (filters.companyName && !job.company_name.toLowerCase().includes(filters.companyName.toLowerCase())) {
        return false;
      }
      
      return true;
    });
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
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Career Opportunities</h1>
        {user && user.role === 'registered_alumni' && (
          <Link to="/jobs/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Post a Job
          </Link>
        )}
      </div>
      
      {user && user.role === 'registered_alumni' && (
        <div className="mb-4">
          <Link to="/my-job-applications" className="btn btn-outline-primary position-relative">
            <i className="bi bi-people me-2"></i>
            View Applications to My Jobs
            {pendingTotal > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {pendingTotal}
                <span className="visually-hidden">pending applications</span>
              </span>
            )}
          </Link>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Jobs</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by location..."
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by company..."
                name="companyName"
                value={filters.companyName}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remoteCheck"
                  name="remote"
                  checked={filters.remote}
                  onChange={handleFilterChange}
                />
                <label className="form-check-label" htmlFor="remoteCheck">
                  Remote Only
                </label>
              </div>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job listings */}
      {filteredJobs().length > 0 ? (
        <div className="row">
          {filteredJobs().map(job => (
            <div className="col-lg-6 mb-4" key={job.id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{job.job_title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{job.company_name}</h6>
                  <div className="small text-muted mb-2">
                    <strong>Posted by:</strong> {job.alumni_first_name} {job.alumni_last_name}
                  </div>
                  
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
                  
                  <p className="card-text">
                    {job.description && job.description.length > 150 
                      ? job.description.substring(0, 150) + '...' 
                      : job.description}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                    </small>
                    <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No job opportunities found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default JobsList;
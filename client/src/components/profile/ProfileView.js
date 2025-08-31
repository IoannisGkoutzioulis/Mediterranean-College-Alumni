import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const ProfileView = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/alumni-profiles/me');
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        // If 404, it means profile doesn't exist yet
        if (err.response && err.response.status === 404) {
          setProfile(null);
        } else {
          setError('Error loading profile. Please try again.');
          console.error('Error details:', err);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Status label based on profile status
  const getStatusLabel = () => {
    if (!profile) return null;
    
    switch (profile.status) {
      case 'pending':
        return (
          <div className="status-badge bg-warning text-dark px-3 py-2 rounded-pill d-inline-flex align-items-center">
            <i className="bi bi-hourglass me-2"></i>
            Pending Review
          </div>
        );
      case 'approved':
        return (
          <div className="status-badge bg-success text-white px-3 py-2 rounded-pill d-inline-flex align-items-center">
            <i className="bi bi-check-circle me-2"></i>
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="status-badge bg-danger text-white px-3 py-2 rounded-pill d-inline-flex align-items-center">
            <i className="bi bi-x-circle me-2"></i>
            Rejected
          </div>
        );
      default:
        return null;
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

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body p-5 text-center">
            <i className="bi bi-person-badge text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h3 className="mb-3">Create Your Alumni Profile</h3>
            <p className="mb-4">
              You haven't created an alumni profile yet. Complete your profile to connect with fellow Mediterranean College graduates and access exclusive resources.
            </p>
            <Link to="/profile/edit" className="btn btn-primary px-4 py-2">
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">My Profile</h1>
        <Link to="/profile/edit" className="btn btn-primary">
          <i className="bi bi-pencil me-2"></i>
          Edit Profile
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Status Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Profile Status</h5>
            {getStatusLabel()}
          </div>
          
          {profile.status === 'pending' && (
            <div className="alert alert-info mt-3 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Your profile is currently under review. Once approved, you'll be able to access all alumni features.
            </div>
          )}
          
          {profile.status === 'rejected' && (
            <div className="alert alert-warning mt-3 mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Your profile has been rejected. Please update your information and resubmit.
              {profile.admin_comment && (
                <div className="mt-2">
                  <strong>Reason:</strong> {profile.admin_comment}
                </div>
              )}
            </div>
          )}
          
          {profile.status === 'approved' && (
            <div className="alert alert-success mt-3 mb-0">
              <i className="bi bi-check-circle me-2"></i>
              Your profile has been approved. You now have full access to all alumni features.
              {profile.admin_comment && (
                <div className="mt-2">
                  <strong>Admin note:</strong> {profile.admin_comment}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="profile-header d-md-flex align-items-center">
            <div className="text-center text-md-start me-md-4 mb-4 mb-md-0">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-light"
                  style={{ width: '150px', height: '150px' }}
                >
                  <span className="display-4 text-secondary">
                    {profile.first_name.charAt(0)}
                    {profile.last_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-info">
              <h2 className="mb-1">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="mb-2 text-muted">{profile.degree_earned || 'No degree information provided'}</p>
              
              {profile.current_job_title && profile.current_company && (
                <p className="mb-3">
                  {profile.current_job_title} at {profile.current_company}
                </p>
              )}
              
              {(!profile.current_job_title && profile.current_company) && (
                <p className="mb-3">
                  Works at {profile.current_company}
                </p>
              )}
              
              {(profile.current_job_title && !profile.current_company) && (
                <p className="mb-3">
                  {profile.current_job_title}
                </p>
              )}

              <div className="mb-3">
                <span className="badge bg-primary me-2">{profile.school_name}</span>
                {profile.graduation_year && (
                  <span className="badge bg-secondary">Class of {profile.graduation_year}</span>
                )}
              </div>

              {/* Contact Information */}
              <div className="mb-3">
                <h4 className="h6 mb-2">Contact Information</h4>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      {profile.email || 'Not provided'}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      {profile.mobile || 'Not provided'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <i className="bi bi-geo-alt me-2"></i>
                      {profile.address || 'Not provided'}
                    </p>
                    <p className="mb-1">
                      <i className="bi bi-building me-2"></i>
                      {profile.city && profile.country ? `${profile.city}, ${profile.country}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {profile.linkedin && (
                <a 
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-linkedin me-1"></i> LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          <div className="profile-details mt-4">
            <h3 className="mb-3">About Me</h3>
            <div className="profile-bio">
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-muted">No bio provided. Add a bio to tell others about yourself.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employment and Education */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h3 className="h5 mb-0">Employment</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h4 className="h6 text-primary">Current Position</h4>
                {profile.current_job_title && profile.current_company ? (
                  <div>
                    <p className="mb-1 fw-bold">{profile.current_job_title}</p>
                    <p className="mb-0">{profile.current_company}</p>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No current employment information provided</p>
                )}
              </div>
              
              <div>
                <h4 className="h6 text-primary">Employment History</h4>
                {profile.employment_history ? (
                  <p className="mb-0">{profile.employment_history}</p>
                ) : (
                  <p className="text-muted mb-0">No employment history provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h3 className="h5 mb-0">Education</h3>
            </div>
            <div className="card-body">
              <h4 className="h6 text-primary">Mediterranean College</h4>
              <div className="mb-2">
                <p className="mb-1 fw-bold">{profile.degree_earned || 'Degree not specified'}</p>
                <p className="mb-0">
                  {profile.school_name}
                  {profile.graduation_year && ` • Class of ${profile.graduation_year}`}
                </p>
              </div>
              
              {profile.study_program && (
                <div>
                  <h4 className="h6 text-primary mt-4">Study Program</h4>
                  <p className="mb-0">{profile.study_program}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h5 mb-3">Profile Actions</h3>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/profile/edit" className="btn btn-outline-primary">
              <i className="bi bi-pencil me-2"></i>
              Edit Profile
            </Link>
            
            <Link to="/alumni" className="btn btn-outline-secondary">
              <i className="bi bi-people me-2"></i>
              View Alumni Directory
            </Link>
            
            {profile.status === 'approved' && (
              <>
                <Link to="/events/create" className="btn btn-outline-success">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Create Event
                </Link>
                
                <Link to="/jobs/create" className="btn btn-outline-info">
                  <i className="bi bi-briefcase me-2"></i>
                  Post Job Opportunity
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
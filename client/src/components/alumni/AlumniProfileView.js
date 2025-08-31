import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const AlumniProfileView = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/alumni-profiles/${id}`);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading profile. Please try again.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Profile not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link to="/alumni" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Alumni Directory
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4">
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
                className="btn btn-sm btn-outline-primary me-2"
              >
                <i className="bi bi-linkedin me-1"></i> LinkedIn Profile
              </a>
            )}

            {user && user.role === 'registered_alumni' && user.id !== profile.user_id && (
              <Link to={`/messages/new?recipient=${profile.user_id}`} className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-envelope me-1"></i> Send Message
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileView; 
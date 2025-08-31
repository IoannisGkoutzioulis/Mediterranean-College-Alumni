// src/components/settings/NotificationPreferences.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const NotificationPreferences = () => {
  const { user } = useContext(AuthContext);
  const [preferences, setPreferences] = useState({
    profile_updates: true,
    event_notifications: true,
    job_notifications: true,
    message_notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axiosInstance.get('/api/notification-preferences');
        setPreferences(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError('Could not load your notification preferences. Please try again later.');
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Handle toggle changes
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked
    });
    
    // Clear any previous messages
    setSuccessMessage('');
    setError('');
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      await axiosInstance.put('/api/notification-preferences', preferences);
      setSuccessMessage('Your notification preferences have been saved successfully.');
      setSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('Failed to save your preferences. Please try again.');
      setSaving(false);
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

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h1 className="h3 mb-0">Email Notification Settings</h1>
            </div>
            <div className="card-body">
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
              
              <p className="mb-4">
                Choose which emails you'd like to receive from the Mediterranean College Alumni Portal.
              </p>
              
              <div className="list-group mb-4">
                <div className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <h5 className="mb-1">Profile Updates</h5>
                      <p className="text-muted mb-0 small">
                        Notifications about your profile approval or rejection.
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="profile_updates"
                        name="profile_updates"
                        checked={preferences.profile_updates}
                        onChange={handleToggleChange}
                      />
                      <label className="form-check-label" htmlFor="profile_updates">
                        <span className="visually-hidden">Toggle profile update notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <h5 className="mb-1">Event Notifications</h5>
                      <p className="text-muted mb-0 small">
                        Confirmations when you register for events and event reminders.
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="event_notifications"
                        name="event_notifications"
                        checked={preferences.event_notifications}
                        onChange={handleToggleChange}
                      />
                      <label className="form-check-label" htmlFor="event_notifications">
                        <span className="visually-hidden">Toggle event notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <h5 className="mb-1">Job Notifications</h5>
                      <p className="text-muted mb-0 small">
                        Updates about job applications and new job postings matching your interests.
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="job_notifications"
                        name="job_notifications"
                        checked={preferences.job_notifications}
                        onChange={handleToggleChange}
                      />
                      <label className="form-check-label" htmlFor="job_notifications">
                        <span className="visually-hidden">Toggle job notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <h5 className="mb-1">Message Notifications</h5>
                      <p className="text-muted mb-0 small">
                        Notifications when you receive new messages from other alumni.
                      </p>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="message_notifications"
                        name="message_notifications"
                        checked={preferences.message_notifications}
                        onChange={handleToggleChange}
                      />
                      <label className="form-check-label" htmlFor="message_notifications">
                        <span className="visually-hidden">Toggle message notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-between">
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Dashboard
                </Link>
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-1"></i>
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="card-footer bg-white py-3">
              <div className="text-muted small">
                <p className="mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  You can update your notification preferences at any time. Even if you disable email notifications, 
                  you'll still receive important communications regarding your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
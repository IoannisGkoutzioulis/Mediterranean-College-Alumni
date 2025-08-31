import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get profile data first - this is the most critical
        try {
          const profileResponse = await axiosInstance.get('/api/alumni-profiles/me');
          setProfile(profileResponse.data);
        } catch (profileErr) {
          // 404 is expected for new users
          if (profileErr.response && profileErr.response.status !== 404) {
            throw profileErr;
          }
        }
        
        // Now try to get events (but don't fail if this endpoint isn't ready)
        try {
          const eventsResponse = await axiosInstance.get('/api/events');
          setEvents(eventsResponse.data || []);
        } catch (eventsErr) {
          console.log('Events endpoint not available yet:', eventsErr);
          // Use mock events data if the endpoint fails
          setEvents([
            {
              id: 1,
              title: 'Annual Alumni Reunion',
              event_date: '2025-06-15',
              start_time: '18:00',
              end_time: '22:00',
              location: 'Mediterranean College Main Campus',
              is_virtual: false
            },
            {
              id: 2,
              title: 'Career Development Workshop',
              event_date: '2025-05-28',
              start_time: '14:00',
              end_time: '16:00',
              location: 'Online via Zoom',
              is_virtual: true
            }
          ]);
        }
        
        // Try to get jobs data (but don't fail if this endpoint isn't ready)
        try {
          const jobsResponse = await axiosInstance.get('/api/jobs');
          setJobs(jobsResponse.data || []);
        } catch (jobsErr) {
          console.log('Jobs endpoint not available yet:', jobsErr);
          // Use mock jobs data if the endpoint fails
          setJobs([
            {
              id: 1,
              job_title: 'Software Developer',
              company_name: 'Tech Solutions Ltd',
              location: 'Thessaloniki, Greece',
              is_remote: false
            },
            {
              id: 2,
              job_title: 'Marketing Manager',
              company_name: 'Global Brands Inc',
              location: 'Athens, Greece',
              is_remote: true
            }
          ]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error loading dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h1 className="mb-4">Alumni Dashboard</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">Welcome, {user.first_name || user.username}!</h5>
              <p className="card-text">
                <strong>Account Type:</strong>{' '}
                {user.role === 'registered_alumni'
                  ? 'Registered Alumni'
                  : 'Applied Alumni (Pending Approval)'}
              </p>
              <p className="card-text">
                <strong>Status:</strong>{' '}
                {profile ? (
                  <>
                    {profile.status === 'pending' && (
                      <span className="badge bg-warning">Pending Review</span>
                    )}
                    {profile.status === 'approved' && (
                      <span className="badge bg-success">Approved</span>
                    )}
                    {profile.status === 'rejected' && (
                      <span className="badge bg-danger">Rejected</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted">No profile submitted</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-8 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">Profile Management</h5>
              
              {profile ? (
                <>
                  <p className="card-text">
                    Your alumni profile is {profile.status}.
                    {profile.status === 'pending' && 
                      ' An administrator will review your submission soon.'}
                    {profile.status === 'rejected' && 
                      ' Please update your information and resubmit.'}
                  </p>
                  <div className="d-grid gap-2 d-md-flex mt-4">
                    <Link to="/profile" className="btn btn-primary">
                      View My Profile
                    </Link>
                    <Link to="/profile/edit" className="btn btn-outline-primary">
                      Edit Profile
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="card-text">
                    You haven't created your alumni profile yet. Create your profile to connect
                    with the Mediterranean College alumni community.
                  </p>
                  <div className="d-grid gap-2 d-md-block mt-4">
                    <Link to="/profile/edit" className="btn btn-primary">
                      Create Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Alumni Events</h5>
              {user.role === 'registered_alumni' ? (
                <Link to="/events" className="btn btn-sm btn-outline-primary">View All</Link>
              ) : null}
            </div>
            <div className="card-body">
              {events.length > 0 ? (
                <div className="list-group list-group-flush">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="list-group-item border-0 px-0">
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="small text-muted mb-1">
                        <i className="bi bi-calendar me-2"></i>
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        <span className="mx-2">•</span>
                        <i className="bi bi-clock me-1"></i>
                        {event.start_time} - {event.end_time}
                      </p>
                      <p className="small text-muted mb-2">
                        <i className="bi bi-geo-alt me-2"></i>
                        {event.location}
                        {event.is_virtual && <span className="badge bg-info text-white ms-2">Virtual</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No upcoming events found.</p>
              )}
              {user.role === 'applied_alumni' && (
                <div className="alert alert-warning mt-3">
                  You cannot access event details until your profile is approved.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Latest Job Opportunities</h5>
              {user.role === 'registered_alumni' ? (
                <Link to="/jobs" className="btn btn-sm btn-outline-primary">View All</Link>
              ) : null}
            </div>
            <div className="card-body">
              {jobs.length > 0 ? (
                <div className="list-group list-group-flush">
                  {jobs.slice(0, 3).map(job => (
                    <div key={job.id} className="list-group-item border-0 px-0">
                      <h6 className="mb-1">{job.job_title}</h6>
                      <p className="small text-muted mb-1">
                        <i className="bi bi-building me-2"></i>
                        {job.company_name}
                        {job.is_remote && (
                          <span className="badge bg-success ms-2">Remote</span>
                        )}
                      </p>
                      <p className="small text-muted mb-2">
                        <i className="bi bi-geo-alt me-2"></i>
                        {job.location || 'Location not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No job postings found.</p>
              )}
              {user.role === 'applied_alumni' && (
                <div className="alert alert-warning mt-3">
                  You cannot access job details until your profile is approved.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {user.role === 'registered_alumni' && (
        <div className="row">
          <div className="col-md-12">
            <div className="card shadow">
              <div className="card-body">
                <h5 className="card-title mb-4">Quick Actions</h5>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/events/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Event
                  </Link>
                  <Link to="/jobs/create" className="btn btn-success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Post Job Opportunity
                  </Link>
                  <Link to="/alumni" className="btn btn-info text-white">
                    <i className="bi bi-people me-2"></i>
                    Connect with Alumni
                  </Link>
                  <Link to="/settings/notifications" className="btn btn-secondary">
                    <i className="bi bi-bell me-2"></i>
                    Notification Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
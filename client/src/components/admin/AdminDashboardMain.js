import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const AdminDashboardMain = () => {
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, eventsRes] = await Promise.all([
          axiosInstance.get('/api/jobs'),
          axiosInstance.get('/api/events')
        ]);
        setJobs(jobsRes.data || []);
        setEvents(eventsRes.data || []);
        setLoading(false);
      } catch (err) {
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
      <h1 className="mb-4">Admin Dashboard</h1>
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <button className="btn btn-primary btn-lg w-100 mb-3" onClick={() => navigate('/admin/alumni')}>
            <i className="bi bi-people me-2"></i> Alumni Manager
          </button>
        </div>
        <div className="col-md-3">
          <button className="btn btn-success btn-lg w-100 mb-3" onClick={() => navigate('/admin/jobs')}>
            <i className="bi bi-briefcase me-2"></i> Review Job Opportunities
          </button>
        </div>
        <div className="col-md-3">
          <button className="btn btn-info btn-lg w-100 mb-3 text-white" onClick={() => navigate('/admin/events')}>
            <i className="bi bi-calendar-event me-2"></i> Review Upcoming Events
          </button>
        </div>
        <div className="col-md-3">
          <button className="btn btn-warning btn-lg w-100 mb-3 text-white" onClick={() => navigate('/admin/applications')}>
            <i className="bi bi-file-earmark-text me-2"></i> Job Applications
          </button>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Upcoming Alumni Events</h5>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/admin/events')}>View All</button>
              </div>
              {events.length === 0 ? (
                <div className="text-muted">No upcoming events.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {events.slice(0, 3).map(event => (
                    <li key={event.id} className="list-group-item">
                      <div className="fw-semibold mb-1">
                        <i className="bi bi-calendar-event me-1"></i> {event.title || event.event_title}
                      </div>
                      <div className="small text-muted mb-1">
                        <i className="bi bi-clock me-1"></i> {event.date ? new Date(event.date).toLocaleDateString() : event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'} {event.time || ''}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-geo-alt me-1"></i> {event.location || 'Online'}
                        {event.is_virtual && <span className="badge bg-info ms-2">Virtual</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Latest Job Opportunities</h5>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/admin/jobs')}>View All</button>
              </div>
              {jobs.length === 0 ? (
                <div className="text-muted">No job opportunities.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {jobs.slice(0, 3).map(job => (
                    <li key={job.id} className="list-group-item">
                      <div className="fw-semibold mb-1">
                        <i className="bi bi-briefcase me-1"></i> {job.job_title}
                      </div>
                      <div className="small text-muted mb-1">
                        <i className="bi bi-building me-1"></i> {job.company_name}
                        {job.is_remote && <span className="badge bg-success ms-2">Remote</span>}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-geo-alt me-1"></i> {job.location || 'N/A'}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain; 
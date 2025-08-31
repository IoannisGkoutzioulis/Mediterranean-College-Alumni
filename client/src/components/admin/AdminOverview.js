import React from 'react';

const AdminOverview = ({ jobs = [], events = [], setActiveTab }) => (
  <div className="row g-4">
    <div className="col-lg-6">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Upcoming Alumni Events</h5>
            <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab('content')}>View All</button>
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
            <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab('content')}>View All</button>
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
);

export default AdminOverview; 
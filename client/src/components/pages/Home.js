import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dashboard for logged-in alumni
  const AlumniDashboard = () => {
    return (
      <div className="py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="display-5 fw-bold">Welcome to Your Alumni Portal</h1>
              <p className="lead mb-0">
                Connect with fellow alumni, access exclusive resources, and stay updated with the Mediterranean College community.
              </p>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-primary text-white mx-auto mb-3">
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Alumni Network</h3>
                  <p className="card-text small text-muted">Connect with fellow Mediterranean College graduates</p>
                  {user.role === 'registered_alumni' ? (
                    <Link to="/alumni" className="btn btn-outline-primary mt-auto">
                      Browse Alumni
                    </Link>
                  ) : user.role === 'applied_alumni' ? (
                    <Link to="/alumni" className="btn btn-outline-primary mt-auto">
                      Browse Alumni
                    </Link>
                  ) : (
                    <button className="btn btn-outline-primary mt-auto" disabled>
                      Browse Alumni
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-success text-white mx-auto mb-3">
                    <i className="bi bi-calendar-event fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Alumni Events</h3>
                  <p className="card-text small text-muted">Discover upcoming events and reunions</p>
                  {user.role === 'registered_alumni' ? (
                    <button onClick={() => navigate('/events')} className="btn btn-outline-success mt-auto">
                      View Events
                    </button>
                  ) : (
                    <button className="btn btn-outline-success mt-auto" disabled>
                      View Events
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-info text-white mx-auto mb-3">
                    <i className="bi bi-briefcase fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Career Opportunities</h3>
                  <p className="card-text small text-muted">Discover job postings from fellow alumni</p>
                  {user.role === 'registered_alumni' ? (
                    <button onClick={() => navigate('/jobs')} className="btn btn-outline-info mt-auto">
                      View Opportunities
                    </button>
                  ) : (
                    <button className="btn btn-outline-info mt-auto" disabled>
                      View Opportunities
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {user.role === 'applied_alumni' && (
            <div className="alert alert-warning text-center">
              Your profile is pending approval. You will gain access to alumni features once approved.
            </div>
          )}

          <div className="row">
            <div className="col-lg-12 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0">
                <div className="card-body">
                  <h3 className="h5 card-title">Complete Your Alumni Profile</h3>
                  <p className="card-text">
                    Make sure your profile is up-to-date to get the most out of the Mediterranean College Alumni network.
                  </p>
                  <Link to="/profile" className="btn btn-primary">
                    View My Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Landing page for non-logged-in users (visitors)
  const LandingPage = () => {
    return (
      <div>
        {/* Hero Section */}
        <div className="bg-primary text-white py-5">
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold mb-4">Mediterranean College Alumni Portal</h1>
                <p className="lead mb-4">
                  Connect with fellow graduates, access exclusive resources, and stay updated with the Mediterranean College community.
                </p>
                <div className="d-grid gap-2 d-md-flex">
                  <Link to="/register" className="btn btn-light btn-lg px-4 me-md-2">Join Now</Link>
                  <Link to="/alumni" className="btn btn-outline-light btn-lg px-4">Our Alumni</Link>
                </div>
              </div>
              <div className="col-lg-6 d-none d-lg-block">
                <img 
                  src="/images/alumni.jpg" 
                  alt="Mediterranean College Alumni" 
                  className="img-fluid rounded shadow"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="py-5">
          <div className="container">
            <div className="row text-center mb-5">
              <div className="col-lg-8 mx-auto">
                <h2 className="fw-bold">Connect with the Mediterranean College Community</h2>
                <p className="lead text-muted">
                  Our alumni portal offers valuable resources, networking opportunities, and support for graduates.
                </p>
              </div>
            </div>
            
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                      <i className="bi bi-people-fill"></i>
                    </div>
                    <h3 className="card-title">Connect</h3>
                    <p className="card-text">
                      Connect with fellow alumni across various departments and build valuable professional relationships.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                      <i className="bi bi-briefcase-fill"></i>
                    </div>
                    <h3 className="card-title">Career</h3>
                    <p className="card-text">
                      Access job opportunities, professional development resources, and career support services.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <h3 className="card-title">Events</h3>
                    <p className="card-text">
                      Stay updated on alumni events, reunions, and professional development opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-light py-5">
          <div className="container py-4">
            <div className="row align-items-center">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="fw-bold mb-3">Ready to Join Our Alumni Network?</h2>
                <p className="lead mb-4">
                  Create your profile, connect with fellow graduates, and access exclusive alumni resources.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <Link to="/register" className="btn btn-primary btn-lg px-4 gap-3">Register Now</Link>
                  <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">Already a Member? Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin dashboard for admin users
  const AdminDashboard = () => {
    console.log('Rendering AdminDashboard');
    return (
      <div className="py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="display-5 fw-bold">Admin Dashboard</h1>
              <p className="lead mb-0">
                Manage alumni, job opportunities, and upcoming events.
              </p>
            </div>
          </div>
          <div className="row mb-5">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-primary text-white mx-auto mb-3">
                    <i className="bi bi-person-badge fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Alumni Manager</h3>
                  <p className="card-text small text-muted">View and manage alumni records</p>
                  <Link to="/admin/alumni" className="btn btn-outline-primary mt-auto">
                    Go to Alumni Manager
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-info text-white mx-auto mb-3">
                    <i className="bi bi-briefcase fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Review Job Opportunities</h3>
                  <p className="card-text small text-muted">Approve or edit job postings</p>
                  <Link to="/admin/jobs" className="btn btn-outline-info mt-auto">
                    Go to Job Opportunities
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-success text-white mx-auto mb-3">
                    <i className="bi bi-calendar-event fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Review Upcoming Events</h3>
                  <p className="card-text small text-muted">Approve or edit alumni events</p>
                  <Link to="/admin/events" className="btn btn-outline-success mt-auto">
                    Go to Events
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 dashboard-card shadow-sm border-0 text-center">
                <div className="card-body d-flex flex-column">
                  <div className="icon-circle bg-warning text-white mx-auto mb-3">
                    <i className="bi bi-file-earmark-text fs-4"></i>
                  </div>
                  <h3 className="h5 card-title">Job Applications</h3>
                  <p className="card-text small text-muted">Manage and review job applications</p>
                  <Link to="/admin/applications" className="btn btn-outline-warning mt-auto">
                    Go to Applications
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add console log to check user role
  console.log('Current user:', user);
  
  return (
    <div>
      {user ? (
        (user.role === 'admin' || user.role === 'administrative') ? <AdminDashboard /> : <AlumniDashboard />
      ) : (
        <LandingPage />
      )}
    </div>
  );
};

export default Home;
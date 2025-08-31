import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  useEffect(() => {
    // Load Bootstrap JavaScript if not already loaded
    const loadBootstrapJS = async () => {
      if (!window.bootstrap) {
        try {
          await import('bootstrap/dist/js/bootstrap.bundle.min.js');
          console.log('Bootstrap JS loaded dynamically');
        } catch (err) {
          console.error('Failed to load Bootstrap JS', err);
        }
      }
    };
    
    loadBootstrapJS();
    
    // Make sure dropdown is initialized after render
    const setupDropdown = () => {
      if (dropdownButtonRef.current && typeof window.bootstrap !== 'undefined') {
        // Create a new dropdown instance
        new window.bootstrap.Dropdown(dropdownButtonRef.current);
      }
    };
    
    // Run after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setupDropdown();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  useEffect(() => {
    if (user && (user.role === 'registered_alumni' || user.role === 'administrative')) {
      axiosInstance.get('/api/messages/unread/count')
        .then(res => setUnreadCount(res.data.count || 0))
        .catch(() => setUnreadCount(0));
    }
  }, [user]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen((prev) => !prev);
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="/logo.png" alt="Mediterranean College" height="40" className="me-2" />
          Mediterranean College Alumni
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Always visible links */}
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/alumni">Alumni Directory</Link>
            </li>
            
            {user ? (
              // Logged in user menu
              <>
                {/* Admin menu */}
                {user.role === 'administrative' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">Admin Dashboard</Link>
                  </li>
                )}
                
                {/* Registered Alumni menu - New order */}
                {user.role === 'registered_alumni' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/jobs">Career Opportunities</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/events">Alumni Events</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item mx-2">
                      <Link to="/messages/inbox" className="nav-link position-relative">
                        <i className="bi bi-inbox"></i>
                        {unreadCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7em' }}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  </>
                )}
                
                {/* Applied Alumni menu */}
                {user.role === 'applied_alumni' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                )}
                
                {/* User dropdown */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    ref={dropdownButtonRef}
                    onClick={toggleDropdown}
                  >
                    {user.username}
                  </a>
                  <ul 
                    className={`dropdown-menu dropdown-menu-end${dropdownOpen ? ' show' : ''}`} 
                    aria-labelledby="navbarDropdown"
                    ref={dropdownRef}
                  >
                    {(user.role === 'applied_alumni' || user.role === 'registered_alumni') && (
                      <li>
                        <Link className="dropdown-item" to="/profile" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                      </li>
                    )}
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              // Guest menu
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
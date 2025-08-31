import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from '../../utils/axiosConfig'; // Import the configured axios

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    zipcode: '',
    address: '',
    birthDate: '',
    mobile: '',
    school_id: '', // New field for school selection
    role: 'alumni' // Default role is alumni
  });
  
  const [schools, setSchools] = useState([]); // State to hold available schools
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, register, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Fetch schools when component mounts
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        // Fetch schools from the API
        const response = await axios.get('/api/schools');
        setSchools(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading schools:', err);
        setFormError('Error loading schools. Please try again.');
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Update form error when context error changes
  useEffect(() => {
    setFormError(error || '');
  }, [error]);
  
  const { 
    username, 
    email, 
    password, 
    confirmPassword, 
    firstName,
    lastName,
    country,
    city,
    zipcode,
    address,
    birthDate,
    mobile,
    school_id,
    role 
  } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !email || !password || !confirmPassword || 
        !firstName || !lastName || !country || !city || 
        !zipcode || !address || !birthDate || !mobile || !school_id) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    // Validate mobile number (simple validation)
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile)) {
      setFormError('Please enter a valid mobile number');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Format role for the backend
    const formattedRole = role === 'alumni' ? 'applied_alumni' : 'visitor';
    
    // Submit form with all additional fields including school
    const success = await register(
      username, 
      email, 
      password, 
      formattedRole, 
      { 
        firstName, 
        lastName, 
        country, 
        city, 
        zipcode, 
        address, 
        birthDate, 
        mobile,
        school_id: parseInt(school_id) // Convert to number
      }
    );
    
    if (success) {
      navigate('/dashboard');
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
    <div className="container-fluid py-5 bg-light">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <img src="/logo.png" alt="Mediterranean College" height="50" className="mb-2" />
              <h4 className="mb-0">Alumni Portal Registration</h4>
            </div>
            <div className="card-body p-4">
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-at"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={username}
                      onChange={handleChange}
                      placeholder="Create a username"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                {/* School Selection Dropdown */}
                <div className="mb-3">
                  <label htmlFor="school_id" className="form-label">School/Department *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-building"></i>
                    </span>
                    <select
                      className="form-select"
                      id="school_id"
                      name="school_id"
                      value={school_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your school</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="birthDate" className="form-label">Birth Date *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-calendar"></i>
                    </span>
                    <input
                      type="date"
                      className="form-control"
                      id="birthDate"
                      name="birthDate"
                      value={birthDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">Mobile Number *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-phone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      id="mobile"
                      name="mobile"
                      value={mobile}
                      onChange={handleChange}
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>
                  <small className="form-text text-muted">
                    Format: +12345678901 or 12345678901
                  </small>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label htmlFor="country" className="form-label">Country *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-globe"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={country}
                        onChange={handleChange}
                        placeholder="Enter your country"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">City *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-building"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label htmlFor="zipcode" className="form-label">Zipcode *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="zipcode"
                        name="zipcode"
                        value={zipcode}
                        onChange={handleChange}
                        placeholder="Enter zipcode"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="address" className="form-label">Address *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-house-door"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <small className="form-text text-muted">
                    Password must be at least 6 characters
                  </small>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                >
                  Register
                </button>
                
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    Already have an account? Login
                  </Link>
                </div>
              </form>
            </div>
            <div className="card-footer bg-white text-center py-3">
              <small className="text-muted">
                By registering, you agree to Mediterranean College's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
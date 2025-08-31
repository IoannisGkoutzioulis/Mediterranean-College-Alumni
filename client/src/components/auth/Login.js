import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const { user, login, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Update form error when context error changes
  useEffect(() => {
    setFormError(error || '');
  }, [error]);
  
  const { username, password } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      setFormError('Please enter both username and password');
      return;
    }
    
    // Submit form
    const success = await login(username, password);
    
    if (success) {
      // Redirect will happen automatically via useEffect
    }
  };
  
  return (
    <div className="container-fluid py-5 bg-light">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <img src="/logo.png" alt="Mediterranean College" height="50" className="mb-2" />
              <h4 className="mb-0">Alumni Portal Login</h4>
            </div>
            <div className="card-body p-4">
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
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
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                >
                  Login
                </button>
                
                <div className="text-center">
                  <Link to="/register" className="text-decoration-none">
                    Don't have an account? Register
                  </Link>
                </div>
              </form>
            </div>
            <div className="card-footer bg-white text-center py-3">
              <small className="text-muted">
                For technical assistance, please contact <a href="mailto:alumni@medcollege.edu">alumni@medcollege.edu</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const ProfileForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    school_id: '',
    graduation_year: '',
    degree_earned: '',
    study_program: '',
    current_job_title: '',
    current_company: '',
    employment_history: '',
    bio: '',
    linkedin: '',
    profile_image: '',
    email: '',
    address: '',
    city: '',
    country: '',
    mobile: ''
  });
  
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  // Validate graduation year is in the past
  const validateGraduationYear = (year) => {
    const currentYear = new Date().getFullYear();
    return parseInt(year) <= currentYear;
  };
  
  // Fetch schools and user's profile (if exists)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch schools
        const schoolsResponse = await axiosInstance.get('/api/schools');
        setSchools(schoolsResponse.data);
        
        try {
          // Try to fetch user's profile
          const profileResponse = await axiosInstance.get('/api/alumni-profiles/me');
          setFormData(prev => ({ ...prev, ...profileResponse.data }));
          setIsEdit(true);
        } catch (profileError) {
          // No profile exists yet, that's okay
          if (profileError.response && profileError.response.status !== 404) {
            throw profileError;
          }
          
          // If user registered with a school, pre-fill the school_id and other fields
          if (user && user.school_id) {
            setFormData(prevState => ({
              ...prevState,
              school_id: user.school_id,
              email: user.email,
              address: user.address,
              city: user.city,
              country: user.country,
              mobile: user.mobile
            }));
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error loading data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const { 
    school_id, 
    graduation_year, 
    degree_earned,
    study_program,
    current_job_title, 
    current_company, 
    employment_history,
    bio, 
    linkedin,
    email,
    address,
    city,
    country,
    mobile
  } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!school_id || !graduation_year || !degree_earned) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate graduation year is in the past
    if (!validateGraduationYear(graduation_year)) {
      setError('Graduation year must be in the past for alumni');
      return;
    }
    
    try {
      if (isEdit) {
        // Update profile
        await axiosInstance.put('/api/alumni-profiles/me', formData);
        setSuccessMessage('Profile updated successfully');
      } else {
        // Create profile
        await axiosInstance.post('/api/alumni-profiles', formData);
        setSuccessMessage('Profile created successfully. An administrator will review your submission.');
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Error submitting profile');
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
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">
                {isEdit ? 'Edit Your Alumni Profile' : 'Create Your Alumni Profile'}
              </h2>
              
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
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="school_id" className="form-label">School/Department *</label>
                  <select
                    className="form-select"
                    id="school_id"
                    name="school_id"
                    value={school_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="graduation_year" className="form-label">Graduation Year *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="graduation_year"
                      name="graduation_year"
                      value={graduation_year || ''}
                      onChange={handleChange}
                      max={new Date().getFullYear()}
                      required
                    />
                    <small className="form-text text-muted">
                      Must be in the past for alumni
                    </small>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="degree_earned" className="form-label">Degree Earned *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="degree_earned"
                      name="degree_earned"
                      value={degree_earned || ''}
                      onChange={handleChange}
                      placeholder="e.g., Bachelor of Business Administration"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="study_program" className="form-label">Study Program</label>
                  <input
                    type="text"
                    className="form-control"
                    id="study_program"
                    name="study_program"
                    value={study_program || ''}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="current_job_title" className="form-label">Current Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="current_job_title"
                      name="current_job_title"
                      value={current_job_title || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label htmlFor="current_company" className="form-label">Current Company</label>
                    <input
                      type="text"
                      className="form-control"
                      id="current_company"
                      name="current_company"
                      value={current_company || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="employment_history" className="form-label">Employment History</label>
                  <textarea
                    className="form-control"
                    id="employment_history"
                    name="employment_history"
                    rows="3"
                    value={employment_history || ''}
                    onChange={handleChange}
                    placeholder="Briefly describe your employment history..."
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio/About</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="4"
                    value={bio || ''}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your achievements, and your experience at Mediterranean College..."
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="linkedin" className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="form-control"
                    id="linkedin"
                    name="linkedin"
                    value={linkedin || ''}
                    onChange={handleChange}
                    placeholder="https://www.linkedin.com/in/your-profile"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={address || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={city || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="country" className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    id="country"
                    name="country"
                    value={country || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mobile"
                    name="mobile"
                    value={mobile || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2"
                  >
                    {isEdit ? 'Update Profile' : 'Submit Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
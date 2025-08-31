import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        
        // Configure axios to use token for all requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Register new user with additional profile data and school selection
  const register = async (username, email, password, role = 'applied_alumni', profileData = {}) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        username,
        email,
        password,
        role,
        profile: {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          country: profileData.country || '',
          city: profileData.city || '',
          zipcode: profileData.zipcode || '',
          address: profileData.address || '',
          birthDate: profileData.birthDate || '',
          mobile: profileData.mobile || '',
          school_id: profileData.school_id || null
        },
        // Include these for backward compatibility
        first_name: profileData.firstName || '',
        last_name: profileData.lastName || '',
        country: profileData.country || '',
        city: profileData.city || '',
        zipcode: profileData.zipcode || '',
        address: profileData.address || '',
        birth_date: profileData.birthDate || '',
        mobile: profileData.mobile || '',
        school_id: profileData.school_id || null
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configure axios to use token for all requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      
      return true;
    } catch (error) {
      console.error('Registration error details:', error);
      setError(
        error.response && error.response.data 
          ? error.response.data.message 
          : 'Registration failed. Please check your connection and try again.'
      );
      return false;
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configure axios to use token for all requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      
      return true;
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove authorization header
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  // Update user role (when profile is approved)
  const updateUserRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
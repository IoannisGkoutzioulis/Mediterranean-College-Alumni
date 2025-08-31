import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Mock data for testing
    const mockProfile = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      school_name: 'School of Business',
      graduation_year: 2025,
      linkedin: 'https://linkedin.com/in/johndoe',
      bio: 'This is a sample bio.',
      status: 'pending'
    };
    
    setProfile(mockProfile);
    setLoading(false);
    
    // Uncomment this for real API call
    /*
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/alumni-profiles/me');
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading profile. Please try again.');
        setLoading(false);
      }
    };
    fetchProfile();
    */
  }, []);

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div>No profile found.</div>
        <Link to="/profile/edit">Create Profile</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1>My Profile</h1>
      {error && <div>{error}</div>}
      
      <div>
        <h2>{profile.first_name} {profile.last_name}</h2>
        <p>School: {profile.school_name}</p>
        <p>Graduation: {profile.graduation_year}</p>
        
        {profile.linkedin && (
          <a 
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        )}
        
        {profile.bio && <p>{profile.bio}</p>}
      </div>
    </div>
  );
};

export default ProfileView;
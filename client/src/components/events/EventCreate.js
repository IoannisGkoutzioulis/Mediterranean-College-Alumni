import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';

const EventCreate = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_time: '09:00',
    end_time: '10:30',
    date: new Date().toISOString().split('T')[0],
    location: '',
    is_virtual: false,
    meeting_link: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setEventForm({
      ...eventForm,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        event_date: eventForm.date,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        location: eventForm.location,
        is_virtual: eventForm.is_virtual,
        meeting_link: eventForm.is_virtual ? eventForm.meeting_link : null
      };
      await axiosInstance.post('/api/events', eventData);
      setSuccess('Event created successfully!');
      setTimeout(() => navigate('/events'), 1500);
    } catch (err) {
      setError('Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Create New Event</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" name="title" value={eventForm.title} onChange={handleInputChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" name="description" value={eventForm.description} onChange={handleInputChange} rows={3} required />
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" name="date" value={eventForm.date} onChange={handleInputChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Start Time</label>
            <input type="time" className="form-control" name="start_time" value={eventForm.start_time} onChange={handleInputChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">End Time</label>
            <input type="time" className="form-control" name="end_time" value={eventForm.end_time} onChange={handleInputChange} required />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          {!eventForm.is_virtual ? (
            <input type="text" className="form-control" name="location" value={eventForm.location} onChange={handleInputChange} required />
          ) : (
            <input type="text" className="form-control" name="location" value={eventForm.location} onChange={handleInputChange} />
          )}
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" name="is_virtual" id="is_virtual" checked={eventForm.is_virtual} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="is_virtual">Virtual Event</label>
        </div>
        {eventForm.is_virtual && (
          <div className="mb-3">
            <label className="form-label">Meeting Link</label>
            <input type="url" className="form-control" name="meeting_link" value={eventForm.meeting_link} onChange={handleInputChange} required={eventForm.is_virtual} />
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
      </form>
    </div>
  );
};

export default EventCreate; 
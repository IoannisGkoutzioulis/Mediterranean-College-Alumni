import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosConfig';

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Added this line to fix the error

  // Mock data for events (in a real app, this would come from an API)
  const mockEvents = [
    {
      id: 1,
      title: 'Annual Alumni Meetup',
      description: 'Networking event for all alumni',
      organizer: 'Mediterranean College Alumni Association',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      start_time: '18:00',
      end_time: '21:00',
      location: 'Mediterranean College Main Hall',
      is_virtual: false
    },
    {
      id: 2,
      title: 'Career Development Workshop',
      description: 'Learn how to boost your career',
      organizer: 'Career Services',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      start_time: '11:00',
      end_time: '12:30',
      location: 'Online via Zoom',
      is_virtual: true,
      meeting_link: 'https://zoom.us/j/example'
    },
    {
      id: 3,
      title: 'Alumni Speaker Series',
      description: 'Featuring successful graduates',
      organizer: 'School of Business',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
      start_time: '14:00',
      end_time: '15:30',
      location: 'Conference Room A',
      is_virtual: false
    },
  ];

  // Simulate fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Try to fetch real events
        const response = await axiosInstance.get('/api/events');
        
        // Map API events to expected format
        const formattedEvents = response.data.map(event => ({
          ...event,
          date: new Date(event.event_date)
        }));
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        console.log('Using mock events due to API error:', err);
        // Use mock data as fallback
        setTimeout(() => {
          setEvents(mockEvents);
          setLoading(false);
        }, 500);
      }
    };
    
    fetchEvents();
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selectedDate);
  };

  const getEventsForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(
      (event) => 
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      // Try real API call first
      await axiosInstance.delete(`/api/events/${eventId}`);
      
      // Update local state
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Error deleting event - using local state update:', err);
      // Fall back to just updating state without API call
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      const eventsForDay = getEventsForDate(day);
      const hasEvents = eventsForDay.length > 0;

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className="day-number">{day}</div>
          {hasEvents && (
            <div className="event-dot mt-1" style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d6efd', display: 'inline-block' }}></span>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const renderEventList = () => {
    if (!selectedDate) return null;
    
    const eventsForSelectedDate = getEventsForDate(selectedDate.getDate());
    
    if (eventsForSelectedDate.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="text-muted mb-0">No events scheduled for this date.</p>
        </div>
      );
    }
    
    return (
      <div className="event-list">
        <h5 className="mb-3">
          Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h5>
        {eventsForSelectedDate.map((event) => (
          <div key={event.id} className="event-item card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h6 className="card-title mb-1">{event.title}</h6>
                {(user && (user.role === 'administrative' || event.organizer_id === user.id)) && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
              <p className="card-text small text-muted mb-2">{event.description}</p>
              <div className="event-details">
                <div className="event-time small mb-1">
                  <i className="bi bi-clock me-1"></i>
                  {event.start_time} - {event.end_time}
                </div>
                <div className="event-location small">
                  <i className="bi bi-geo-alt me-1"></i>
                  {event.location}
                  {event.is_virtual && (
                    <span className="badge bg-info text-white ms-2">Virtual</span>
                  )}
                </div>
                {event.is_virtual && event.meeting_link && (
                  <div className="event-link small mt-2">
                    <a 
                      href={event.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-link-45deg me-1"></i>
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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

  // Get month name and year for header
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-4">Event Calendar</h1>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {/* Added success message display */}
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={handlePrevMonth}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <h5 className="mb-0 fw-bold">{monthName} {year}</h5>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={handleNextMonth}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="calendar">
                <div className="calendar-header">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                <div className="calendar-grid">
                  {renderCalendar()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Events</h5>
              {user && user.role === 'registered_alumni' && (
                <Link to="/events/create" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-circle me-1"></i> Add Event
                </Link>
              )}
            </div>
            <div className="card-body">
              {selectedDate ? (
                renderEventList()
              ) : (
                <p className="text-center text-muted p-4">
                  Select a date to view events
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
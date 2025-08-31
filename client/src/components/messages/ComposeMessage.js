import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';

const ComposeMessage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const recipientId = queryParams.get('recipient');
  const replyToId = queryParams.get('reply');
  
  const [formData, setFormData] = useState({
    recipient_id: recipientId || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  
  // Fetch list of potential recipients and handle reply data if needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all registered alumni for recipient selection
        const recipientsResponse = await axiosInstance.get('/api/alumni-flat');
        console.log('API Response:', recipientsResponse.data);
        
        // Process the flat alumni array
        const allAlumni = recipientsResponse.data
          .filter(alumnus => alumnus && alumnus.user_id)
          .map(alumnus => ({
            id: alumnus.user_id,
            name: `${alumnus.first_name} ${alumnus.last_name}`,
            school: alumnus.school_name
          }));
        
        console.log('Processed alumni list:', allAlumni);
        setRecipients(allAlumni);
        setLoadingRecipients(false);
        
        // If this is a reply, fetch the original message
        if (replyToId) {
          const messageResponse = await axiosInstance.get(`/api/messages/${replyToId}`);
          const originalMessage = messageResponse.data;
          
          setFormData({
            recipient_id: originalMessage.sender_id,
            subject: `Re: ${originalMessage.subject}`,
            message: `\n\n-------- Original Message --------\nFrom: ${originalMessage.sender_first_name} ${originalMessage.sender_last_name}\nDate: ${new Date(originalMessage.created_at).toLocaleString()}\nSubject: ${originalMessage.subject}\n\n${originalMessage.message}`
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading recipients. Please try again.');
        setLoadingRecipients(false);
      }
    };
    
    fetchData();
  }, [replyToId]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.recipient_id || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await axiosInstance.post('/api/messages', formData);
      
      setSuccessMessage('Message sent successfully!');
      
      // Reset form
      setFormData({
        recipient_id: '',
        subject: '',
        message: ''
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/messages/sent');
      }, 1500);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Error sending message. Please try again.');
      setLoading(false);
    }
  };
  
  if (loadingRecipients) {
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
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1>Compose Message</h1>
        <Link to="/messages/inbox" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Inbox
        </Link>
      </div>
      
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
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="recipient_id" className="form-label">Recipient</label>
              <select
                className="form-select"
                id="recipient_id"
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleChange}
                required
                disabled={loading || !!replyToId}
              >
                <option key="default" value="">Select a recipient</option>
                {recipients.map(recipient => (
                  <option key={`recipient-${recipient.id}`} value={recipient.id}>
                    {recipient.name} - {recipient.school}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter message subject"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="10"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                required
                disabled={loading}
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate('/messages/inbox')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-1"></i>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;
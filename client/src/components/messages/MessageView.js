import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axiosInstance.get(`/api/messages/${id}`);
        setMessage(response.data);
        setLoading(false);
        // Mark as read if current user is recipient and message is unread
        if (response.data && user && response.data.recipient_id === user.id && !response.data.is_read) {
          await axiosInstance.put(`/api/messages/${id}/read`);
          // Optionally, trigger a refresh of the unread count in the navbar
          if (window.dispatchEvent) {
            window.dispatchEvent(new Event('refresh-unread-count'));
          }
        }
      } catch (err) {
        console.error('Error fetching message:', err);
        setError('Error loading message. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMessage();
  }, [id, user]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/messages/${id}`);
      navigate('/messages/inbox');
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Error deleting message. Please try again.');
    }
  };
  
  const handleReply = () => {
    navigate(`/messages/new?reply=${id}`);
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
  
  if (!message) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Message not found or you don't have permission to view it.
        </div>
        <Link to="/messages/inbox" className="btn btn-primary">
          Return to Inbox
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h1>View Message</h1>
        <div>
          <Link to="/messages/inbox" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Inbox
          </Link>
          {message.recipient_id === message.current_user_id && (
            <button 
              className="btn btn-primary me-2"
              onClick={handleReply}
            >
              <i className="bi bi-reply me-1"></i>
              Reply
            </button>
          )}
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <i className="bi bi-trash me-1"></i>
            Delete
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">{message.subject}</h5>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <p className="mb-1">
              <strong>From:</strong> {message.sender_first_name} {message.sender_last_name} ({message.sender_username})
            </p>
            <p className="mb-1">
              <strong>To:</strong> {message.recipient_first_name} {message.recipient_last_name} ({message.recipient_username})
            </p>
            <p className="mb-0">
              <strong>Date:</strong> {new Date(message.created_at).toLocaleString()}
            </p>
          </div>
          
          <hr />
          
          <div className="message-content">
            {message.message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageView;
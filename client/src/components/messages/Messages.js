import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { folder = 'inbox' } = useParams();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const endpoint = folder === 'sent' ? '/api/messages/sent' : '/api/messages/inbox';
        const response = await axiosInstance.get(endpoint);
        setMessages(response.data);
        setLoading(false);
        
        // Get unread count
        const unreadResponse = await axiosInstance.get('/api/messages/unread/count');
        setUnreadCount(unreadResponse.data.unread_count);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Error loading messages. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [folder]);
  
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/messages/${id}`);
      setMessages(messages.filter(message => message.id !== id));
      
      // Update unread count if necessary
      if (folder === 'inbox') {
        const deletedMessage = messages.find(m => m.id === id);
        if (deletedMessage && !deletedMessage.is_read) {
          setUnreadCount(unreadCount - 1);
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Error deleting message. Please try again.');
    }
  };
  
  const renderMessageList = () => {
    if (messages.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted mb-0">No messages in your {folder}.</p>
        </div>
      );
    }
    
    return (
      <div className="list-group">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`list-group-item list-group-item-action ${!message.is_read && folder === 'inbox' ? 'fw-bold bg-light' : ''}`}
          >
            <div className="d-flex w-100 justify-content-between align-items-center">
              <h5 className="mb-1">
                <Link 
                  to={`/messages/view/${message.id}`}
                  className="text-decoration-none"
                >
                  {message.subject}
                </Link>
                {!message.is_read && folder === 'inbox' && (
                  <span className="badge bg-primary ms-2">New</span>
                )}
              </h5>
              <div>
                <button 
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <p className="mb-1">
              {folder === 'inbox' ? (
                <small>
                  From: {message.sender_first_name} {message.sender_last_name} ({message.sender_username})
                </small>
              ) : (
                <small>
                  To: {message.recipient_first_name} {message.recipient_last_name} ({message.recipient_username})
                </small>
              )}
            </p>
            <small className="text-muted">
              {new Date(message.created_at).toLocaleString()}
            </small>
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
  
  return (
    <div className="container py-5">
      <h1 className="mb-4">Messages</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Folders</h5>
            </div>
            <div className="list-group list-group-flush">
              <Link 
                to="/messages/inbox" 
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${folder === 'inbox' ? 'active' : ''}`}
              >
                <div>
                  <i className="bi bi-inbox me-2"></i>
                  Inbox
                </div>
                {unreadCount > 0 && (
                  <span className="badge bg-primary rounded-pill">{unreadCount}</span>
                )}
              </Link>
              <Link 
                to="/messages/sent" 
                className={`list-group-item list-group-item-action ${folder === 'sent' ? 'active' : ''}`}
              >
                <i className="bi bi-send me-2"></i>
                Sent
              </Link>
            </div>
          </div>
          
          <div className="d-grid">
            <Link 
              to="/messages/new" 
              className="btn btn-primary"
            >
              <i className="bi bi-pencil-square me-2"></i>
              New Message
            </Link>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {folder === 'inbox' ? 'Inbox' : 'Sent Messages'}
              </h5>
            </div>
            <div className="card-body p-0">
              {renderMessageList()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
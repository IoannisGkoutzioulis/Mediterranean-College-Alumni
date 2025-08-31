import React from 'react';

const ProfileModal = ({ show, onClose, profile, action, comment, setComment, emailNotifications, setEmailNotifications, onAction }) => {
  if (!show || !profile) return null;
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="modal-dialog modal-lg" style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: 700,
        margin: '0 16px',
        zIndex: 2001,
        position: 'relative',
        padding: 32
      }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h5 className="modal-title">
            {action === 'view' && 'Profile Details'}
            {action === 'approve' && 'Approve Profile'}
            {action === 'reject' && 'Reject Profile'}
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body" style={{ paddingTop: 0 }}>
          <div className="row mb-4">
            <div className="col-md-6">
              <h6>Personal Information</h6>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{profile.first_name} {profile.last_name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{profile.email}</td>
                  </tr>
                  <tr>
                    <th>School</th>
                    <td>{profile.school_name}</td>
                  </tr>
                  <tr>
                    <th>Graduation Year</th>
                    <td>{profile.graduation_year}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {(action === 'approve' || action === 'reject') && (
            <div>
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">
                  {action === 'approve' ? 'Approval Comment' : 'Rejection Reason'}
                </label>
                <textarea
                  className="form-control"
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={action === 'approve' ? 'Enter any comments for approval' : 'Enter reason for rejection'}
                ></textarea>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sendEmail"
                  checked={emailNotifications}
                  onChange={e => setEmailNotifications(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="sendEmail">
                  Send email notification
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          {action === 'approve' && (
            <button 
              type="button" 
              className="btn btn-success"
              onClick={onAction}
            >
              Approve Profile
            </button>
          )}
          {action === 'reject' && (
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={onAction}
            >
              Reject Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 
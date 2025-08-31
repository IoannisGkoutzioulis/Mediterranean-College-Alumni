import React from 'react';

const AlumniManagement = ({ profiles, activeStatusTab, setActiveStatusTab, viewProfileDetails, openActionModal }) => (
  <div className="card shadow-sm">
    <div className="card-header bg-white py-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Alumni Management</h5>
        <div className="btn-group">
          <button 
            className={`btn btn-outline-primary ${activeStatusTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`btn btn-outline-primary ${activeStatusTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('approved')}
          >
            Approved
          </button>
          <button 
            className={`btn btn-outline-primary ${activeStatusTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveStatusTab('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>School</th>
              <th>Graduation Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles
              .filter(profile => profile.status === activeStatusTab)
              .map(profile => (
                <tr key={profile.id}>
                  <td>{profile.first_name} {profile.last_name}</td>
                  <td>{profile.email}</td>
                  <td>{profile.school_name}</td>
                  <td>{profile.graduation_year}</td>
                  <td>
                    <span className={`badge bg-${profile.status === 'pending' ? 'warning' : profile.status === 'approved' ? 'success' : 'danger'}`}>
                      {profile.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => viewProfileDetails(profile)}
                      >
                        View
                      </button>
                      {profile.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => openActionModal(profile, 'approve')}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openActionModal(profile, 'reject')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AlumniManagement; 
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';
// import Portal from '../Portal'; // Uncomment if you have a Portal component for dropdowns

const AlumniManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState('');
  const [schoolStats, setSchoolStats] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownButtonRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.custom-dropdown')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profilesResponse = await axiosInstance.get('/api/alumni-profiles');
        setProfiles(profilesResponse.data);
        const schools = {};
        profilesResponse.data.forEach(profile => {
          if (!schools[profile.school_id]) {
            schools[profile.school_id] = {
              id: profile.school_id,
              name: profile.school_name,
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0
            };
          }
          schools[profile.school_id].total += 1;
          if (profile.status === 'pending') schools[profile.school_id].pending += 1;
          else if (profile.status === 'approved') schools[profile.school_id].approved += 1;
          else if (profile.status === 'rejected') schools[profile.school_id].rejected += 1;
        });
        setSchoolStats(Object.values(schools));
        setLoading(false);
      } catch (err) {
        setError('Error loading profiles. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      return;
    }
    const buttonRect = dropdownButtonRefs.current[id]?.getBoundingClientRect();
    if (buttonRect) {
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.right - 160 + window.scrollX,
        width: buttonRect.width
      });
    }
    setOpenDropdownId(id);
  };

  const openActionModal = (profile, actionType) => {
    setSelectedProfile(profile);
    setAction(actionType);
    setComment('');
    setShowModal(true);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setSelectedProfile(null);
    setAction('');
    setComment('');
    setShowModal(false);
  };

  const getFilteredProfiles = () => {
    switch (activeTab) {
      case 'pending': return profiles.filter(profile => profile.status === 'pending');
      case 'approved': return profiles.filter(profile => profile.status === 'approved');
      case 'rejected': return profiles.filter(profile => profile.status === 'rejected');
      default: return profiles;
    }
  };

  const handleProfileAction = async () => {
    if (!selectedProfile || !action) return;
    try {
      const endpoint = action === 'approve'
        ? `/api/alumni-profiles/${selectedProfile.id}/approve`
        : `/api/alumni-profiles/${selectedProfile.id}/reject`;
      const response = await axiosInstance.put(endpoint, {
        comment: comment,
        send_email: emailNotifications
      });
      const notificationSent = response.data && response.data.email_sent;
      setProfiles(profiles.map(profile =>
        profile.id === selectedProfile.id
          ? { ...profile, status: action === 'approve' ? 'approved' : 'rejected', admin_comment: comment }
          : profile
      ));
      setSchoolStats(schoolStats.map(school => {
        if (school.id === selectedProfile.school_id) {
          const newStats = { ...school };
          if (selectedProfile.status === 'pending') newStats.pending -= 1;
          else if (selectedProfile.status === 'approved') newStats.approved -= 1;
          else if (selectedProfile.status === 'rejected') newStats.rejected -= 1;
          if (action === 'approve') newStats.approved += 1;
          else newStats.rejected += 1;
          return newStats;
        }
        return school;
      }));
      closeModal();
      setSuccessMessage(
        action === 'approve'
          ? `Profile approved successfully. ${notificationSent ? 'Notification email has been sent to the alumni.' : 'Email notification could not be sent.'}`
          : `Profile rejected successfully. ${notificationSent ? 'Notification email has been sent to the alumni.' : 'Email notification could not be sent.'}`
      );
      setTimeout(() => { setSuccessMessage(''); }, 3000);
    } catch (err) {
      setError(`Error ${action === 'approve' ? 'approving' : 'rejecting'} profile. Please try again.`);
      setTimeout(() => { setError(''); }, 3000);
    }
  };

  const viewProfileDetails = (profile) => {
    setSelectedProfile(profile);
    setAction('view');
    setShowModal(true);
    setOpenDropdownId(null);
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
    <div className="container-fluid py-5">
      <h1 className="mb-4">Alumni Manager</h1>
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">{successMessage}</div>
      )}
      <div className="row">
        <div className="col-md-2" style={{ minWidth: 220 }}>
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Dashboard</h5>
            </div>
            <div className="card-body">
              <ul className="nav nav-pills flex-column">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    <i className="bi bi-hourglass me-2"></i>Pending Profiles
                    <span className="badge bg-warning ms-2">{profiles.filter(p => p.status === 'pending').length}</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                    <i className="bi bi-check-circle me-2"></i>Approved Profiles
                    <span className="badge bg-success ms-2">{profiles.filter(p => p.status === 'approved').length}</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
                    <i className="bi bi-x-circle me-2"></i>Rejected Profiles
                    <span className="badge bg-danger ms-2">{profiles.filter(p => p.status === 'rejected').length}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">School Statistics</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {schoolStats.map(school => (
                  <div key={school.id} className="list-group-item">
                    <h6 className="mb-2">{school.name}</h6>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Total Profiles:</span>
                      <span className="badge bg-primary">{school.total}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Pending:</span>
                      <span className="badge bg-warning">{school.pending}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Approved:</span>
                      <span className="badge bg-success">{school.approved}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Rejected:</span>
                      <span className="badge bg-danger">{school.rejected}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-10" style={{ paddingLeft: 0 }}>
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">
                {activeTab === 'pending' && 'Pending Profiles'}
                {activeTab === 'approved' && 'Approved Profiles'}
                {activeTab === 'rejected' && 'Rejected Profiles'}
              </h5>
            </div>
            <div className="card-body p-0" style={{ overflowX: 'auto' }}>
              <div className="table-responsive">
                <table className="table mb-0" style={{ minWidth: 1000 }}>
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>School</th>
                      <th>Graduation Year</th>
                      <th>Current Job</th>
                      <th>Status</th>
                      <th style={{ minWidth: 140, maxWidth: 180 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredProfiles().length > 0 ? (
                      getFilteredProfiles().map(profile => (
                        <tr key={profile.id}>
                          <td>
                            <button className="btn btn-link text-decoration-none p-0 text-start" onClick={() => viewProfileDetails(profile)}>
                              {profile.first_name} {profile.last_name}
                            </button>
                          </td>
                          <td>{profile.email}</td>
                          <td>{profile.school_name}</td>
                          <td>{profile.graduation_year || 'N/A'}</td>
                          <td>{profile.current_job_title || 'N/A'}</td>
                          <td>
                            {profile.status === 'pending' && <span className="badge bg-warning">Pending</span>}
                            {profile.status === 'approved' && <span className="badge bg-success">Approved</span>}
                            {profile.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
                          </td>
                          <td style={{ minWidth: 140, maxWidth: 180, whiteSpace: 'nowrap' }}>
                            <button className="btn btn-sm btn-outline-primary me-2" title="View Details" onClick={() => viewProfileDetails(profile)}>
                              <i className="bi bi-eye"></i>
                            </button>
                            {profile.status !== 'approved' && (
                              <button className="btn btn-sm btn-outline-success me-2" title="Approve" onClick={() => openActionModal(profile, 'approve')}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                            )}
                            {profile.status !== 'rejected' && (
                              <button className="btn btn-sm btn-outline-danger" title="Reject" onClick={() => openActionModal(profile, 'reject')}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">No profiles found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for viewing details or approving/rejecting profiles */}
      {showModal && selectedProfile && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="modal-dialog modal-lg"
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
              width: '100%',
              maxWidth: 1100,
              margin: '0 16px',
              zIndex: 2001,
              position: 'relative',
              padding: 24,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <style>{`
              .modal-dialog .table-sm th, .modal-dialog .table-sm td {
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
                font-size: 0.97rem;
              }
              .modal-dialog .table-sm {
                margin-bottom: 0.5rem;
              }
            `}</style>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h5 className="modal-title">
                {action === 'view' && 'Profile Details'}
                {action === 'approve' && 'Approve Profile'}
                {action === 'reject' && 'Reject Profile'}
              </h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body" style={{ paddingTop: 0 }}>
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6>Personal Information</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr><th>Name</th><td>{selectedProfile.first_name} {selectedProfile.last_name}</td></tr>
                      <tr><th>Email</th><td>{selectedProfile.email}</td></tr>
                      <tr><th>Country</th><td>{selectedProfile.country || '-'}</td></tr>
                      <tr><th>City</th><td>{selectedProfile.city || '-'}</td></tr>
                      <tr><th>Zipcode</th><td>{selectedProfile.zipcode || '-'}</td></tr>
                      <tr><th>Address</th><td>{selectedProfile.address || '-'}</td></tr>
                      <tr><th>Birth Date</th><td>{selectedProfile.birth_date ? new Date(selectedProfile.birth_date).toLocaleDateString() : '-'}</td></tr>
                      <tr><th>Mobile</th><td>{selectedProfile.mobile || '-'}</td></tr>
                    </tbody>
                  </table>
                  <h6>Professional Information</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr><th>Current Job Title</th><td>{selectedProfile.current_job_title || '-'}</td></tr>
                      <tr><th>Current Company</th><td>{selectedProfile.current_company || '-'}</td></tr>
                      <tr><th>Employment History</th><td style={{whiteSpace: 'pre-line'}}>{selectedProfile.employment_history || '-'}</td></tr>
                      <tr><th>LinkedIn</th><td>{selectedProfile.linkedin ? <a href={selectedProfile.linkedin.startsWith('http') ? selectedProfile.linkedin : `https://${selectedProfile.linkedin}`} target="_blank" rel="noopener noreferrer">{selectedProfile.linkedin}</a> : '-'}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6>Education</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr><th>School</th><td>{selectedProfile.school_name}</td></tr>
                      <tr><th>Graduation Year</th><td>{selectedProfile.graduation_year}</td></tr>
                      <tr><th>Degree Earned</th><td>{selectedProfile.degree_earned || '-'}</td></tr>
                      <tr><th>Study Program</th><td>{selectedProfile.study_program || '-'}</td></tr>
                    </tbody>
                  </table>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Bio</strong>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.97rem', marginTop: 4 }}>
                      {selectedProfile.bio || '-'}
                    </div>
                  </div>
                  <table className="table table-sm">
                    <tbody>
                      <tr><th>Status</th><td><span className={`badge bg-${selectedProfile.status === 'pending' ? 'warning' : selectedProfile.status === 'approved' ? 'success' : 'danger'}`}>{selectedProfile.status}</span></td></tr>
                      <tr><th>Admin Comment</th><td style={{whiteSpace: 'pre-line'}}>{selectedProfile.admin_comment || '-'}</td></tr>
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
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              {action === 'approve' && (
                <button type="button" className="btn btn-success" onClick={handleProfileAction}>Approve Profile</button>
              )}
              {action === 'reject' && (
                <button type="button" className="btn btn-danger" onClick={handleProfileAction}>Reject Profile</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniManager; 
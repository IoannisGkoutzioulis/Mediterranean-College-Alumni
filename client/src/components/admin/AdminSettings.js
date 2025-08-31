import React from 'react';

const AdminSettings = ({ emailNotifications, setEmailNotifications, schoolStats }) => (
  <div className="card shadow-sm">
    <div className="card-header bg-white">
      <h5 className="mb-0">System Settings</h5>
    </div>
    <div className="card-body">
      <div className="mb-4">
        <h6>Email Notifications</h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={e => setEmailNotifications(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="emailNotifications">
            Send email notifications for profile approvals/rejections
          </label>
        </div>
      </div>
      <div className="mb-4">
        <h6>School Statistics</h6>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>School</th>
                <th>Total</th>
                <th>Pending</th>
                <th>Approved</th>
                <th>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {schoolStats.map(school => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>{school.total}</td>
                  <td>{school.pending}</td>
                  <td>{school.approved}</td>
                  <td>{school.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default AdminSettings; 
import React from 'react';

const SidebarNav = ({ activeTab, setActiveTab }) => (
  <div className="card shadow-sm mb-4">
    <div className="card-body">
      <ul className="nav nav-pills flex-column">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'alumni' ? 'active' : ''}`}
            onClick={() => setActiveTab('alumni')}
          >
            <i className="bi bi-people me-2"></i>
            Alumni Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Content Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="bi bi-gear me-2"></i>
            Settings
          </button>
        </li>
      </ul>
    </div>
  </div>
);

export default SidebarNav; 
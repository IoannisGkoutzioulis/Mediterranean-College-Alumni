import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboardMain from './components/admin/AdminDashboardMain';
import AlumniManager from './components/admin/AlumniManager';
import ReviewJobs from './components/admin/ReviewJobs';
import AdminJobApplications from './components/admin/AdminJobApplications';
import ProfileForm from './components/profile/ProfileForm';
import ProfileView from './components/profile/ProfileView';
import AlumniDirectory from './components/alumni/AlumniDirectory';
import AlumniProfileView from './components/alumni/AlumniProfileView';
import NotFound from './components/pages/NotFound';
import NotificationPreferences from './components/settings/NotificationPreferences';
import JobsList from './components/jobs/JobsList';
import JobDetail from './components/jobs/JobDetail';
import JobForm from './components/jobs/JobForm';
import Calendar from './components/events/Calendar';
import Messages from './components/messages/Messages';
import MessageView from './components/messages/MessageView';
import ComposeMessage from './components/messages/ComposeMessage';
import EventCreate from './components/events/EventCreate';
import ReviewEvents from './components/admin/ReviewEvents';
import JobApplicationsPage from './components/jobs/JobApplicationsPage';
import MyJobApplications from './components/jobs/MyJobApplications';

// Context for authentication
import { AuthProvider } from './context/AuthContext';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap JavaScript - makes dropdowns work
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = null;
  
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/alumni" element={<AlumniDirectory />} />
              
              {/* Protected Routes for Alumni */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['applied_alumni', 'registered_alumni', 'administrative']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute allowedRoles={['applied_alumni', 'registered_alumni']}>
                    <ProfileForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['applied_alumni', 'registered_alumni']}>
                    <ProfileView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/:id" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni', 'administrative']}>
                    <AlumniProfileView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings/notifications" 
                element={
                  <ProtectedRoute allowedRoles={['applied_alumni', 'registered_alumni', 'administrative']}>
                    <NotificationPreferences />
                  </ProtectedRoute>
                } 
              />
              
              {/* Job Routes */}
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route 
                path="/jobs/create" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni']}>
                    <JobForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni']}>
                    <JobForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:jobId/applications" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni']}>
                    <JobApplicationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-job-applications" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni', 'administrative']}>
                    <MyJobApplications />
                  </ProtectedRoute>
                } 
              />
              
              {/* Events Routes */}
              <Route path="/events" element={<Calendar />} />
              <Route 
                path="/events/create" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni']}>
                    <EventCreate />
                  </ProtectedRoute>
                } 
              />
              
              {/* Messages Routes */}
              <Route 
                path="/messages/:folder" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni', 'administrative']}>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages/view/:id" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni', 'administrative']}>
                    <MessageView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages/new" 
                element={
                  <ProtectedRoute allowedRoles={['registered_alumni', 'administrative']}>
                    <ComposeMessage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['administrative']}>
                    <AdminDashboardMain />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/alumni" 
                element={
                  <ProtectedRoute allowedRoles={['administrative']}>
                    <AlumniManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/jobs" 
                element={
                  <ProtectedRoute allowedRoles={['administrative']}>
                    <ReviewJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/events" 
                element={
                  <ProtectedRoute allowedRoles={['administrative']}>
                    <ReviewEvents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/applications" 
                element={
                  <ProtectedRoute allowedRoles={['administrative']}>
                    <AdminJobApplications />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
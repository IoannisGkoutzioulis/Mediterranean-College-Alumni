import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5>Mediterranean College</h5>
            <p className="text-muted">
              Mediterranean College is dedicated to providing quality education and fostering a strong student community.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://www.facebook.com/mediterraneancollege" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="https://twitter.com/medcollegethess" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="https://www.instagram.com/mediterranean_college" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="https://www.linkedin.com/company/mediterranean-college/posts/" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/students" className="text-muted text-decoration-none">Student Directory</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none">Login</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none">Register</Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h5>Schools</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">Business</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">Computing</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">Engineering</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">Education</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">Health Sciences</a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4">
            <h5>Contact Us</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i> 123 College Street, Athens, Greece
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> +30 210 1234567
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> info@medcollege.edu
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4 bg-secondary" />
        
        <div className="row align-items-center">
          <div className="col-md-7 text-center text-md-start">
            <p className="text-muted mb-md-0">
              &copy; {currentYear} Mediterranean College. All rights reserved.
            </p>
          </div>
          <div className="col-md-5 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-muted text-decoration-none">Privacy Policy</a>
              </li>
              <li className="list-inline-item mx-3">
                <a href="#" className="text-muted text-decoration-none">Terms of Use</a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-muted text-decoration-none">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
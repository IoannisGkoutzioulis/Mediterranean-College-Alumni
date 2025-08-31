import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5>Mediterranean College Alumni</h5>
            <p className="text-muted">
              Connecting graduates and fostering lifelong relationships with the Mediterranean College community.
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
                <a href="https://www.medcollege.edu.gr/en/schools/business-school/" className="text-muted text-decoration-none">Business</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-of-computing/" className="text-muted text-decoration-none">Computing</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-of-engineering/" className="text-muted text-decoration-none">Engineering</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-of-education/" className="text-muted text-decoration-none">Education</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/health_school/" className="text-muted text-decoration-none">Health Sciences & Sport Science</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-arts-design/" className="text-muted text-decoration-none">Art & Design</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-shipping-studies/" className="text-muted text-decoration-none">Shipping</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-of-tourism-and-hospitality/" className="text-muted text-decoration-none">Tourism and Hospitality</a>
              </li>
              <li className="mb-2">
                <a href="https://www.medcollege.edu.gr/en/schools/school-of-psychology/" className="text-muted text-decoration-none">Phycology</a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-4">
            <h5>Contact Us</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i> 13 Kodrigktonos & 94 Patission Ave, 104 34 | 107
                Patission Ave & 8 Pellinis, 11251
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> +30 210 8899600
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> alumni@medcollege.edu
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i> 33 Achilleos Street & 65 Vouliagmenis Avenue, 16675
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> +30 210 8899600
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> alumni@medcollege.edu
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i> 21 Ionos Dragoumi, 54625, Thessaloniki City Centre
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> +30 2310 287779
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> alumni@medcollege.edu
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
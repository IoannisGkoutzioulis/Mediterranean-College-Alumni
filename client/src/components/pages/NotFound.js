import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <div className="py-5">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-5">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
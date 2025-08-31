import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import AuthContext from '../../context/AuthContext';

const AlumniDirectory = () => {
  const { user } = useContext(AuthContext);
  const [alumniBySchool, setAlumniBySchool] = useState([]);
  const [schoolStats, setSchoolStats] = useState([]);
  const [activeSchool, setActiveSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    graduationYear: '',
    currentCompany: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Helper: determine if user can see full info
  const canSeeFullInfo = user && (user.role === 'registered_alumni' || user.role === 'administrative');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        // Fetch alumni grouped by school
        const response = await axiosInstance.get('/api/alumni');
        const data = Array.isArray(response.data) ? response.data : [];
        setAlumniBySchool(data);
        
        // Calculate statistics for each school
        const stats = data.map(school => {
          // Count total alumni
          const totalAlumni = school.alumni ? school.alumni.length : 0;
          
          // Get unique graduation years
          const graduationYears = school.alumni 
            ? [...new Set(school.alumni.map(a => a.graduation_year).filter(Boolean))]
            : [];
          
          // Get unique companies
          const companies = school.alumni 
            ? [...new Set(school.alumni.map(a => a.current_company).filter(Boolean))]
            : [];
          
          return {
            id: school.school_id,
            name: school.school_name,
            totalAlumni,
            graduationYears,
            companies
          };
        });
        
        setSchoolStats(stats);
        
        // Set the user's school as active by default if they have one
        if (user && user.school_id) {
          setActiveSchool(parseInt(user.school_id));
        } else if (data.length > 0) {
          // Otherwise set the first school as active
          setActiveSchool(data[0].school_id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching alumni:', err);
        
        // Fallback to mock data if API call fails
        const mockSchools = [
          {
            id: 1,
            name: 'School of Business',
            alumni: [
              {
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                degree_earned: 'Business Administration',
                graduation_year: 2020,
                current_job_title: 'Marketing Manager',
                current_company: 'Global Corp',
                linkedin: 'https://linkedin.com/in/johndoe'
              },
              {
                user_id: 2,
                first_name: 'Jane',
                last_name: 'Smith',
                degree_earned: 'Marketing',
                graduation_year: 2019,
                current_job_title: 'Brand Strategist',
                current_company: 'Brand Solutions',
                linkedin: 'https://linkedin.com/in/janesmith'
              }
            ]
          },
          {
            id: 2,
            name: 'School of Computing',
            alumni: [
              {
                user_id: 3,
                first_name: 'Michael',
                last_name: 'Johnson',
                degree_earned: 'Computer Science',
                graduation_year: 2021,
                current_job_title: 'Software Engineer',
                current_company: 'Tech Innovations',
                linkedin: 'https://linkedin.com/in/michaeljohnson'
              }
            ]
          },
          {
            id: 3,
            name: 'School of Engineering',
            alumni: []
          },
          {
            id: 4,
            name: 'School of Education',
            alumni: []
          },
          {
            id: 5,
            name: 'School of Health Sciences',
            alumni: []
          }
        ];
        
        setAlumniBySchool(mockSchools);
        
        // Also generate mock stats
        const mockStats = mockSchools.map(school => {
          const totalAlumni = school.alumni ? school.alumni.length : 0;
          const graduationYears = school.alumni 
            ? [...new Set(school.alumni.map(a => a.graduation_year).filter(Boolean))]
            : [];
          const companies = school.alumni 
            ? [...new Set(school.alumni.map(a => a.current_company).filter(Boolean))]
            : [];
          
          return {
            id: school.school_id,
            name: school.school_name,
            totalAlumni,
            graduationYears,
            companies
          };
        });
        
        setSchoolStats(mockStats);
        
        // Set active school
        if (user && user.school_id) {
          setActiveSchool(parseInt(user.school_id));
        } else if (mockSchools.length > 0) {
          setActiveSchool(mockSchools[0].school_id);
        }
        
        setLoading(false);
      }
    };
    
    fetchAlumni();
  }, [user]);

  const handleSchoolChange = (schoolId) => {
    setActiveSchool(schoolId);
    setSearchTerm('');
    setFilterOptions({
      graduationYear: '',
      currentCompany: ''
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOptions({
      ...filterOptions,
      [e.target.name]: e.target.value
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  // Function to open LinkedIn in new tab
  const openLinkedinProfile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter alumni based on search term and filters
  const filteredAlumni = () => {
    if (!activeSchool) return [];
    
    const activeSchoolData = alumniBySchool.find(school => school.school_id === activeSchool);
    
    if (!activeSchoolData || !activeSchoolData.alumni) return [];
    
    let filtered = activeSchoolData.alumni;
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(alumnus => 
        alumnus.first_name.toLowerCase().includes(searchLower) ||
        alumnus.last_name.toLowerCase().includes(searchLower) ||
        (alumnus.degree_earned && alumnus.degree_earned.toLowerCase().includes(searchLower)) ||
        (alumnus.current_job_title && alumnus.current_job_title.toLowerCase().includes(searchLower)) ||
        (alumnus.current_company && alumnus.current_company.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply graduation year filter
    if (filterOptions.graduationYear) {
      filtered = filtered.filter(alumnus => 
        alumnus.graduation_year === parseInt(filterOptions.graduationYear)
      );
    }
    
    // Apply company filter
    if (filterOptions.currentCompany) {
      filtered = filtered.filter(alumnus => 
        alumnus.current_company === filterOptions.currentCompany
      );
    }
    
    return filtered;
  };

  // Get available graduation years for the active school
  const getGraduationYears = () => {
    if (!activeSchool) return [];
    
    const schoolStat = schoolStats.find(stat => stat.id === activeSchool);
    return schoolStat ? schoolStat.graduationYears.sort((a, b) => b - a) : [];
  };

  // Get available companies for the active school
  const getCompanies = () => {
    if (!activeSchool) return [];
    
    const schoolStat = schoolStats.find(stat => stat.id === activeSchool);
    return schoolStat ? schoolStat.companies.sort() : [];
  };

  // Render alumni in grid view
  const renderGridView = () => {
    const filtered = filteredAlumni();
    if (filtered.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="lead text-muted">
            {searchTerm || filterOptions.graduationYear || filterOptions.currentCompany 
              ? 'No alumni found matching your search criteria.' 
              : 'No alumni found for this school.'}
          </p>
          {user && user.school_id && parseInt(user.school_id) === activeSchool && user.role === 'applied_alumni' && (
            <div className="alert alert-info mt-3">
              <i className="bi bi-info-circle me-2"></i>
              Your profile will appear here once it's approved by an administrator.
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filtered.map((alumnus, index) => (
          <div className="col" key={alumnus.user_id || `alumnus-${index}`}>
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center p-4">
                <div className="alumni-card-image mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto" style={{ width: '80px', height: '80px' }}>
                  <span className="h3 text-secondary mb-0">
                    {alumnus.first_name.charAt(0)}
                    {alumnus.last_name.charAt(0)}
                  </span>
                </div>
                <h5 className="card-title mb-1">
                  {alumnus.first_name} {alumnus.last_name}
                </h5>
                {/* Only show these fields for all users */}
                {alumnus.current_job_title && (
                  <p className="text-muted mb-1">{alumnus.current_job_title}</p>
                )}
                  {alumnus.graduation_year && (
                    <p className="alumni-year mb-2">
                      <span className="badge bg-secondary">Class of {alumnus.graduation_year}</span>
                    </p>
                  )}
                {/* Show school name for all users */}
                <p className="text-muted mb-0">{alumniBySchool.find(s => s.school_id === activeSchool)?.school_name}</p>
                {/* Only show extra info/actions for registered alumni/admins */}
                {user && user.id !== alumnus.user_id && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    {alumnus.linkedin && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openLinkedinProfile(alumnus.linkedin)}
                        aria-label={`LinkedIn profile of ${alumnus.first_name} ${alumnus.last_name}`}
                      >
                        <i className="bi bi-linkedin me-1"></i> LinkedIn
                      </button>
                    )}
                    {canSeeFullInfo && user && user.role === 'registered_alumni' && (
                      <Link to={`/messages/new?recipient=${alumnus.user_id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-envelope me-1"></i> Contact
                      </Link>
                    )}
                  </div>
                )}
                  {user && user.id === alumnus.user_id && (
                    <span className="position-absolute top-0 end-0 translate-middle-y badge bg-success mt-3 me-3">
                      You
                    </span>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render alumni in list view
  const renderListView = () => {
    const filtered = filteredAlumni();
    if (filtered.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="lead text-muted">
            {searchTerm || filterOptions.graduationYear || filterOptions.currentCompany 
              ? 'No alumni found matching your search criteria.' 
              : 'No alumni found for this school.'}
          </p>
        </div>
      );
    }
    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>School</th>
              <th>Graduation Year</th>
              <th>Current Job Title</th>
              {canSeeFullInfo && <th>Degree</th>}
              {canSeeFullInfo && <th>Company</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alumnus, index) => (
              <tr key={alumnus.user_id || `alumnus-${index}`}>
                <td>{alumnus.first_name} {alumnus.last_name}</td>
                <td>{alumniBySchool.find(s => s.school_id === activeSchool)?.school_name}</td>
                <td>{alumnus.graduation_year || 'N/A'}</td>
                <td>{alumnus.current_job_title || 'N/A'}</td>
                {canSeeFullInfo && <td>{alumnus.degree_earned || 'N/A'}</td>}
                {canSeeFullInfo && <td>{alumnus.current_company || 'N/A'}</td>}
                <td>
                  {user && user.id !== alumnus.user_id && (
                  <div className="d-flex gap-1">
                    {alumnus.linkedin && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openLinkedinProfile(alumnus.linkedin)}
                        aria-label={`LinkedIn profile of ${alumnus.first_name} ${alumnus.last_name}`}
                      >
                        <i className="bi bi-linkedin"></i>
                      </button>
                    )}
                      {canSeeFullInfo && user && user.role === 'registered_alumni' && (
                      <Link to={`/messages/new?recipient=${alumnus.user_id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-envelope"></i>
                      </Link>
                    )}
                  </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render school statistics
  const renderSchoolStats = () => {
    if (!activeSchool) return null;
    
    const schoolStat = schoolStats.find(stat => stat.id === activeSchool);
    
    if (!schoolStat) return null;
    
    return (
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Total Alumni</h5>
              <p className="display-4 mb-0">{schoolStat.totalAlumni}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Graduation Years</h5>
              <p className="mb-0">
                {schoolStat.graduationYears.length === 0 ? (
                  'No data available'
                ) : (
                  <span>{Math.min(...schoolStat.graduationYears)} - {Math.max(...schoolStat.graduationYears)}</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Companies</h5>
              <p className="mb-0">{schoolStat.companies.length} different companies</p>
            </div>
          </div>
        </div>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Alumni Directory</h1>
        
        {/* View mode toggle */}
        <div className="btn-group" role="group" aria-label="Toggle view mode">
          <button 
            type="button" 
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            <i className="bi bi-grid"></i> Grid
          </button>
          <button 
            type="button" 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            <i className="bi bi-list-ul"></i> List
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* School navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Browse by School</h5>
          <div className="d-flex flex-wrap gap-2">
            {console.log('School IDs:', alumniBySchool.map((s, idx) => s.school_id !== undefined ? s.school_id : `undefined-${idx}`))}
            {alumniBySchool.map((school, idx) => (
              <button
                key={school.school_id !== undefined ? school.school_id : `school-${idx}`}
                className={`btn ${activeSchool === school.school_id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleSchoolChange(school.school_id)}
              >
                {school.school_name}
                {school.alumni && school.alumni.length > 0 && (
                  <span className="badge bg-light text-dark ms-2">{school.alumni.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* School statistics */}
      {renderSchoolStats()}
      
      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search alumni..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search alumni"
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <select
                className="form-select"
                name="graduationYear"
                value={filterOptions.graduationYear}
                onChange={handleFilterChange}
                aria-label="Filter by graduation year"
              >
                <option value="">All Graduation Years</option>
                {getGraduationYears().map(year => (
                  <option key={year} value={year}>Class of {year}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <select
                className="form-select"
                name="currentCompany"
                value={filterOptions.currentCompany}
                onChange={handleFilterChange}
                aria-label="Filter by company"
              >
                <option value="">All Companies</option>
                {getCompanies().map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alumni listing */}
      <div className="card shadow-sm">
        <div className="card-body">
          {activeSchool && (
            <div>
              <h2 className="mb-4">
                {alumniBySchool.find(school => school.school_id === activeSchool)?.school_name} Alumni
              </h2>
              
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>
          )}
        </div>
      </div>
      
      {/* Call to action for non-alumni users */}
      {user && user.role === 'visitor' && (
        <div className="alert alert-info mt-4">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className="bi bi-info-circle-fill fs-3"></i>
            </div>
            <div>
              <h5 className="mb-1">Join the Mediterranean College Alumni Network</h5>
              <p className="mb-0">
                Update your profile to connect with fellow alumni, access exclusive resources,
                and stay updated with the Mediterranean College community.
              </p>
            </div>
            <div className="ms-auto">
              <Link to="/profile/edit" className="btn btn-primary">
                Complete Your Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const net = require('net');
require('dotenv').config();

// Import email service
const emailService = require('./utils/emailService');

// Sequelize setup for PostgreSQL
const { Sequelize, QueryTypes } = require('sequelize');

// Debug: Log masked DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set in environment variables!');
  process.exit(1);
}

// Mask sensitive parts of the URL for logging
const maskedUrl = dbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
console.log('Attempting to connect to database with URL:', maskedUrl);

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Add detailed connection test
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.parent) {
      console.error('Parent error:', err.parent.message);
      console.error('Error code:', err.parent.code);
    }
    process.exit(1); // Exit on connection failure
  });

const app = express();
const PORT = process.env.PORT || 5000;

console.log(`Server configured to use PORT: ${PORT}`);

// Use more secure JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Middleware
app.use(cors());
app.use(express.json());

// Root route with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Mediterranean College Alumni Portal API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register'
      },
      alumni: {
        profiles: '/api/alumni-profiles',
        directory: '/api/alumni'
      },
      events: '/api/events',
      jobs: '/api/jobs',
      messages: {
        inbox: '/api/messages/inbox',
        sent: '/api/messages/sent'
      }
    },
    documentation: 'API documentation will be available soon'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Determine the client build path
let clientBuildPath = path.join(__dirname, '../client/build');
if (!fs.existsSync(clientBuildPath)) {
  clientBuildPath = path.join(__dirname, 'client/build');
  if (!fs.existsSync(clientBuildPath)) {
    console.warn('Warning: Client build directory not found. Static file serving may not work correctly.');
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('[DEBUG] Token:', token);
  if (!token) {
    console.log('[DEBUG] No token provided');
    return res.status(401).json({ message: 'Authentication token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[DEBUG] Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    console.log('[DEBUG] Decoded user:', user);
    next();
  });
};

// Check user role middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    console.log('[DEBUG] checkRole req.user:', req.user);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('[DEBUG] Access denied for user:', req.user);
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

// Example: Get all schools (PostgreSQL/Sequelize)
app.get('/api/schools', async (req, res) => {
  try {
    const schools = await sequelize.query('SELECT * FROM schools', { type: QueryTypes.SELECT });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper: Only allow registered alumni for networking features
const requireRegisteredAlumni = checkRole(['registered_alumni']);

// --- ALUMNI DIRECTORY (grouped by school, for directory) ---
app.get('/api/alumni', async (req, res) => {
  try {
    const query = `
      SELECT s.id AS school_id, s.name AS school_name,
        json_agg(
          json_build_object(
            'user_id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'degree_earned', ap.degree_earned,
            'graduation_year', ap.graduation_year,
            'current_job_title', ap.current_job_title,
            'current_company', ap.current_company,
            'linkedin', ap.linkedin,
            'status', ap.status
          )
        ) FILTER (WHERE u.id IS NOT NULL AND ap.id IS NOT NULL AND ap.status = 'approved') as alumni
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `;
    const schools = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json(Array.isArray(schools) ? schools : []);
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- FLAT ALUMNI LIST (for messaging) ---
app.get('/api/alumni-flat', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user?.id || 0;
    const query = `
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        s.name as school_name,
        ap.status
      FROM users u
      JOIN schools s ON u.school_id = s.id
      LEFT JOIN alumni_profiles ap ON ap.user_id = u.id
      WHERE (u.role = 'registered_alumni' OR (u.role = 'applied_alumni' AND ap.status = 'approved'))
        AND u.id != :currentUserId
      ORDER BY u.first_name, u.last_name
    `;
    const alumni = await sequelize.query(query, {
      replacements: { currentUserId },
      type: QueryTypes.SELECT
    });
    res.json(alumni);
  } catch (error) {
    console.error('Error fetching alumni flat list:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- ALUMNI PROFILES (me endpoints first to avoid route conflict) ---
app.get('/api/alumni-profiles/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profiles = await sequelize.query(`
      SELECT 
        ap.id,
        ap.user_id,
        ap.school_id,
        ap.graduation_year,
        ap.degree_earned,
        ap.study_program,
        ap.current_job_title,
        ap.current_company,
        ap.employment_history,
        ap.bio,
        ap.profile_image,
        ap.linkedin,
        ap.status,
        ap.admin_comment,
        ap.created_at,
        ap.updated_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.country,
        u.city,
        u.zipcode,
        u.address,
        u.birth_date,
        u.mobile,
        s.name as school_name
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN schools s ON ap.school_id = s.id
      WHERE ap.user_id = :userId
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/alumni-profiles/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      school_id,
      graduation_year,
      degree_earned,
      study_program,
      current_job_title,
      current_company,
      employment_history,
      bio,
      linkedin,
      email,
      address,
      city,
      country,
      mobile
    } = req.body;
    // Fetch current status
    const currentProfile = await sequelize.query(
      'SELECT status FROM alumni_profiles WHERE user_id = :userId',
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    let newStatus = 'pending';
    if (currentProfile.length > 0 && currentProfile[0].status === 'approved') {
      newStatus = 'approved';
    }
    // Update alumni_profiles
    const result = await sequelize.query(`
      UPDATE alumni_profiles
      SET 
        school_id = :school_id,
        graduation_year = :graduation_year,
        degree_earned = :degree_earned,
        study_program = :study_program,
        current_job_title = :current_job_title,
        current_company = :current_company,
        employment_history = :employment_history,
        bio = :bio,
        linkedin = :linkedin,
        status = :newStatus,
        updated_at = NOW()
      WHERE user_id = :userId
      RETURNING *
    `, {
      replacements: {
        userId,
        school_id,
        graduation_year,
        degree_earned,
        study_program,
        current_job_title,
        current_company,
        employment_history,
        bio,
        linkedin,
        newStatus
      },
      type: QueryTypes.UPDATE
    });
    if (result[0].length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    // Update users table if any of these fields are provided
    const userFields = { email, address, city, country, mobile };
    const updateFields = Object.entries(userFields).filter(([k, v]) => v !== undefined);
    if (updateFields.length > 0) {
      const setClause = updateFields.map(([k], i) => `${k} = :${k}`).join(', ');
      const replacements = { userId };
      updateFields.forEach(([k, v]) => { replacements[k] = v; });
      await sequelize.query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = :userId`,
        { replacements, type: QueryTypes.UPDATE }
      );
    }
    res.json(result[0][0]);
  } catch (error) {
    console.error('Error updating alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- ALUMNI PROFILES (public view) ---
app.get('/api/alumni-profiles/:id', authenticateToken, async (req, res) => {
  const profileId = req.params.id;
  try {
    // Only allow full profile if admin or owner or profile is approved
    const profiles = await sequelize.query(`
      SELECT ap.*, u.username, u.email, u.first_name, u.last_name, u.country, u.city, u.zipcode, u.address, u.birth_date, u.mobile, s.name as school_name
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN schools s ON ap.school_id = s.id
      WHERE ap.id = :profileId
    `, {
      replacements: { profileId },
      type: QueryTypes.SELECT
    });
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const profile = profiles[0];
    const isAdmin = req.user && req.user.role === 'administrative';
    const isOwner = req.user && req.user.id === profile.user_id;
    if (profile.status === 'approved' || isAdmin || isOwner) {
      res.json(profile);
    } else {
      // Only return public info
      res.json({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        school_name: profile.school_name,
        graduation_year: profile.graduation_year,
        degree_earned: profile.degree_earned,
        status: profile.status
      });
    }
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      username, email, password, first_name, last_name, school_id,
      country, city, zipcode, address, birth_date, mobile
    } = req.body;

    // Check if user already exists
    const existingUser = await sequelize.query(
      'SELECT * FROM users WHERE username = :username OR email = :email',
      {
        replacements: { username, email },
        type: QueryTypes.SELECT,
      }
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (role: applied_alumni by default)
    await sequelize.query(
      `INSERT INTO users (
        username, email, password, first_name, last_name, school_id, country, city, zipcode, address, birth_date, mobile, role, created_at, updated_at
      ) VALUES (
        :username, :email, :password, :first_name, :last_name, :school_id, :country, :city, :zipcode, :address, :birth_date, :mobile, 'applied_alumni', NOW(), NOW()
      )`,
      {
        replacements: {
          username, email, password: hashedPassword, first_name, last_name, school_id,
          country, city, zipcode, address, birth_date, mobile
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: 'Registration successful! Await admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const users = await sequelize.query(
      'SELECT * FROM users WHERE username = :username',
      {
        replacements: { username },
        type: QueryTypes.SELECT,
      }
    );
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
      
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, school_id: user.school_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- ALUMNI PROFILES ---
app.get('/api/alumni-profiles', authenticateToken, checkRole(['administrative']), async (req, res) => {
  try {
    const profiles = await sequelize.query(`
      SELECT 
        ap.id,
        ap.user_id,
        ap.school_id,
        ap.graduation_year,
        ap.degree_earned,
        ap.study_program,
        ap.current_job_title,
        ap.current_company,
        ap.employment_history,
        ap.bio,
        ap.profile_image,
        ap.linkedin,
        ap.status,
        ap.admin_comment,
        ap.created_at,
        ap.updated_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.country,
        u.city,
        u.zipcode,
        u.address,
        u.birth_date,
        u.mobile,
        s.name as school_name
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN schools s ON ap.school_id = s.id
      ORDER BY ap.created_at DESC
    `, { type: QueryTypes.SELECT });

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching alumni profiles:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/alumni-profiles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      school_id, 
      graduation_year, 
      degree_earned,
      study_program,
      current_job_title, 
      current_company, 
      employment_history,
      bio, 
      linkedin
    } = req.body;
    
    // Check if profile already exists
    const existingProfiles = await sequelize.query(
      'SELECT * FROM alumni_profiles WHERE user_id = :userId',
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    if (existingProfiles.length > 0) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Create new profile
    const result = await sequelize.query(`
      INSERT INTO alumni_profiles (
        user_id,
      school_id, 
      graduation_year, 
      degree_earned,
        study_program,
      current_job_title, 
      current_company, 
      employment_history,
      bio, 
      linkedin, 
        status,
        created_at,
        updated_at
      ) VALUES (
        :userId,
        :school_id,
        :graduation_year,
        :degree_earned,
        :study_program,
        :current_job_title,
        :current_company,
        :employment_history,
        :bio,
        :linkedin,
        'pending',
        NOW(),
        NOW()
      ) RETURNING *
    `, {
      replacements: {
        userId,
          school_id, 
          graduation_year, 
          degree_earned,
        study_program,
        current_job_title,
        current_company,
        employment_history,
        bio,
        linkedin
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Error creating alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/alumni-profiles/:id/approve', authenticateToken, checkRole(['administrative']), async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, send_email } = req.body;

    // Update profile status
    const result = await sequelize.query(`
      UPDATE alumni_profiles
      SET 
        status = 'approved',
        admin_comment = :comment,
        updated_at = NOW()
      WHERE id = :id
      RETURNING *
    `, {
      replacements: { id, comment },
      type: QueryTypes.UPDATE
    });

    if (result[0].length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const updatedProfile = result[0][0];

    // --- DEBUG LOGGING ---
    console.log('[APPROVE] Alumni profile ID:', id);
    console.log('[APPROVE] Updating user role for user_id:', updatedProfile.user_id);
    // --- END DEBUG LOGGING ---

    // --- NEW: Update user role to registered_alumni ---
    const userRoleUpdate = await sequelize.query(
      `UPDATE users SET role = 'registered_alumni' WHERE id = :userId RETURNING *`,
      { replacements: { userId: updatedProfile.user_id }, type: QueryTypes.UPDATE }
    );
    // --- DEBUG LOGGING ---
    console.log('[APPROVE] User role update result:', userRoleUpdate[0]);
    // --- END DEBUG LOGGING ---
    // --- END NEW ---

    // If email notification is requested, send it
    let emailSent = false;
    if (send_email) {
      try {
        // Get user data for email
        const users = await sequelize.query(
          'SELECT * FROM users WHERE id = :userId',
          {
            replacements: { userId: updatedProfile.user_id },
            type: QueryTypes.SELECT
          }
        );

        if (users.length > 0) {
          const user = users[0];
          await emailService.sendEmail('profileApproved', user.email, {
            first_name: user.first_name,
            last_name: user.last_name,
            admin_comment: comment
          });
          emailSent = true;
        }
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }
    }

    res.json({ ...updatedProfile, email_sent: emailSent });
  } catch (error) {
    console.error('Error approving alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/alumni-profiles/:id/reject', authenticateToken, checkRole(['administrative']), async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, send_email } = req.body;

    // Update profile status
    const result = await sequelize.query(`
      UPDATE alumni_profiles
      SET 
        status = 'rejected',
        admin_comment = :comment,
        updated_at = NOW()
      WHERE id = :id
      RETURNING *
    `, {
      replacements: { id, comment },
      type: QueryTypes.UPDATE
    });

    if (result[0].length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const updatedProfile = result[0][0];

    // If email notification is requested, send it
    let emailSent = false;
    if (send_email) {
      try {
        // Get user data for email
        const users = await sequelize.query(
          'SELECT * FROM users WHERE id = :userId',
          {
            replacements: { userId: updatedProfile.user_id },
            type: QueryTypes.SELECT
          }
        );

        if (users.length > 0) {
          const user = users[0];
          await emailService.sendEmail('profileRejected', user.email, {
            first_name: user.first_name,
            last_name: user.last_name,
            admin_comment: comment
          });
          emailSent = true;
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
      }
    }

    res.json({ ...updatedProfile, email_sent: emailSent });
  } catch (error) {
    console.error('Error rejecting alumni profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- EVENTS ---
app.get('/api/events', async (req, res) => {
  try {
    const events = await sequelize.query(`
      SELECT e.*, u.first_name AS organizer_first_name, u.last_name AS organizer_last_name
      FROM alumni_events e
      JOIN users u ON e.organizer_id = u.id
      ORDER BY e.event_date ASC, e.start_time ASC
    `, { type: QueryTypes.SELECT });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/events/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet: get event detail' });
});

app.post('/api/events', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      event_date, 
      start_time, 
      end_time, 
      location,
      is_virtual,
      meeting_link
    } = req.body;
    const result = await sequelize.query(`
      INSERT INTO alumni_events (
        title, description, organizer_id, event_date, start_time, end_time, location, is_virtual, meeting_link, created_at, updated_at
      ) VALUES (
        :title, :description, :organizer_id, :event_date, :start_time, :end_time, :location, :is_virtual, :meeting_link, NOW(), NOW()
      ) RETURNING *
    `, {
      replacements: {
          title, 
          description, 
        organizer_id: req.user.id,
          event_date, 
          start_time, 
          end_time, 
          location, 
        is_virtual: !!is_virtual,
        meeting_link
      },
      type: QueryTypes.INSERT
    });
    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/events/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  const eventId = req.params.id;
  try {
    // Check if user is organizer or admin
    const events = await sequelize.query('SELECT * FROM alumni_events WHERE id = :eventId', {
      replacements: { eventId },
      type: QueryTypes.SELECT
    });
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const event = events[0];
    if (req.user.role !== 'administrative' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this event' });
    }
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      location,
      is_virtual,
      meeting_link
    } = req.body;
    const result = await sequelize.query(`
      UPDATE alumni_events SET
        title = :title,
        description = :description,
        event_date = :event_date,
        start_time = :start_time,
        end_time = :end_time,
        location = :location,
        is_virtual = :is_virtual,
        meeting_link = :meeting_link,
        updated_at = NOW()
      WHERE id = :eventId
      RETURNING *
    `, {
      replacements: {
        eventId,
        title,
        description,
        event_date,
        start_time,
        end_time,
        location,
        is_virtual: !!is_virtual,
        meeting_link
      },
      type: QueryTypes.UPDATE
    });
    res.json(result[0][0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/events/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
    const eventId = req.params.id;
  try {
    // Check if user is organizer or admin
    const events = await sequelize.query('SELECT * FROM alumni_events WHERE id = :eventId', {
      replacements: { eventId },
      type: QueryTypes.SELECT
    });
      if (events.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      const event = events[0];
    if (req.user.role !== 'administrative' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this event' });
    }
    await sequelize.query('DELETE FROM alumni_events WHERE id = :eventId', {
      replacements: { eventId },
      type: QueryTypes.DELETE
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for an event (alumni only)
app.post('/api/events/:id/register', requireRegisteredAlumni, async (req, res, next) => {
  const eventId = req.params.id;
  try {
      // Check if already registered
    const registrations = await sequelize.query('SELECT * FROM event_registrations WHERE event_id = :eventId AND alumni_id = :alumni_id', {
      replacements: { eventId, alumni_id: req.user.id },
      type: QueryTypes.SELECT
    });
      if (registrations.length > 0) {
        return res.status(400).json({ message: 'Already registered for this event' });
      }
    const result = await sequelize.query(`
      INSERT INTO event_registrations (
        event_id, alumni_id, registration_date
      ) VALUES (
        :eventId, :alumni_id, NOW()
      ) RETURNING *
    `, {
      replacements: {
        eventId,
        alumni_id: req.user.id
      },
      type: QueryTypes.INSERT
    });
    res.status(201).json(result[0][0]);
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get all registrations for an event (organizer or admin)
app.get('/api/events/:id/registrations', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  const eventId = req.params.id;
  try {
    // Check if user is organizer or admin
    const events = await sequelize.query('SELECT * FROM alumni_events WHERE id = :eventId', {
      replacements: { eventId },
      type: QueryTypes.SELECT
    });
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const event = events[0];
    if (req.user.role !== 'administrative' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view registrations for this event' });
    }
    const registrations = await sequelize.query(`
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM event_registrations r
      JOIN users u ON r.alumni_id = u.id
      WHERE r.event_id = :eventId
      ORDER BY r.registration_date DESC
    `, {
      replacements: { eventId },
      type: QueryTypes.SELECT
    });
    res.json(registrations);
    } catch (error) {
    console.error('Error fetching event registrations:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// --- MESSAGES ---
app.get('/api/messages/inbox', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  console.log('[DEBUG] /api/messages/inbox req.user:', req.user);
  try {
    const messages = await sequelize.query(
      `SELECT m.*, u.first_name AS sender_first_name, u.last_name AS sender_last_name, u.username AS sender_username
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.recipient_id = :userId
       ORDER BY m.created_at DESC`,
      {
        replacements: { userId: req.user.id },
        type: QueryTypes.SELECT
      }
    );
    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/messages/sent', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  console.log('[DEBUG] /api/messages/sent req.user:', req.user);
  try {
    const messages = await sequelize.query(
      `SELECT m.*, u.first_name AS recipient_first_name, u.last_name AS recipient_last_name, u.username AS recipient_username
       FROM messages m
       JOIN users u ON m.recipient_id = u.id
       WHERE m.sender_id = :userId
       ORDER BY m.created_at DESC`,
      {
        replacements: { userId: req.user.id },
        type: QueryTypes.SELECT
      }
    );
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/messages/unread/count', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  console.log('[DEBUG] /api/messages/unread/count req.user:', req.user);
  try {
    const result = await sequelize.query(
      `SELECT COUNT(*) AS count FROM messages WHERE recipient_id = :userId AND is_read = FALSE`,
      {
        replacements: { userId: req.user.id },
        type: QueryTypes.SELECT
      }
    );
    res.json({ count: parseInt(result[0].count, 10) });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/messages/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    // Fetch the message and join sender/recipient info
    const messages = await sequelize.query(`
      SELECT m.*, 
        sender.first_name AS sender_first_name, sender.last_name AS sender_last_name, sender.username AS sender_username,
        recipient.first_name AS recipient_first_name, recipient.last_name AS recipient_last_name, recipient.username AS recipient_username
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.id = :messageId
      LIMIT 1
    `, {
      replacements: { messageId },
      type: QueryTypes.SELECT
    });
    if (messages.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    const message = messages[0];
    // Only allow sender, recipient, or admin to view
    if (
      userRole !== 'administrative' &&
      message.sender_id !== userId &&
      message.recipient_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to view this message.' });
    }
    // Optionally, include current_user_id for frontend logic
    message.current_user_id = userId;
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/messages', authenticateToken, checkRole(['registered_alumni']), async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { recipient_id, subject, message } = req.body;
    if (!recipient_id || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Insert the message into the database
    const result = await sequelize.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, message, is_read, created_at)
       VALUES (:sender_id, :recipient_id, :subject, :message, FALSE, NOW())
       RETURNING *`,
      {
        replacements: { sender_id, recipient_id, subject, message },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/messages/:id/read', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  try {
    // Only allow recipient to mark as read
    const messages = await sequelize.query('SELECT * FROM messages WHERE id = :messageId AND recipient_id = :userId', {
      replacements: { messageId, userId },
      type: QueryTypes.SELECT
    });
    if (messages.length === 0) {
      return res.status(403).json({ message: 'You do not have permission to mark this message as read' });
    }
    await sequelize.query('UPDATE messages SET is_read = TRUE WHERE id = :messageId', {
      replacements: { messageId },
      type: QueryTypes.UPDATE
    });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- NOTIFICATION PREFERENCES ---
app.get('/api/notification-preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let prefs = await sequelize.query(
      'SELECT * FROM notification_preferences WHERE user_id = :userId',
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    if (prefs.length === 0) {
      try {
        const [created] = await sequelize.query(
          `INSERT INTO notification_preferences (user_id, profile_updates, event_notifications, job_notifications, message_notifications)
           VALUES (:userId, TRUE, TRUE, TRUE, TRUE) RETURNING *`,
          { replacements: { userId }, type: QueryTypes.INSERT }
        );
        return res.json(created[0]);
      } catch (insertError) {
        // If unique constraint error, fetch and return the existing row
        if (insertError.name === 'SequelizeUniqueConstraintError' || insertError.original?.code === '23505') {
          prefs = await sequelize.query(
            'SELECT * FROM notification_preferences WHERE user_id = :userId',
            { replacements: { userId }, type: QueryTypes.SELECT }
          );
          return res.json(prefs[0]);
        }
        throw insertError;
      }
    }
    res.json(prefs[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/notification-preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile_updates, event_notifications, job_notifications, message_notifications } = req.body;
    const [updated] = await sequelize.query(
      `UPDATE notification_preferences
       SET profile_updates = :profile_updates,
           event_notifications = :event_notifications,
           job_notifications = :job_notifications,
           message_notifications = :message_notifications
       WHERE user_id = :userId
       RETURNING *`,
      {
        replacements: {
          userId,
          profile_updates,
          event_notifications,
          job_notifications,
          message_notifications
        },
        type: QueryTypes.UPDATE
      }
    );
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- JOBS ---
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await sequelize.query(`
      SELECT j.*, u.first_name AS alumni_first_name, u.last_name AS alumni_last_name
         FROM job_postings j
         JOIN users u ON j.alumni_id = u.id
      WHERE j.expires_at IS NULL OR j.expires_at >= CURRENT_DATE
      ORDER BY j.created_at DESC
    `, { type: QueryTypes.SELECT });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const jobs = await sequelize.query(`
      SELECT j.*, u.first_name AS alumni_first_name, u.last_name AS alumni_last_name
         FROM job_postings j
         JOIN users u ON j.alumni_id = u.id
      WHERE j.id = :jobId
      LIMIT 1
    `, {
      replacements: { jobId },
      type: QueryTypes.SELECT
    });
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    res.json(jobs[0]);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/jobs', authenticateToken, checkRole(['registered_alumni']), async (req, res) => {
  try {
    const { 
      company_name, 
      job_title, 
      description, 
      requirements, 
      location,
      is_remote,
      application_link,
      contact_email,
      expires_at
    } = req.body;
    const result = await sequelize.query(`
      INSERT INTO job_postings (
        alumni_id, company_name, job_title, description, requirements, location, is_remote, application_link, contact_email, expires_at, created_at, updated_at
      ) VALUES (
        :alumni_id, :company_name, :job_title, :description, :requirements, :location, :is_remote, :application_link, :contact_email, :expires_at, NOW(), NOW()
      ) RETURNING *
    `, {
      replacements: {
        alumni_id: req.user.id,
        company_name,
        job_title,
        description,
        requirements,
        location,
        is_remote: !!is_remote,
        application_link,
        contact_email,
        expires_at
      },
      type: QueryTypes.INSERT
    });
    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/jobs/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  const jobId = req.params.id;
  try {
    // Allow admins to edit any job, alumni can only edit their own
    const jobs = await sequelize.query('SELECT * FROM job_postings WHERE id = :jobId', {
      replacements: { jobId },
      type: QueryTypes.SELECT
    });
      if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    const job = jobs[0];
    if (req.user.role !== 'administrative' && job.alumni_id !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this job posting' });
      }
    const {
          company_name, 
          job_title, 
          description, 
      requirements,
      location,
      is_remote,
      application_link,
      contact_email,
      expires_at
    } = req.body;
    const result = await sequelize.query(`
      UPDATE job_postings SET
        company_name = :company_name,
        job_title = :job_title,
        description = :description,
        requirements = :requirements,
        location = :location,
        is_remote = :is_remote,
        application_link = :application_link,
        contact_email = :contact_email,
        expires_at = :expires_at,
        updated_at = NOW()
      WHERE id = :jobId
      RETURNING *
    `, {
      replacements: {
        jobId,
        company_name,
        job_title,
        description,
        requirements,
        location,
        is_remote: !!is_remote,
        application_link,
        contact_email,
        expires_at
      },
      type: QueryTypes.UPDATE
    });
    res.json(result[0][0]);
    } catch (error) {
      console.error('Error updating job posting:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

app.delete('/api/jobs/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
    const jobId = req.params.id;
  try {
    // Allow admins to delete any job, alumni can only delete their own
    const jobs = await sequelize.query('SELECT * FROM job_postings WHERE id = :jobId', {
      replacements: { jobId },
      type: QueryTypes.SELECT
    });
      if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    const job = jobs[0];
    if (req.user.role !== 'administrative' && job.alumni_id !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to delete this job posting' });
      }
    await sequelize.query('DELETE FROM job_postings WHERE id = :jobId', {
      replacements: { jobId },
      type: QueryTypes.DELETE
    });
      res.json({ message: 'Job posting deleted successfully' });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Apply for a job (alumni only)
app.post('/api/jobs/:id/apply', authenticateToken, requireRegisteredAlumni, async (req, res, next) => {
    const jobId = req.params.id;
    const { cover_letter, resume_url } = req.body;
  console.log('[DEBUG] /api/jobs/:id/apply req.user:', req.user);
  try {
      // Check if already applied
    const applications = await sequelize.query('SELECT * FROM job_applications WHERE job_id = :jobId AND applicant_id = :applicant_id', {
      replacements: { jobId, applicant_id: req.user.id },
      type: QueryTypes.SELECT
    });
      if (applications.length > 0) {
      console.log('[DEBUG] User has already applied:', req.user.id, 'for job', jobId);
        return res.status(400).json({ message: 'You have already applied for this job' });
      }
    // Check if the job is still open (not accepted or rejected)
    const jobStatus = await sequelize.query('SELECT status FROM job_applications WHERE job_id = :jobId AND applicant_id = :applicant_id', {
      replacements: { jobId, applicant_id: req.user.id },
      type: QueryTypes.SELECT
    });
    if (jobStatus.length > 0 && jobStatus[0].status === 'pending') {
      return res.status(400).json({ message: 'You have already applied for this job and it is still pending.' });
    }
    const result = await sequelize.query(`
      INSERT INTO job_applications (
        job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at
      ) VALUES (
        :jobId, :applicant_id, :cover_letter, :resume_url, 'submitted', NOW(), NOW()
      ) RETURNING *
    `, {
      replacements: {
        jobId,
        applicant_id: req.user.id,
        cover_letter,
        resume_url
      },
      type: QueryTypes.INSERT
    });
    console.log('[DEBUG] Application submitted:', result[0][0]);
    res.status(201).json(result[0][0]);
    } catch (error) {
    console.error('Error applying for job:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get all applications for a job (job owner only)
  app.get('/api/jobs/:id/applications', authenticateToken, checkRole(['registered_alumni']), async (req, res) => {
    const jobId = req.params.id;
  try {
    // Check ownership
    const jobs = await sequelize.query('SELECT * FROM job_postings WHERE id = :jobId AND alumni_id = :alumni_id', {
      replacements: { jobId, alumni_id: req.user.id },
      type: QueryTypes.SELECT
    });
      if (jobs.length === 0) {
      return res.status(403).json({ message: 'You do not have permission to view applications for this job' });
    }
    const applications = await sequelize.query(`
      SELECT a.*, u.first_name, u.last_name, u.email, j.job_title,
             poster.first_name AS poster_first_name, poster.last_name AS poster_last_name, poster.email AS poster_email
         FROM job_applications a
         JOIN users u ON a.applicant_id = u.id
      JOIN job_postings j ON a.job_id = j.id
      JOIN users poster ON j.alumni_id = poster.id
      WHERE a.job_id = :jobId
      ORDER BY a.created_at DESC
    `, {
      replacements: { jobId },
      type: QueryTypes.SELECT
    });
      res.json(applications);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Check if current user has applied for a job
app.get('/api/jobs/:id/has-applied', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  try {
    const applications = await sequelize.query(
      'SELECT id FROM job_applications WHERE job_id = :jobId AND applicant_id = :userId',
      {
        replacements: { jobId, userId },
        type: QueryTypes.SELECT
      }
    );
    res.json({ hasApplied: applications.length > 0 });
    } catch (error) {
    console.error('Error checking if user has applied:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Accept a job application
app.patch('/api/job-applications/:id/accept', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  try {
    // Get the application and job
    const applications = await sequelize.query('SELECT * FROM job_applications WHERE id = :applicationId', {
      replacements: { applicationId },
      type: QueryTypes.SELECT
    });
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const application = applications[0];
    // Get the job
    const jobs = await sequelize.query('SELECT * FROM job_postings WHERE id = :jobId', {
      replacements: { jobId: application.job_id },
      type: QueryTypes.SELECT
    });
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = jobs[0];
    // Only job poster or admin can accept
    if (req.user.role !== 'administrative' && req.user.id !== job.alumni_id) {
      return res.status(403).json({ message: 'You do not have permission to accept this application' });
    }
    // Update status
    const [result] = await sequelize.query(
      'UPDATE job_applications SET status = \'accepted\', updated_at = NOW() WHERE id = :applicationId RETURNING *',
      { replacements: { applicationId }, type: QueryTypes.UPDATE }
    );
    res.json(result[0]);
    } catch (error) {
    console.error('Error accepting application:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Reject a job application
app.patch('/api/job-applications/:id/reject', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  try {
    // Get the application and job
    const applications = await sequelize.query('SELECT * FROM job_applications WHERE id = :applicationId', {
      replacements: { applicationId },
      type: QueryTypes.SELECT
    });
    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const application = applications[0];
    // Get the job
    const jobs = await sequelize.query('SELECT * FROM job_postings WHERE id = :jobId', {
      replacements: { jobId: application.job_id },
      type: QueryTypes.SELECT
    });
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = jobs[0];
    // Only job poster or admin can reject
    if (req.user.role !== 'administrative' && req.user.id !== job.alumni_id) {
      return res.status(403).json({ message: 'You do not have permission to reject this application' });
    }
    // Update status
    const [result] = await sequelize.query(
      'UPDATE job_applications SET status = \'rejected\', updated_at = NOW() WHERE id = :applicationId RETURNING *',
      { replacements: { applicationId }, type: QueryTypes.UPDATE }
    );
    res.json(result[0]);
    } catch (error) {
    console.error('Error rejecting application:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Get all applications for all jobs posted by the current user
app.get('/api/my-job-applications', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[DEBUG] /api/my-job-applications userId:', userId);
    // Get all jobs posted by this user
    const jobs = await sequelize.query('SELECT id, job_title FROM job_postings WHERE alumni_id = :userId', {
      replacements: { userId },
      type: QueryTypes.SELECT
    });
    console.log('[DEBUG] Jobs found for user:', jobs);
    if (jobs.length === 0) {
      return res.json([]);
    }
    const jobIds = jobs.map(j => j.id);
    console.log('[DEBUG] jobIds:', jobIds);
    if (jobIds.length === 0) {
      console.log('[DEBUG] No jobs found for user, returning empty array.');
      return res.json([]);
    }
    let applications = [];
    if (jobIds.length === 1) {
      console.log('[DEBUG] Using single jobId query:', jobIds[0]);
      applications = await sequelize.query(`
        SELECT a.*, u.first_name, u.last_name, u.email, j.job_title,
               poster.first_name AS poster_first_name, poster.last_name AS poster_last_name, poster.email AS poster_email
        FROM job_applications a
        JOIN users u ON a.applicant_id = u.id
        JOIN job_postings j ON a.job_id = j.id
        JOIN users poster ON j.alumni_id = poster.id
        WHERE a.job_id = :jobId
        ORDER BY a.created_at DESC
      `, {
        replacements: { jobId: jobIds[0] },
        type: QueryTypes.SELECT
      });
    } else {
      console.log('[DEBUG] Using multiple jobIds query:', jobIds);
      applications = await sequelize.query(`
        SELECT a.*, u.first_name, u.last_name, u.email, j.job_title,
               poster.first_name AS poster_first_name, poster.last_name AS poster_last_name, poster.email AS poster_email
        FROM job_applications a
        JOIN users u ON a.applicant_id = u.id
        JOIN job_postings j ON a.job_id = j.id
        JOIN users poster ON j.alumni_id = poster.id
        WHERE a.job_id IN (:jobIds)
        ORDER BY a.created_at DESC
      `, {
        replacements: { jobIds },
        type: QueryTypes.SELECT
      });
    }
    console.log('[DEBUG] Applications found:', applications);
    res.json(applications);
    } catch (error) {
    console.error('Error fetching my job applications:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// ADMIN: Get all job applications (with applicant and job info)
app.get('/api/admin/job-applications', authenticateToken, checkRole(['administrative']), async (req, res) => {
  try {
    const applications = await sequelize.query(`
      SELECT a.*, u.first_name, u.last_name, u.email, j.job_title,
             poster.first_name AS poster_first_name, poster.last_name AS poster_last_name, poster.email AS poster_email
      FROM job_applications a
      JOIN users u ON a.applicant_id = u.id
      JOIN job_postings j ON a.job_id = j.id
      JOIN users poster ON j.alumni_id = poster.id
      ORDER BY a.created_at DESC
    `, {
      type: QueryTypes.SELECT
    });
    res.json(applications);
    } catch (error) {
    console.error('Error fetching all job applications (admin):', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// --- PORT CHECK BEFORE STARTUP ---
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port);
  });
}

// --- IMPROVED SERVER STARTUP ---
async function startServer() {
  try {
    const portAvailable = await checkPortAvailable(PORT);
    if (!portAvailable) {
      console.error(`Port ${PORT} is already in use. Please stop the other process or change the PORT in your .env file.`);
      process.exit(1);
    }
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    // Serve static files from the React app if the directory exists (moved here)
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
    if (error.name === 'SequelizeConnectionError') {
      console.error('Failed to connect to the database. Please ensure your PostgreSQL server is running and the database exists.');
    } else {
      console.error('Failed to start server:', error);
    }
      process.exit(1);
    }
  }

  startServer();

app.delete('/api/messages/:id', authenticateToken, checkRole(['registered_alumni', 'administrative']), async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    // Only allow sender, recipient, or admin to delete
    const messages = await sequelize.query(
      `SELECT * FROM messages WHERE id = :messageId LIMIT 1`,
      { replacements: { messageId }, type: QueryTypes.SELECT }
    );
      if (messages.length === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }
    const message = messages[0];
    if (
      userRole !== 'administrative' &&
      message.sender_id !== userId &&
      message.recipient_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied: You do not have permission to delete this message.' });
    }
    await sequelize.query(
      `DELETE FROM messages WHERE id = :messageId`,
      { replacements: { messageId }, type: QueryTypes.DELETE }
    );
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object - this will be configured with the email service credentials
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates for different notification types
const emailTemplates = {
  // Template for profile approval
  profileApproved: (recipient, userData) => ({
    to: recipient,
    subject: 'Mediterranean College: Your Alumni Profile Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
          <h2>Mediterranean College Alumni Portal</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
          <p>Dear ${userData.first_name} ${userData.last_name},</p>
          <p>Congratulations! Your alumni profile has been approved by our administrators.</p>
          <p>You now have full access to all features of the Mediterranean College Alumni Portal, including:</p>
          <ul>
            <li>Connecting with fellow alumni</li>
            <li>Creating and participating in alumni events</li>
            <li>Posting and viewing job opportunities</li>
            <li>Accessing exclusive alumni resources</li>
          </ul>
          ${userData.admin_comment ? `<p><strong>Administrator Note:</strong> ${userData.admin_comment}</p>` : ''}
          <p>We're excited to have you as part of our alumni community!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile" 
               style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
               View Your Profile
            </a>
          </div>
          <p style="margin-top: 30px;">Best regards,<br>Mediterranean College Alumni Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>Mediterranean College | 21 Ionos Dragoumi, 54625, Thessaloniki City Centre | +210 88 99 600</p>
        </div>
      </div>
    `
  }),

  // Template for profile rejection
  profileRejected: (recipient, userData) => ({
    to: recipient,
    subject: 'Mediterranean College: Alumni Profile Update Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
          <h2>Mediterranean College Alumni Portal</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
          <p>Dear ${userData.first_name} ${userData.last_name},</p>
          <p>Thank you for submitting your profile to the Mediterranean College Alumni Portal.</p>
          <p>After reviewing your profile, our administrators have determined that some additional information or updates are needed before it can be approved.</p>
          ${userData.admin_comment ? `<p><strong>Reason:</strong> ${userData.admin_comment}</p>` : ''}
          <p>Please log in to your account and update your profile with the requested information. Once updated, your profile will be reviewed again.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/edit" 
               style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
               Update Your Profile
            </a>
          </div>
          <p style="margin-top: 30px;">Best regards,<br>Mediterranean College Alumni Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>Mediterranean College | 21 Ionos Dragoumi, 54625, Thessaloniki City Centre | +210 88 99 600</p>
        </div>
      </div>
    `
  }),
  
  // Template for event registration confirmation
  eventRegistration: (recipient, eventData, userData) => ({
    to: recipient,
    subject: `Mediterranean College: Registration Confirmed for ${eventData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
          <h2>Mediterranean College Alumni Portal</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
          <p>Dear ${userData.first_name} ${userData.last_name},</p>
          <p>Your registration for the following event has been confirmed:</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0d6efd;">
            <h3 style="margin-top: 0;">${eventData.title}</h3>
            <p><strong>Date:</strong> ${new Date(eventData.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${eventData.start_time} - ${eventData.end_time}</p>
            <p><strong>Location:</strong> ${eventData.location}</p>
            ${eventData.is_virtual ? `<p><strong>Meeting Link:</strong> <a href="${eventData.meeting_link}">${eventData.meeting_link}</a></p>` : ''}
          </div>
          <p>We look forward to seeing you at the event!</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/events" 
               style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
               View All Events
            </a>
          </div>
          <p style="margin-top: 30px;">Best regards,<br>Mediterranean College Alumni Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>Mediterranean College | 21 Ionos Dragoumi, 54625, Thessaloniki City Centre | +210 88 99 600</p>
        </div>
      </div>
    `
  }),
  
  // Template for job application notification
  jobApplication: (recipient, jobData, userData) => ({
    to: recipient,
    subject: `Mediterranean College: Application Received for ${jobData.job_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
          <h2>Mediterranean College Alumni Portal</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
          <p>Dear ${userData.first_name} ${userData.last_name},</p>
          <p>Your application for the following job posting has been submitted:</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0d6efd;">
            <h3 style="margin-top: 0;">${jobData.job_title}</h3>
            <p><strong>Company:</strong> ${jobData.company_name}</p>
            <p><strong>Location:</strong> ${jobData.location}${jobData.is_remote ? ' (Remote)' : ''}</p>
          </div>
          <p>The employer has been notified of your interest and may contact you directly for next steps.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs" 
               style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
               View All Job Opportunities
            </a>
          </div>
          <p style="margin-top: 30px;">Best regards,<br>Mediterranean College Alumni Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>Mediterranean College | 21 Ionos Dragoumi, 54625, Thessaloniki City Centre | +210 88 99 600</p>
        </div>
      </div>
    `
  })
};

// Email sending function
const sendEmail = async (type, recipient, data) => {
  try {
    // Select the appropriate email template
    let emailOptions;
    
    switch (type) {
      case 'profileApproved':
        emailOptions = emailTemplates.profileApproved(recipient, data);
        break;
      case 'profileRejected':
        emailOptions = emailTemplates.profileRejected(recipient, data);
        break;
      case 'eventRegistration':
        emailOptions = emailTemplates.eventRegistration(recipient, data.event, data.user);
        break;
      case 'jobApplication':
        emailOptions = emailTemplates.jobApplication(recipient, data.job, data.user);
        break;
      default:
        throw new Error('Invalid email type');
    }
    
    // Add sender details
    emailOptions.from = `Mediterranean College Alumni <${process.env.EMAIL_USER}>`;
    
    // Send the email
    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
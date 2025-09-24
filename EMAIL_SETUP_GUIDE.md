# 📧 Email Setup Guide for Password Reset

This guide explains how to set up email functionality for the custom password reset system.

## 🔧 Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME=Firebase Auth App
```

## 📮 Email Provider Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS`

### Option 2: Other SMTP Providers

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_smtp_username
EMAIL_PASS=your_mailgun_smtp_password
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_smtp_username
EMAIL_PASS=your_ses_smtp_password
```

## 🧪 Testing Email Configuration

Create a test script to verify your email setup:

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    const result = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: 'your-test-email@example.com',
      subject: 'Test Email',
      text: 'This is a test email from your app!',
    });
    
    console.log('✅ Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}

testEmail();
```

Run with: `node test-email.js`

## 🔒 Security Considerations

1. **Never commit email credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable 2FA** on your email account
4. **Use app-specific passwords** instead of main account passwords
5. **Consider using a dedicated email service** for production

## 🚀 Production Recommendations

For production, consider these email services:

- **SendGrid** - Reliable, good free tier
- **Mailgun** - Developer-friendly, good documentation
- **AWS SES** - Cost-effective for high volume
- **Postmark** - Great for transactional emails

## 📝 Email Templates

The system includes beautiful HTML email templates with:
- Responsive design
- Brand colors and styling
- Clear call-to-action buttons
- Security warnings
- Mobile-friendly layout

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure "Less secure app access" is disabled

2. **"Connection timeout" error**:
   - Check firewall settings
   - Verify SMTP host and port
   - Try different ports (465 for SSL, 587 for TLS)

3. **"Authentication failed" error**:
   - Double-check email and password
   - Ensure account is not locked
   - Try generating a new app password

### Debug Mode:

Enable debug logging in your email service:

```javascript
const transporter = nodemailer.createTransporter({
  // ... your config
  debug: true, // Enable debug logging
  logger: true // Log to console
});
```

## 📊 Monitoring

Consider adding email delivery monitoring:

1. **Track email send rates**
2. **Monitor bounce rates**
3. **Set up alerts for failures**
4. **Log email events**

This setup ensures reliable password reset functionality with professional email delivery!

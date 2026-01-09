# MyBizTools Backend - Email API Service

Email backend service for MyBizTools application. Handles sending professional emails with PDF attachments, user registration, email verification, and password reset emails.

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm v6 or higher
- Gmail account (or SendGrid/Mailgun key)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your email credentials
# GMAIL_USER=your@gmail.com
# GMAIL_PASS=your_app_password
```

### Running Locally

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm run build
npm start
```

**Output:**
```
✅ Server running on http://localhost:3001
📧 Email endpoint: POST /api/emails/send
🏥 Health check: GET /health
```

## 📧 Email Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-27T10:30:00.000Z",
  "uptime": 123.45
}
```

### Send Email
```
POST /api/emails/send
```

Form Data:
```
to: recipient@example.com
subject: Email Subject
message: <h1>Email content in HTML</h1>
businessName: Your Company Name (optional)
businessEmail: company@example.com (optional)
invoice: <PDF file> (optional - any file)
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@gmail.com>",
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "timestamp": "2025-12-27T10:30:00.000Z"
}
```

## 🔧 Configuration

### Gmail Setup (Free - Recommended for Development)

1. Go to [Google Account](https://myaccount.google.com)
2. Enable 2-Step Verification
3. Search for "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Update `.env`:
```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
```

### SendGrid Setup (Recommended for Production)

1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Create API key from Settings → API Keys
3. Update `.env`:
```env
SENDGRID_API_KEY=SG_xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Alternative Providers

- **Mailgun**: Update with API key and domain
- **AWS SES**: Configure with access key and secret
- **Others**: Update `server.ts` with provider-specific code

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:3001/health
```

### Test Email Sending
```bash
curl -X POST http://localhost:3001/api/emails/send \
  -F "to=test@example.com" \
  -F "subject=Test Email" \
  -F "message=<p>Hello from MyBizTools!</p>"
```

### Using Postman
1. Create POST request to `http://localhost:3001/api/emails/send`
2. Go to Body → form-data
3. Add fields:
   - `to`: your@email.com
   - `subject`: Test Email
   - `message`: <p>Test</p>
4. Send

## 📁 Project Structure

```
mybiztools-backend/
├── server.ts .................. Main server file
├── package.json ............... Dependencies
├── tsconfig.json .............. TypeScript config
├── .env ....................... Environment variables (NOT in git)
├── .env.example ............... Template for .env
├── .gitignore ................. Git ignore rules
├── README.md .................. This file
├── dist/ ...................... Built JavaScript (generated)
└── node_modules/ .............. Dependencies (generated)
```

## 📦 Dependencies

- **express** - Web framework
- **nodemailer** - Email sending
- **cors** - Cross-origin requests
- **multer** - File upload handling
- **dotenv** - Environment variables
- **typescript** - TypeScript support
- **ts-node** - Run TypeScript directly

## 🔐 Security

### Before Production

- [ ] Use HTTPS (not HTTP)
- [ ] Add rate limiting
- [ ] Validate all email addresses
- [ ] Add authentication to endpoints
- [ ] Use environment variables for credentials
- [ ] Never commit `.env` to git
- [ ] Set up email bounce handling
- [ ] Monitor email delivery logs

### Rate Limiting Example

```bash
npm install express-rate-limit

# Then add to server.ts
import rateLimit from 'express-rate-limit';

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

app.post('/api/emails/send', emailLimiter, async (req, res) => {
  // handler
});
```

## 🚀 Deployment

### Deploy to Railway.app (Free Tier Available)

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

### Deploy to Render

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables in dashboard
6. Deploy

## 📝 Environment Variables

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `GMAIL_USER` | Yes* | - | user@gmail.com |
| `GMAIL_PASS` | Yes* | - | xxxx xxxx xxxx |
| `SENDGRID_API_KEY` | Yes* | - | SG_xxxxx |
| `PORT` | No | 3001 | 3001 |
| `HOST` | No | localhost | 0.0.0.0 |
| `NODE_ENV` | No | development | production |
| `FRONTEND_URL` | No | http://localhost:5173 | https://yourdomain.com |

*Requires at least one email provider

## 🐛 Troubleshooting

### "Authentication failed"
- Check email credentials
- For Gmail: Verify app password (not regular password)
- Check GMAIL_USER format

### "Port 3001 already in use"
- Change PORT in `.env`
- Or kill process: `lsof -ti:3001 | xargs kill -9` (Mac/Linux)

### "CORS error from frontend"
- Verify FRONTEND_URL in `.env` matches your frontend URL
- Default: `http://localhost:5173`

### "Email not arriving"
- Check spam/junk folder
- Verify recipient email is correct
- Check email provider limits

## 📚 Documentation

- **Frontend Guide**: `EMAIL_INTEGRATION_GUIDE.md`
- **Email Templates**: `EMAIL_TEMPLATES_GUIDE.md`
- **SMS Integration**: `TERMII_START_HERE.md`

## 📞 Support

For issues or questions:
1. Check `.env` configuration
2. Run `npm run build` to check for TypeScript errors
3. Check console output for error messages
4. See troubleshooting section above

## 📄 License

Private - MyBizTools Project

## 👨‍💻 Development

### Useful Commands

```bash
# Check for TypeScript errors
npm run build

# Run in development
npm run dev

# View logs
tail -f logs/app.log

# Test specific endpoint
curl http://localhost:3001/health
```

### Code Style

- TypeScript strict mode enabled
- ESLint configuration (add if needed)
- Prettier for formatting (optional)

---

**Created**: December 27, 2025  
**Status**: ✅ Ready for Development  
**Version**: 1.0.0

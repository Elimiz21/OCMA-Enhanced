# 🚀 OCMA Enhanced Platform

**Complete Content Management Automation System with AI-Powered Features**

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The OCMA Enhanced Platform transforms your basic content management system into a world-class marketing automation powerhouse. Generate AI-powered content, manage comprehensive drafts, create stunning visuals, and align everything with your marketing strategy.

## ✨ Key Features

### 🗓️ **Complete Content Calendar**
- **Interactive Scheduling**: Drag-and-drop content planning with multi-platform support
- **Optimal Timing**: AI-suggested best posting times for each platform
- **Bulk Generation**: Create entire week's worth of content from marketing strategy
- **Platform-Specific Optimization**: Content automatically adapted for each social media platform

### 📝 **Advanced Content Drafts Management**
- **Version Control**: Track all edits with complete history and rollback capabilities
- **Quality Scoring**: AI-powered content assessment with improvement suggestions
- **Approval Workflows**: Multi-stage content review and approval processes
- **A/B Testing**: Create and test multiple content variants

### 🎨 **AI-Powered Visual Content Creator**
- **Multi-Style Generation**: Realistic photos, illustrations, cartoons, minimalist designs
- **Video Creation**: Transform scripts into engaging video content with voiceovers
- **Template System**: Pre-built templates with full customization options
- **Brand Guidelines**: Automatic alignment with defined brand colors and style

### 🎯 **Strategy-Based Content Engine**
- **Document Analysis**: Upload and analyze comprehensive marketing strategies
- **Goal Alignment**: Content generation directly tied to strategic objectives
- **Performance Prediction**: AI assessment of content potential based on strategy parameters
- **Content Pillar Distribution**: Ensure proper balance across defined themes

## 🛠️ Technology Stack

### Frontend
- **React 18.2+** with modern hooks and components
- **Ant Design 5.0+** for professional UI components
- **Advanced Libraries**: react-dnd, react-color, fabric, konva for rich interactions
- **Responsive Design** with mobile support

### Backend
- **Express.js** with comprehensive API routing
- **File Management** with secure upload handling via Multer
- **JSON-based Storage** (easily upgradeable to MongoDB/PostgreSQL)
- **CORS & Security** middleware for production readiness

### AI Integration Ready
- **OpenAI API** integration structure for content generation
- **Image/Video Generation** pipeline architecture
- **Strategy Analysis** and content optimization engines

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm 8+ installed
- 10MB+ available disk space

### Automated Setup (Recommended)

**On macOS/Linux:**
```bash
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

### Manual Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/ocma-enhanced.git
   cd ocma-enhanced

   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.template backend/.env
   # Edit backend/.env with your API keys
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Backend (from /backend)
   npm run dev

   # Terminal 2: Frontend (from /frontend)  
   npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
ocma-enhanced/
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── EnhancedContentManagement.jsx
│   │   │   ├── ContentCalendar.jsx
│   │   │   ├── ContentDrafts.jsx
│   │   │   ├── VisualContentCreator.jsx
│   │   │   └── StrategyBasedContentGenerator.jsx
│   │   ├── styles/              # CSS and styling
│   │   └── utils/               # Helper functions
│   ├── package.json
│   └── public/
├── backend/                      # Express.js backend API
│   ├── routes/                  # API route handlers
│   │   ├── content-routes.js    # Content management APIs
│   │   ├── strategy-routes.js   # Strategy analysis APIs
│   │   └── visual-routes.js     # Visual content APIs
│   ├── database/                # Database schema documentation
│   ├── uploads/                 # File upload storage
│   ├── server.js               # Main server file
│   └── package.json
├── setup.sh                     # Automated setup for Unix systems
├── setup.bat                    # Automated setup for Windows
├── .env.template                # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

Copy `.env.template` to `backend/.env` and configure:

```env
# Basic Configuration
NODE_ENV=development
PORT=3001

# AI Services (Optional but recommended)
OPENAI_API_KEY=your-openai-api-key-here

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Security
JWT_SECRET=your-secure-jwt-secret
```

### API Keys Setup

1. **OpenAI API** (for AI content generation)
   - Visit https://platform.openai.com/api-keys
   - Create new API key
   - Add to `OPENAI_API_KEY` in `.env`

2. **AWS S3** (for file storage in production)
   - Create AWS account and S3 bucket
   - Generate access keys with S3 permissions
   - Add credentials to `.env`

## 📖 API Documentation

### Content Management
- `GET /api/content/stats` - Get content statistics
- `GET /api/content/drafts` - List all drafts with filtering
- `POST /api/content/drafts` - Create new draft
- `PUT /api/content/drafts/:id` - Update draft
- `DELETE /api/content/drafts/:id` - Delete draft
- `GET /api/content/calendar` - Get calendar events
- `POST /api/content/calendar` - Create calendar event
- `POST /api/content/bulk-generate` - Generate multiple content pieces

### Strategy Analysis
- `GET /api/strategy/list` - List uploaded strategies
- `POST /api/strategy/upload` - Upload strategy document
- `POST /api/strategy/analyze/:id` - Analyze strategy
- `POST /api/strategy/generate-content` - Generate strategy-aligned content

### Visual Content
- `GET /api/visual/assets` - List visual assets
- `POST /api/visual/generate-image` - Generate AI image
- `POST /api/visual/generate-video` - Generate AI video
- `POST /api/visual/customize-template` - Customize template
- `POST /api/visual/upload` - Upload custom visual

## 🎯 Usage Guide

### 1. Content Calendar Management

**Schedule Single Post:**
1. Click "Schedule Content" in the calendar view
2. Fill in content details, platform, and timing
3. Save to add to calendar
4. Drag and drop to reschedule

**Bulk Content Generation:**
1. Click "Bulk Generate" 
2. Select date range and platforms
3. System generates content based on templates
4. Review and approve generated content

### 2. Draft Management Workflow

**Create and Manage Drafts:**
1. Click "Create Draft" in drafts tab
2. Write content and select platform
3. System calculates quality score automatically
4. Use filters to organize drafts by status
5. Approve/reject drafts through workflow

**Content Regeneration:**
1. Select existing draft
2. Click "Regenerate" for AI variations
3. Compare options and select best version
4. Quality score updates automatically

### 3. Visual Content Creation

**AI Image Generation:**
1. Navigate to Visual Creator tab
2. Enter detailed prompt describing desired image
3. Select style (realistic, illustration, etc.)
4. Choose size appropriate for target platform
5. Generate and download results

**Template Customization:**
1. Browse available templates
2. Select template matching your needs
3. Customize colors, fonts, and text
4. Generate personalized version
5. Use in content or download

### 4. Strategy-Based Content Generation

**Upload and Analyze Strategy:**
1. Upload marketing strategy document (PDF, DOCX, TXT)
2. System analyzes document for key themes
3. Review analysis results and recommendations
4. Approve analysis for content generation

**Generate Aligned Content:**
1. Select analyzed strategy
2. Choose content types and target platforms
3. Set quantity and timeframe preferences
4. Generate content aligned with strategy goals
5. Review and approve generated content

## 🔧 Advanced Configuration

### Database Setup (Production)

For production deployment, replace JSON file storage with MongoDB:

1. **Install MongoDB**
   ```bash
   # MongoDB Atlas (recommended)
   # Create account at https://www.mongodb.com/cloud/atlas
   # Get connection string

   # Or local installation
   brew install mongodb/brew/mongodb-community
   ```

2. **Update Environment**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ocma-enhanced
   ```

### Redis Setup (Caching)

For improved performance with caching:

1. **Install Redis**
   ```bash
   brew install redis
   redis-server
   ```

2. **Configure Environment**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Cloud Storage (Production Files)

Configure AWS S3 for production file storage:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ocma-enhanced-assets
```

## 🚀 Deployment

### Frontend Deployment (Vercel - Recommended)

1. **Connect Repository**
   - Login to Vercel
   - Import GitHub repository
   - Select `frontend` folder as root

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: build
   Root Directory: frontend
   ```

3. **Deploy**
   - Vercel automatically builds and deploys
   - Updates deploy automatically on git push

### Backend Deployment (Vercel/Railway)

1. **Configure Environment**
   - Add all production environment variables
   - Ensure database URLs point to production instances

2. **Deploy**
   ```bash
   # From backend directory
   vercel --prod
   ```

### Full-Stack Production Setup

1. **Database**: MongoDB Atlas or AWS DocumentDB
2. **File Storage**: AWS S3 or Google Cloud Storage
3. **Caching**: Redis Cloud or AWS ElastiCache
4. **Monitoring**: Sentry for error tracking
5. **Analytics**: Google Analytics integration

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

### E2E Testing
```bash
# Install Playwright (optional)
npm install -g @playwright/test
npx playwright test
```

## 📊 Monitoring and Analytics

### Health Checks
- Backend: http://localhost:3001/health
- Frontend: Built-in React development tools

### Performance Monitoring
- Enable Sentry for error tracking
- Use Google Analytics for user behavior
- Monitor API response times

### Logging
- All API requests logged with Morgan
- Error logs stored in `backend/logs/`
- Custom logging with Winston

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Changes** and test thoroughly
4. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open Pull Request**

### Development Guidelines

- **Code Style**: Use ESLint and Prettier configurations
- **Testing**: Write tests for new features
- **Documentation**: Update README for significant changes
- **Commits**: Use conventional commit messages

## 🔒 Security

### Best Practices Implemented

- **Environment Variables**: Sensitive data stored in `.env`
- **Input Validation**: All API inputs validated with express-validator
- **File Upload Security**: Restricted file types and size limits
- **CORS Configuration**: Properly configured for frontend/backend communication
- **Rate Limiting**: API endpoints protected against abuse

### Security Recommendations

1. **Change Default Secrets**: Update JWT secrets in production
2. **Use HTTPS**: Enable SSL/TLS in production
3. **Database Security**: Use connection strings with authentication
4. **Regular Updates**: Keep dependencies updated
5. **Access Control**: Implement user authentication for production

## 🆘 Troubleshooting

### Common Issues

**"Port 3001 already in use"**
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9
# Or use different port
PORT=3002 npm run dev
```

**"Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API requests failing**
- Check backend server is running on port 3001
- Verify CORS configuration in server.js
- Check browser network tab for detailed errors

**File uploads not working**
- Verify `uploads/` directories exist
- Check file permissions
- Ensure multer is properly configured

### Getting Help

1. **Check Logs**: Backend logs in `backend/logs/`
2. **Browser Console**: Check for frontend JavaScript errors
3. **Network Tab**: Monitor API requests and responses
4. **GitHub Issues**: Report bugs with detailed reproduction steps

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the excellent frontend framework
- **Express.js** for the robust backend framework
- **Ant Design** for beautiful UI components
- **OpenAI** for AI capabilities integration
- **All Contributors** who help improve this project

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: Contact the development team for enterprise support

---

**Built with ❤️ by the OCMA Team**

*Transform your content management experience with AI-powered automation and strategic alignment.*
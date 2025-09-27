# 🎨 WebWizard - Smart Image Gallery Platform

A modern, full-stack web application that allows students to upload images with intelligent compression options, while administrators can manage submissions, create assignments, and control image quality settings. Built with React.js, Node.js, and MySQL.

## ✨ Unique Features

### 🖼️ **Smart Image Processing**
- **Dual Quality Options**: Admins can choose between compressed (web-optimized) or original quality images for each assignment
- **Automatic Compression**: Uses Sharp library for intelligent image resizing and optimization
- **Fallback System**: Smart image loading with automatic fallback between compressed and original versions
- **Storage Optimization**: Compressed images reduce storage by up to 70% while maintaining visual quality

### 🎯 **Assignment-Based Uploads**
- **Dynamic Assignments**: Admins can create assignments with specific image quality requirements
- **Student Submissions**: Students upload images for specific assignments with automatic quality processing
- **Due Date Management**: Assignment deadlines with automatic validation
- **Flexible Limits**: Configurable maximum images per assignment

### 🔐 **Role-Based Authentication**
- **Unified Login**: Single login system for both admins and students
- **Smart Redirects**: Automatic routing based on user role
- **Secure Access**: JWT-based authentication with role-based permissions

## 🚀 Key Features

### For Students
- **Drag & Drop Upload**: Intuitive file upload with live preview
- **Assignment Integration**: Upload images for specific assignments
- **Real-time Feedback**: Upload status and approval notifications
- **Modern UI**: Clean, responsive design with smooth animations
- **Pre-filled Forms**: Automatic form population with user details

### For Administrators
- **Comprehensive Dashboard**: Overview, Students, Assignments, and Images management
- **Assignment Creation**: Create assignments with custom image quality settings
- **Bulk Operations**: Approve or reject multiple images at once
- **Student Management**: View and manage student accounts
- **Statistics & Analytics**: Overview of submission metrics and trends
- **Quality Control**: Review all submissions before publication

### Technical Features
- **Modern Tech Stack**: React.js 18, Node.js, Express.js, MySQL
- **Image Processing**: Sharp library for compression and optimization
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Secure Authentication**: JWT-based authentication system
- **File Management**: Intelligent file storage with compression options
- **RESTful API**: Well-structured backend endpoints

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and context
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - File upload component
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Sharp** - Image processing library
- **Multer** - File upload middleware
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd webwizrd
```

### 2. Install Dependencies

#### Option A: Install All Dependencies (Recommended)
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Option B: Individual Installation
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

1. **Create MySQL Database**:
```sql
CREATE DATABASE webwizard_db;
```

2. **Update Database Configuration** in `backend/config.env`:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=webwizard_db
```

### 4. Environment Configuration

Create `backend/config.env` with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=webwizard_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
UPLOAD_PATH=./uploads
```

### 5. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
# Terminal 1: Start Backend Server
cd backend
npm start

# Terminal 2: Start Frontend Development Server
cd frontend
npm start
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves frontend)
cd ../backend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 🎯 Usage Guide

### Student Workflow
1. **Register/Login**: Create account or login with existing credentials
2. **Upload Image**: Visit `/upload` and drag & drop your image
3. **Select Assignment**: Choose from available assignments (optional)
4. **Add Details**: Fill in caption, name, and roll number
5. **Submit**: Image is uploaded and processed based on assignment settings
6. **Wait for Approval**: Admin reviews and approves/rejects
7. **View in Gallery**: Approved images appear in `/gallery`

### Admin Workflow
1. **Login**: Visit `/login` (default: admin/admin123)
2. **Dashboard Overview**: View statistics and recent activity
3. **Create Assignments**: Set up new assignments with quality preferences
4. **Manage Students**: View and manage student accounts
5. **Review Images**: Approve or reject submissions in Images tab
6. **Monitor**: Track approval rates and gallery content

## 📁 Project Structure

```
webwizrd/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration & schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── images.js            # Image management & processing
│   │   ├── admin.js             # Admin-specific routes
│   │   └── assignments.js       # Assignment management
│   ├── uploads/                 # Image storage
│   │   ├── compressed/          # Compressed images
│   │   └── [original images]    # Original quality images
│   ├── config.env               # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation component
│   │   │   └── ImageWithFallback.js # Smart image loading
│   │   ├── contexts/
│   │   │   ├── AuthContext.js   # Authentication context
│   │   │   └── ImageContext.js  # Image management context
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── Upload.js        # Upload form
│   │   │   ├── Gallery.js       # Public gallery
│   │   │   ├── Login.js         # Unified login
│   │   │   ├── Register.js      # User registration
│   │   │   └── AdminDashboard.js # Admin dashboard
│   │   ├── App.js               # Main app component
│   │   ├── index.js             # App entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json                 # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (admin/student)
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Images
- `POST /api/images/upload` - Upload new image with processing
- `GET /api/images` - Get images (with filters)
- `GET /api/images/:id` - Get single image
- `GET /api/images/stats/summary` - Get statistics

### Assignments
- `GET /api/assignments/public` - Get active assignments (public)
- `POST /api/assignments/create` - Create assignment (admin)
- `PUT /api/assignments/:id` - Update assignment (admin)
- `DELETE /api/assignments/:id` - Delete assignment (admin)

### Admin
- `PATCH /api/admin/images/:id/approve` - Approve/reject image
- `PATCH /api/admin/images/bulk` - Bulk approve/reject
- `DELETE /api/admin/images/:id` - Delete image
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get user management data

## 🖼️ Image Processing Features

### Compression Settings
- **Compressed Mode**: 
  - Resizes to max 1200x1200px
  - JPEG quality: 75%
  - Progressive JPEG encoding
  - MozJPEG optimization
  - Reduces file size by 60-80%

- **Original Quality Mode**:
  - Preserves original resolution
  - Maintains original format
  - No compression applied
  - Full quality preservation

### Smart Loading System
- **Fallback Mechanism**: Automatically tries compressed path first, then original
- **Error Handling**: Graceful degradation for missing images
- **Performance**: Faster loading with compressed images
- **Compatibility**: Works with both old and new image formats

## 🎨 Design Features

- **Modern UI**: Clean, card-based design with professional aesthetics
- **Responsive**: Mobile-first approach with TailwindCSS
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and student permission levels
- **Input Validation**: Server-side validation for all inputs
- **File Type Validation**: Only image files allowed
- **Rate Limiting**: Prevent abuse with request limits
- **CORS Protection**: Configured for production
- **Helmet Security**: Security headers middleware
- **Password Hashing**: Bcrypt for secure password storage

## 🚀 Deployment

### Backend Deployment
1. Set up MySQL database
2. Configure environment variables
3. Install dependencies: `npm install`
4. Start server: `npm start`

### Frontend Deployment
1. Build the app: `npm run build`
2. Serve static files from `build/` directory
3. Configure API proxy for production

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=webwizard_db
JWT_SECRET=your-production-jwt-secret
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password
UPLOAD_PATH=./uploads
```

## 🎯 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

*⚠️ Change these credentials in production!*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Sharp** for powerful image processing capabilities
- **TailwindCSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons
- **React Dropzone** for file upload functionality
- **Express.js** community for excellent documentation

## 📞 Support

For support or questions:
- Open an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

## 🌟 What Makes WebWizard Unique?

### 🖼️ **Intelligent Image Management**
Unlike traditional image galleries, WebWizard offers **dual-quality image processing**:
- **Compressed Images**: Perfect for web display, faster loading, reduced storage
- **Original Quality**: Preserved for high-resolution needs and archival purposes
- **Smart Assignment System**: Admins control image quality per assignment
- **Automatic Fallback**: Seamless handling of different image formats

### 🎯 **Assignment-Driven Workflow**
- **Dynamic Assignments**: Create assignments with specific image requirements
- **Quality Control**: Choose compression level per assignment
- **Student Focus**: Streamlined upload process for students
- **Admin Management**: Comprehensive dashboard for content management

### 🚀 **Modern Architecture**
- **Full-Stack React**: Modern frontend with powerful backend
- **Database-Driven**: MySQL for reliable data management
- **API-First**: RESTful endpoints for scalability
- **Security-Focused**: JWT authentication and input validation

---

**Built with ❤️ using modern web technologies**

*WebWizard - Where smart image management meets modern web development*
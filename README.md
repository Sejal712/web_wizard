# Image Gallery with Approval Workflow

A modern, full-stack web application that allows students to upload images with captions and personal details, while administrators can review and approve submissions before they appear in the public gallery.

## 🚀 Features

### For Students
- **Drag & Drop Upload**: Intuitive file upload with live preview
- **Image Details**: Add captions, name, and roll number
- **Real-time Feedback**: Upload status and approval notifications
- **Modern UI**: Clean, responsive design with smooth animations

### For Administrators
- **Admin Dashboard**: Comprehensive management interface
- **Bulk Operations**: Approve or reject multiple images at once
- **Statistics**: Overview of submission metrics
- **Quality Control**: Review all submissions before publication

### Technical Features
- **Modern Tech Stack**: React.js, Node.js, Express.js, MySQL
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Secure Authentication**: JWT-based admin authentication
- **File Management**: Local file storage with validation
- **RESTful API**: Well-structured backend endpoints

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks
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
- **Multer** - File upload middleware
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd image-gallery-approval
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Database Setup
1. Create a MySQL database named `image_gallery`
2. Update the database credentials in `backend/config.env`:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=image_gallery
```

### 4. Environment Configuration
Create `backend/config.env` with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=image_gallery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
UPLOAD_PATH=./uploads
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run server  # Backend only
npm run client  # Frontend only
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 Usage

### Student Workflow
1. **Upload Image**: Visit `/upload` and drag & drop your image
2. **Add Details**: Fill in caption, name, and roll number
3. **Submit**: Image is uploaded and marked as "pending"
4. **Wait for Approval**: Admin reviews and approves/rejects
5. **View in Gallery**: Approved images appear in `/gallery`

### Admin Workflow
1. **Login**: Visit `/admin/login` (default: admin/admin123)
2. **Dashboard**: View pending submissions and statistics
3. **Review**: Approve or reject individual images
4. **Bulk Actions**: Process multiple images at once
5. **Monitor**: Track approval rates and gallery content

## 📁 Project Structure

```
image-gallery-approval/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── images.js            # Image management routes
│   │   └── admin.js              # Admin-specific routes
│   ├── uploads/                 # Image storage directory
│   ├── config.env               # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js        # Navigation component
│   │   ├── contexts/
│   │   │   ├── AuthContext.js   # Authentication context
│   │   │   └── ImageContext.js  # Image management context
│   │   ├── pages/
│   │   │   ├── Home.js          # Landing page
│   │   │   ├── Upload.js         # Upload form
│   │   │   ├── Gallery.js       # Public gallery
│   │   │   ├── AdminLogin.js    # Admin login
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
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Images
- `POST /api/images/upload` - Upload new image
- `GET /api/images` - Get images (with filters)
- `GET /api/images/:id` - Get single image
- `GET /api/images/stats/summary` - Get statistics

### Admin
- `PATCH /api/admin/images/:id/approve` - Approve/reject image
- `PATCH /api/admin/images/bulk` - Bulk approve/reject
- `DELETE /api/admin/images/:id` - Delete image
- `GET /api/admin/dashboard` - Get dashboard data

## 🎨 Design Features

- **Modern UI**: Clean, card-based design inspired by Dribbble
- **Responsive**: Mobile-first approach with TailwindCSS
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **JWT Authentication**: Secure admin login
- **Input Validation**: Server-side validation for all inputs
- **File Type Validation**: Only image files allowed
- **Rate Limiting**: Prevent abuse with request limits
- **CORS Protection**: Configured for production
- **Helmet Security**: Security headers middleware

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
DB_NAME=image_gallery
JWT_SECRET=your-production-jwt-secret
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password
UPLOAD_PATH=./uploads
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TailwindCSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons
- **React Dropzone** for file upload functionality
- **Express.js** community for excellent documentation

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using modern web technologies**

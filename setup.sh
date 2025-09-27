#!/bin/bash

echo "🚀 Setting up Image Gallery with Approval Workflow..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL (v8.0 or higher) first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ All dependencies installed successfully!"

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your MySQL database named 'image_gallery'"
echo "2. Update database credentials in backend/config.env"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "📖 For detailed setup instructions, see README.md"

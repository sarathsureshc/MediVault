# 🚀 Quick Start - Local Development

This guide will help you run MediVault locally on your machine.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for OTP emails)

## Setup Steps

### 1. Environment Configuration

#### Backend Environment (`server/.env`)

```bash
cd server
cp .env.example .env
```

Then edit `server/.env` and fill in your actual values:

- **MONGO_URI**: Get from MongoDB Atlas (create a free cluster)
- **JWT_SECRET**: Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **EMAIL_USER** & **EMAIL_PASS**: Use Gmail App Password (not your regular password)
  - Go to: https://myaccount.google.com/apppasswords
  - Generate an app password for "Mail"

#### Frontend Environment (`client/.env.local`)

```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run Both Servers

You'll need **TWO terminal windows**.

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

✅ Server should start on `http://localhost:5000`

#### Terminal 2 - Frontend Server

```bash
cd client
npm run dev
```

✅ Frontend should start on `http://localhost:3000`

## 📱 Access the Application

Open your browser and navigate to: **http://localhost:3000**

## 🧪 Test the Setup

1. Go to http://localhost:3000
2. Click "Register" to create a new Patient account
3. Fill in the registration form
4. Check your email for the OTP code
5. Enter the OTP to verify your account
6. Login and explore the dashboard

## 🛠️ Troubleshooting

### Backend won't start?

- ✅ Check if `.env` file exists in `server/` folder
- ✅ Verify MongoDB connection string is correct
- ✅ Make sure port 5000 is not already in use

### Frontend can't connect to backend?

- ✅ Make sure backend is running on port 5000
- ✅ Check `NEXT_PUBLIC_API_URL` in `client/.env.local`
- ✅ Look for CORS errors in browser console

### Not receiving OTP emails?

- ✅ Verify you're using Gmail App Password (not regular password)
- ✅ Check spam folder
- ✅ Check backend console logs for email errors

## 🔄 Development Workflow

### Backend Hot Reload

The backend uses `nodemon` - it will automatically restart when you change TypeScript files.

### Frontend Hot Reload

Next.js has built-in Fast Refresh - changes appear instantly in the browser.

### View Logs

- **Backend logs**: Check the terminal running `npm run dev` in server folder
- **Frontend logs**: Check browser console + terminal running `npm run dev` in client folder

## 📝 Available Scripts

### Backend (`server/`)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

### Frontend (`client/`)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## 🎯 Next Steps

Once everything is running:

1. Explore the different user roles (Patient, Doctor, Lab, Pharmacy)
2. Test the appointment booking flow
3. Try uploading medical records
4. Test the QR code sharing feature

Happy coding! 🎉

# MEDIVAULT Deployment Guide

## 1. Backend Deployment (Render)

1.  **Create a New Web Service** on [Render](https://render.com/).
2.  **Connect your GitHub repository**.
3.  **Root Directory**: `server`
4.  **Build Command**: `npm install && npm run build`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    - `NODE_ENV`: `production`
    - `MONGO_URI`: Your MongoDB Atlas connection string.
    - `JWT_SECRET`: A strong secret key.
    - `CORS_ORIGIN`: Your frontend URL (e.g., `https://medivault-client.vercel.app`).
    - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: SMTP details for OTP emails.

## 2. Frontend Deployment (Vercel)

1.  **Import Project** on [Vercel](https://vercel.com/).
2.  **Root Directory**: `client`
3.  **Framework Preset**: Next.js
4.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., `https://medivault-api.onrender.com/api/v1`).

## 3. Database Setup (MongoDB Atlas)

1.  Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a database user and allow access from anywhere (0.0.0.0/0) or whitelist Render IPs.
3.  Get the connection string and use it in the Backend `MONGO_URI`.

## 4. Verification

1.  Open the deployed frontend URL.
2.  Register a new Patient account.
3.  Check your email (or logs if using mock) for OTP.
4.  Verify OTP and login.
5.  Explore the dashboard.

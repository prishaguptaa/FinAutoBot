# Portfolio Recommendation System

This project consists of a Next.js frontend client and a FastAPI backend server for portfolio recommendations.

## Setup Instructions

### Server Setup (Python)

1. Make sure you have Python installed (3.7 or higher)
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install the required dependencies:
   ```
   pip install fastapi uvicorn python-multipart
   ```
4. Run the server:
   ```
   python server.py
   ```
   This will start the server on http://localhost:3000

### Client Setup (Next.js)

1. Make sure you have Node.js installed (14 or higher)
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install the required dependencies:
   ```
   npm install
   # or
   yarn
   ```
4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
   This will start the client on http://localhost:3001

## Features

- User portfolio overview dashboard
- File upload functionality for financial statements
- API integration between Next.js frontend and FastAPI backend

## File Upload Flow

1. Click the "Upload Statement" button on the user overview page
2. Select a file from your device
3. The file will be uploaded to the Python server
4. The server saves the file in the "uploads" directory
5. The server returns a confirmation message

## Technologies Used

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python 
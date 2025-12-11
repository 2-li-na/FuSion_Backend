## Project Overview

FuSion is a comprehensive fitness tracking application designed to motivate students and staff at Hochschule Fulda to be more active in their daily lives. The backend handles user authentication, step data tracking, points calculation, and reward management, while the admin dashboard provides a web interface for managing users, rewards, and content.

**Project Origin**: Developed as part of the university project "Bewegt studieren - Studieren bewegt 2.0" by the General German University Sports Association (adh) and health insurance provider Techniker Krankenkassen.

## Features

### Backend Server
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Step Data Management**: Collects and processes daily step counts from Health Connect
- **Points Calculation**: Automatically calculates weekly points based on daily step averages
- **Reward System**: Manages reward catalog and user redemptions
- **Department Statistics**: Tracks and aggregates data by university departments
- **Profile Management**: Handles user profiles and profile picture uploads
- **Feedback System**: Collects user feedback via email integration
- **Content Management**: Multi-language content (German/English) with rich text support

### Admin Dashboard
- **User Management**: Search, view, edit, and manage all users
- **Points Administration**: View and edit user points, redeem rewards on behalf of users
- **Reward Management**: Create, update, and toggle reward availability
- **Content Management**: Edit app content in German and English using rich text editor
- **Statistics Dashboard**: Overview of users, total steps, and points
- **Department Analytics**: User distribution across departments

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/2-li-na/FuSion_Backend.git
   cd FuSion_Backend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend/` directory:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/fusion2024

   # JWT Secret - CHANGE THIS
   JWT_SECRET=your_super_secret_key_here

   # Mailjet API (for feedback emails)
   MAILJET_API_KEY=your_mailjet_api_key
   MAILJET_SECRET_KEY=your_mailjet_secret_key

   # Email settings (for password reset)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Server
   PORT=3000
   ```

4. **Create admin user**
   ```bash
   node scripts/createAdmin.js
   ```
   Follow the prompts to create an admin account.

5. **Seed rewards (optional)**
   ```bash
   node scripts/seedRewards.js
   ```

6. **Start the server**
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:3000`

### Admin Dashboard Setup

1. **Navigate to dashboard directory**
   ```bash
   cd ../admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API endpoint**
   
   Edit `src/services/api.js` and update the base URL:
   ```javascript
   const API_BASE_URL = 'http://your-server-url:3000/api';
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Dashboard runs on `http://localhost:3001`

5. **Build for production**
   ```bash
   npm run build
   ```

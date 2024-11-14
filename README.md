#Project Title
A real-time location tracking application built with Next.js, Leaflet, and Firebase Realtime Database. This application allows users to view each other’s locations in real-time, with dynamic markers indicating the roles (e.g., customers or vendors).

Here’s a README file for a project using Next.js, Leaflet, and Firebase Realtime Database:

Project Title
A real-time location tracking application built with Next.js, Leaflet, and Firebase Realtime Database. This application allows users to view each other’s locations in real-time, with dynamic markers indicating the roles (e.g., customers or vendors).

# Table of Contents

- Features
- Tech Stack
- Installation
- Usage
- Project Structure
- Environment Variables
- License

# Features

- Real-time location tracking for users with different roles.
- Interactive map using Leaflet, with custom markers for each user.
- Geolocation-based location updates and GPS signal status handling.
- Confirmation dialog to stop tracking when the user closes the app.
- Role-based marker display: shows vendors to customers and vice versa.

# Tech Stack

- Next.js, React framework for building server-side rendered applications.
- Leaflet, JavaScript library for interactive maps.
- Firebase Realtime Database, Provides real-time updates for user location data.
- TypeScript, For type-safe code and better development experience.

# Installation

1.Clone Repository

```bash
git clone https://github.com/riansopian/bakso-app-next.git
cd yourproject
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase Realtime Database by creating a project in Firebase Console, and add a new Web App to get the Firebase configuration values.

4. Add Firebase configuration and environment variables (see below).

# Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
```

# Usage

1. Start the development server:

```bash
npm run dev
```

2. Open http://localhost:3000 to view it in the browser.

3. Users can log in and will be assigned a role (e.g., customer or vendor). The map will show nearby users of the opposite role in real-time.

4. Users can enable location sharing, which will be updated in Firebase, allowing others to see their real-time position.

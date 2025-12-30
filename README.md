# WALT Wallpapers Dashboard

A simple and elegant web application to upload and manage wallpapers using React, Vite, Tailwind CSS, and Firebase.

## Features

- **Google Authentication**: Secure login using Google ID.
- **Wallpaper Upload**: Upload images directly to Firebase Storage.
- **Dashboard**: View and manage your uploaded wallpapers in a beautiful grid layout.
- **Responsive UI**: Built with Tailwind CSS for a great experience on all devices.
- **Real-time Updates**: Uses Firebase Firestore for real-time data synchronization.

## Setup Instructions

1. **Firebase Configuration**:
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** and set up **Google** as a sign-in provider.
   - Create a **Firestore Database** and a **Storage** bucket.
   - Copy your Firebase configuration and paste it into [src/firebase.ts](src/firebase.ts).

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Project**:
   ```bash
   npm run dev
   ```

## Technologies Used

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Backend**: Firebase (Auth, Firestore, Storage)


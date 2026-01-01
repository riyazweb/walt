# WALTPAPER Admin Dashboard

A sophisticated wallpaper management dashboard built with React, Node.js, and Google Cloud Storage.

## 🚀 Features
- **Google Authentication**: Secure login for admins.
- **GCS Integration**: Direct image uploads to Google Cloud Storage via a Node.js proxy.
- **Collection Management**: Organize wallpapers into themed folders/collections.
- **Cloud Run Ready**: Fully dockerized for easy deployment.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- A Google Cloud Project with a Storage Bucket (e.g., `waltbuck1`)
- A Firebase Project (for Authentication and Firestore)

### 2. Environment Configuration

#### Backend (`server/.env`)
Create a `.env` file inside the `server` directory:
```env
PORT=5000
GOOGLE_APPLICATION_CREDENTIALS="../your-service-account-key.json"
```

#### Frontend (`src/firebase.ts`)
Ensure your Firebase configuration is correctly set in `src/firebase.ts`.

### 3. Install Dependencies
From the **root directory**, run:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 4. Run Locally
You can run both the frontend and backend simultaneously using the following command from the **root directory**:
```bash
npm run dev:all
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5000](http://localhost:5000)

---

## ☁️ Deployment to Google Cloud Run

### 1. Push to GitHub
Ensure your code is pushed to your repository:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy via Cloud Run Console
1. Go to [Cloud Run](https://console.cloud.google.com/run).
2. Click **Create Service**.
3. Select **Continuously deploy from a repository**.
4. Choose your GitHub repo and the `main` branch.
5. Set the **Container Port** to `8080`.
6. **Crucial**: In the IAM console, grant the `Storage Object Admin` role to the Cloud Run service account so it can upload images to your bucket.

---

## 📁 Project Structure
- `/src`: React frontend (Vite + Tailwind CSS).
- `/server`: Node.js/Express backend (GCS Proxy).
- `Dockerfile`: Multi-stage build for production.
- `.dockerignore`: Prevents local junk from being uploaded to the cloud.


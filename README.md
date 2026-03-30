# 🎵 Music App Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

A full-stack, locally-hosted music streaming and management application. Built with a modern **Next.js** frontend and a robust **Node.js/Express** backend powered by **SQLite**.

---

## ✨ Features

- **🎧 Audio Streaming:** Seamless music playback directly from your locally hosted server.
- **🔐 Secure Authentication:** Built-in user registration and login using JWT and bcrypt.
- **📁 File Uploads:** Upload your own `.mp3` or audio files reliably using Multer.
- **💾 Local-First Database:** Fast and lightweight storage using `better-sqlite3`.
- **🐳 Dockerized:** One-click deployment using Docker Compose.

---

## 🏗️ Architecture Stack

### Frontend Structure (`/frontend`)
- **Framework:** Next.js 16 (App Router) & React 19
- **Environment:** Connects to the backend via `NEXT_PUBLIC_API_URL`.

### Backend Structure (`/backend`)
- **Server:** Node.js with Express
- **Database:** SQLite (`better-sqlite3`) stored locally in `./db/`
- **File Storage:** Audio uploads are saved locally in `./uploads/`
- **Security:** JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Getting Started

You can run this project either via **Docker** (recommended) or **Manually**.

### Option 1: Using Docker (Recommended)

Make sure you have [Docker](https://www.docker.com/) and Docker Compose installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/PAkash7/music.co.git
   cd music-app
   ```
2. Start the application:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:5001`

*(Note: Database files and audio uploads are automatically persisted using Docker volumes.)*

### Option 2: Running Manually

You'll need `Node.js` installed.

#### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
*The backend will run on `http://localhost:5000` (or the port defined in your `.env`).*

#### 2. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:3000`.*

---

## 📂 Project Structure

```text
music-app/
├── backend/               # Express server & API routes
│   ├── db/                # SQLite database files
│   ├── middleware/        # Authentication & upload configurations
│   ├── routes/            # API endpoints
│   ├── uploads/           # User uploaded audio files
│   ├── server.js          # Main entry point
│   └── package.json
├── frontend/              # Next.js web application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable React UI components
│   ├── context/           # React context for state management
│   ├── lib/               # Utility functions
│   └── package.json
├── docker-compose.yml     # Container orchestration
└── .gitignore             # Root git ignore patterns
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

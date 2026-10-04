# PartyVerse — VR Meeting & Event Platform

PartyVerse is a full-stack virtual meeting and event platform that lets users create and join interactive online spaces. It combines traditional meeting features with immersive 3D/VR experiences, real-time multiplayer interaction, avatars, chat, events, venues, and meeting management.

## ✨ Features

- 🔐 **User Authentication**
  - User registration and login
  - JWT-based authentication
  - Protected application routes

- 🎉 **Event Management**
  - Create and manage events
  - View upcoming and live events
  - Event details and dashboards
  - Host and guest experiences

- 🥽 **3D / VR Meeting Rooms**
  - Interactive 3D environments
  - Avatar-based participation
  - WebXR support
  - Virtual venue exploration
  - Free movement inside rooms

- 👥 **Real-Time Multiplayer**
  - Multiple users can join the same room
  - Real-time player movement
  - Join/leave room events
  - Seat/chair interaction
  - Live room state synchronization

- 💬 **Social Interaction**
  - Real-time chat
  - Emoji reactions
  - Avatar selection
  - Social event experiences
  - AR selfie booth and live-streaming UI components

- 📅 **Formal Meetings**
  - Schedule meetings
  - Meeting calendar
  - Upcoming meetings
  - Meeting rooms
  - Meeting analytics/dashboard

- 🏢 **Virtual Venues**
  - Venue explorer
  - Venue selection and previews
  - 3D venue models

- 📊 **Analytics**
  - Event analytics
  - Meeting analytics
  - Dashboard visualizations

- ☁️ **Cloud Media**
  - Cloudinary integration for uploaded media

---

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Three.js
- React Three Fiber
- React Three Drei
- WebXR
- Socket.IO Client
- Axios
- Framer Motion
- Recharts
- React Big Calendar
- Lucide React
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- Multer
- Cloudinary
- CORS
- Cookie Parser
- Morgan
- dotenv

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) 18+
- npm
- MongoDB or a MongoDB Atlas database
- A Cloudinary account if you want to use media uploads

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd VRMeeting-main
```

---

## 2. Install Frontend Dependencies

```bash
cd partyverse
npm install
```

---

## 3. Configure Frontend Environment Variables

Create a `.env` file inside `partyverse/`:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend uses this value for API requests.

---

## 4. Install Backend Dependencies

Open a new terminal:

```bash
cd partyverse-backend
npm install
```

---

## 5. Configure Backend Environment Variables

Create a `.env` file inside `partyverse-backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Important:** Never commit your real `.env` files, database credentials, JWT secrets, or Cloudinary API secrets to GitHub.

---

## 6. Start the Backend

From `partyverse-backend/`:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## 7. Start the Frontend

In another terminal:

```bash
cd partyverse
npm run dev
```

Open the Vite development URL shown in the terminal, normally:

```text
http://localhost:5173
```

---

## 🔌 API Structure

The backend exposes the following main API groups:

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication and user accounts |
| `/api/events` | Event creation and management |
| `/api/venues` | Virtual venue data |
| `/api/meetings` | Meeting management |
| `/api/rooms` | Room creation and management |
| `/api/health` | Backend health check |

---

## ⚡ Real-Time Socket Features

PartyVerse uses Socket.IO for real-time communication.

The multiplayer server supports events such as:

- `joinRoom`
- `playerMove`
- `takeSeat`
- `standUp`
- `playerJoined`
- `playerMoved`
- `playerLeft`
- `seatUpdate`
- `roomState`

This allows users in the same virtual room to see synchronized player movement and seating states.

---

## 🥽 VR / 3D Experience

The project uses:

- **Three.js** for 3D rendering
- **React Three Fiber** for React-based 3D scenes
- **React Three Drei** for reusable 3D helpers
- **WebXR** for immersive browser-based VR experiences
- `.glb` models for avatars and virtual environments

Supported experiences depend on the browser and device's WebXR capabilities.

---

## 🧩 Main Application Areas

### Social / Party Experience

Designed for informal virtual events and social gatherings with:

- Avatars
- Interactive 3D spaces
- Real-time communication
- Chat
- Emoji reactions
- Virtual venues

### Formal Meeting Experience

Designed for professional meetings with:

- Meeting scheduling
- Calendar
- Upcoming meetings
- Meeting rooms
- Analytics
- Dashboard views

This allows the platform to support both **social events and professional virtual meetings**.

---

## 🔒 Security Notes

For production deployment:

- Store secrets only in environment variables.
- Use a strong `JWT_SECRET`.
- Restrict MongoDB network access.
- Configure CORS for the deployed frontend domain.
- Use HTTPS.
- Do not commit `.env` files.
- Rotate API keys if they are accidentally exposed.
- Configure appropriate Cloudinary upload restrictions.

---

## 📦 Production Build

### Frontend

```bash
cd partyverse
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Backend

```bash
cd partyverse-backend
npm start
```

---

## 🧪 Development

For frontend development:

```bash
npm run dev
```

For backend development with automatic restart:

```bash
npm run dev
```

---

## 🌐 Deployment

The frontend can be deployed to platforms such as:

- Vercel
- Netlify
- Any static hosting platform supporting Vite

The backend can be deployed to platforms supporting Node.js applications.

Before deployment, update:

```env
VITE_API_URL=<production-api-url>
CLIENT_URL=<production-frontend-url>
```

and configure the production MongoDB and Cloudinary credentials.

---

## 📌 Future Improvements

Potential improvements include:

- WebRTC-based voice/video communication
- Screen sharing inside VR rooms
- Persistent room state
- More interactive 3D environments
- Mobile VR improvements
- Advanced moderation controls
- Notifications and reminders
- Improved accessibility
- Automated testing
- Docker-based deployment
- CI/CD pipeline

---

## 📄 License

This project is currently provided for educational and portfolio purposes.

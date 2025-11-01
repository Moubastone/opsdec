# Astrometrics

A modern, self-hosted media server monitoring and statistics platform inspired by Tautulli. Track your Plex, Emby, and Audiobookshelf server activity with real-time monitoring, detailed statistics, and a beautiful dark-themed interface.

![Astrometrics](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)

## Features

- 📊 **Real-time Activity Monitoring** - Track current playback sessions in real-time
- 📈 **Detailed Statistics** - View comprehensive statistics for users and media
- 👥 **User Management** - Monitor individual user activity and watch history
- 📜 **Watch History** - Complete history of all playback sessions
- 🎨 **Tautulli-inspired UI** - Dark, modern interface with smooth animations
- 🔌 **Multi-Server Support** - Supports Plex and Emby (Audiobookshelf coming soon)
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose
- 🚀 **Fast & Lightweight** - Built with React and Express.js
- 💾 **SQLite Database** - Simple, file-based database with no external dependencies

## Tech Stack

### Backend
- Node.js with Express.js
- SQLite3 with better-sqlite3
- WebSocket for real-time updates
- Node-cron for scheduled tasks
- Axios for API calls

### Frontend
- React 18
- Vite for fast development
- TailwindCSS for styling
- Recharts for data visualization
- React Router for navigation
- Lucide React for icons

## Prerequisites

- **For Docker:** Docker and Docker Compose
- **For Manual Install:** Node.js 18.0.0 or higher
- **Media Server:** Plex Media Server and/or Emby Media Server with API access

## Installation

### Option 1: Docker (Recommended)

The easiest way to run Astrometrics is with Docker:

#### Using Docker Compose

1. Create a `docker-compose.yml` file or use the provided one
2. Create a `.env` file with your configuration:

```env
# Plex Configuration (optional)
PLEX_URL=http://your-plex-server:32400
PLEX_TOKEN=your_plex_token

# Emby Configuration (optional)
EMBY_URL=http://your-emby-server:8096
EMBY_API_KEY=your_emby_api_key

# Polling interval (seconds)
POLL_INTERVAL=30
```

3. Start the container:

```bash
docker-compose up -d
```

4. Access at `http://localhost:3001`

#### Using Docker CLI

```bash
docker build -t astrometrics .

docker run -d \
  --name astrometrics \
  -p 3001:3001 \
  -v $(pwd)/data:/app/backend/data \
  -e PLEX_URL=http://your-plex-server:32400 \
  -e PLEX_TOKEN=your_plex_token \
  -e EMBY_URL=http://your-emby-server:8096 \
  -e EMBY_API_KEY=your_emby_api_key \
  astrometrics
```

### Option 2: Manual Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd astrometrics
```

### 2. Install dependencies

```bash
npm install
```

This will install dependencies for both the backend and frontend using npm workspaces.

### 3. Configure the backend

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/astrometrics.db

# Plex Configuration (optional - leave blank if not using)
PLEX_URL=http://localhost:32400
PLEX_TOKEN=your_plex_token_here

# Emby Configuration (optional - leave blank if not using)
EMBY_URL=http://localhost:8096
EMBY_API_KEY=your_emby_api_key_here

# Polling interval in seconds
POLL_INTERVAL=30
```

#### Getting your Plex Token:

1. Sign in to Plex Web App
2. Open any media item
3. Click the three dots (•••) → "Get Info"
4. Click "View XML"
5. In the URL, find `X-Plex-Token=xxxxx` - that's your token

**Alternative method:**
```bash
# Get token via curl (replace username and password)
curl -X POST \
  'https://plex.tv/users/sign_in.xml' \
  -H 'X-Plex-Client-Identifier: astrometrics' \
  -d 'user[login]=your_email' \
  -d 'user[password]=your_password'
```
Look for `<authentication-token>` in the response.

#### Getting your Emby API Key:

1. Log into your Emby server
2. Go to **Settings** → **Advanced** → **API Keys**
3. Click **New API Key**
4. Enter "Astrometrics" as the app name
5. Copy the generated API key

### 4. Start the application

For development (runs both backend and frontend):

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

## Multi-Server Configuration

Astrometrics can monitor multiple media servers simultaneously. You can configure:

- **Plex only** - Set `PLEX_URL` and `PLEX_TOKEN`, leave Emby variables blank
- **Emby only** - Set `EMBY_URL` and `EMBY_API_KEY`, leave Plex variables blank
- **Both Plex and Emby** - Configure all variables

Activity from all configured servers will be aggregated in a single dashboard.

## Production Deployment

### Docker Production (Recommended)

The Docker image is production-ready. Simply set `NODE_ENV=production` in your environment:

```yaml
environment:
  - NODE_ENV=production
```

### Manual Production Build

```bash
# Build the frontend
npm run build

# Set environment to production
export NODE_ENV=production

# Start the backend (will serve built frontend)
npm start
```

The backend automatically serves the frontend in production mode from the `/frontend/dist` directory.

## Project Structure

```
astrometrics/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js          # Database schema and initialization
│   │   ├── routes/
│   │   │   └── api.js           # API endpoints
│   │   ├── services/
│   │   │   ├── emby.js          # Emby API integration
│   │   │   ├── plex.js          # Plex API integration
│   │   │   └── monitor.js       # Activity monitoring service
│   │   └── index.js             # Express server and WebSocket
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx       # Main layout component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Dashboard with stats
│   │   │   ├── Activity.jsx     # Current activity view
│   │   │   ├── History.jsx      # Watch history
│   │   │   ├── Users.jsx        # User list
│   │   │   └── UserDetail.jsx   # Individual user stats
│   │   ├── utils/
│   │   │   ├── api.js           # API client
│   │   │   └── format.js        # Formatting utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

## Features Overview

### Dashboard
- Live activity counter
- Total plays and users statistics
- 30-day play history chart
- Top users by watch time
- Most watched content
- Current streaming sessions

### Current Activity
- Real-time view of active playback sessions
- Progress tracking with visual indicators
- Playback state (playing/paused/buffering)
- User information and timestamps
- Auto-refresh every 3 seconds

### Watch History
- Complete history of all playback sessions
- Filter by user
- Pagination support
- Media thumbnails and metadata
- Completion percentage

### User Statistics
- Individual user profiles
- Total plays and watch time
- Watch distribution by media type
- Recent watches
- Most watched content
- Activity timeline

## API Endpoints

### Activity
- `GET /api/activity` - Get current active sessions

### History
- `GET /api/history` - Get watch history (supports pagination and user filtering)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId/stats` - Get detailed user statistics

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics

### Emby
- `GET /api/emby/test` - Test Emby connection
- `GET /api/emby/libraries` - Get Emby libraries
- `GET /api/media/recent` - Get recently added media

### WebSocket
- `ws://localhost:3001/ws` - Real-time activity updates

## Future Plans

### Audiobookshelf Support
Audiobookshelf integration is planned for a future release. The architecture is designed to support multiple server types, making it easy to add new integrations.

### Additional Features
- [ ] Notifications (Discord, Email, etc.)
- [ ] Custom dashboard widgets
- [ ] Advanced filtering and search
- [ ] Export statistics to CSV/JSON
- [ ] Mobile-responsive design improvements
- [ ] Dark/Light theme toggle
- [ ] User authentication
- [ ] Multi-server support
- [ ] Audiobookshelf integration
- [ ] Jellyfin support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Inspired by [Tautulli](https://tautulli.com/) - the excellent monitoring tool for Plex
- Built with modern web technologies and best practices
- Thanks to the Emby community for their excellent API documentation

## Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include logs from both backend and frontend

## Screenshots

### Dashboard
The main dashboard provides an overview of your media server activity with real-time statistics, charts, and current streaming sessions.

### Current Activity
Monitor live playback sessions with detailed information about what users are watching, playback progress, and streaming state.

### User Statistics
Deep dive into individual user activity with comprehensive statistics, watch patterns, and favorite content.

---

**Happy monitoring!** 🎬📊

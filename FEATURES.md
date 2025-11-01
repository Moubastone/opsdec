# Astrometrics - Feature Overview

## Current Features (v0.1.0)

### 📊 Real-Time Monitoring
- **Live Activity Dashboard** - See who's watching what, right now
- **WebSocket Updates** - Real-time updates without page refresh
- **Session Details** - View playback progress, device info, and streaming quality
- **Multi-User Tracking** - Monitor multiple users simultaneously

### 📈 Statistics & Analytics
- **Dashboard Overview**
  - Total plays and active sessions counter
  - 30-day play history chart
  - Top users by watch time
  - Most watched content
  
- **User Statistics**
  - Individual user profiles
  - Watch time tracking
  - Play counts by media type
  - Recent activity timeline
  - Most watched content per user

- **Watch History**
  - Complete playback history
  - Filterable by user
  - Pagination support
  - Completion percentage tracking

### 🔌 Server Integration

#### Plex Support
- ✅ Active session monitoring
- ✅ User tracking
- ✅ Library access
- ✅ Recently added media
- ✅ Session state (playing/paused/buffering)
- ✅ Progress tracking
- ✅ Metadata retrieval

#### Emby Support
- ✅ Active session monitoring
- ✅ User tracking
- ✅ Library access
- ✅ Recently added media
- ✅ Session state (playing/paused/buffering)
- ✅ Progress tracking
- ✅ Metadata retrieval

#### Multi-Server
- ✅ Monitor Plex and Emby simultaneously
- ✅ Unified dashboard for all servers
- ✅ Aggregated statistics
- ✅ Per-server activity breakdown

### 🎨 User Interface
- **Tautulli-Inspired Design** - Familiar, polished dark theme
- **Responsive Layout** - Works on desktop and tablet
- **Real-Time Updates** - Live activity refresh
- **Interactive Charts** - Visual play history
- **Media Thumbnails** - Poster art and backdrop images
- **Progress Indicators** - Visual playback progress bars

### 🗄️ Data Management
- **SQLite Database** - Lightweight, file-based storage
- **Session Tracking** - Detailed playback sessions
- **Historical Data** - Complete watch history
- **User Profiles** - Cached user information
- **Library Stats** - Media library metadata

### 🐳 Deployment
- **Docker Support** - Production-ready container
- **Docker Compose** - Easy multi-container setup
- **Environment Configuration** - Flexible setup via env vars
- **Volume Persistence** - Data survives container restarts
- **Health Checks** - Built-in container health monitoring

### 🔧 Configuration
- **Flexible Setup** - Configure one or both servers
- **Environment Variables** - Simple configuration
- **Adjustable Polling** - Customize activity check frequency
- **Production Mode** - Optimized for production deployment

## Upcoming Features

### 🎯 Phase 2 (Next Release)
- [ ] **Audiobookshelf Integration** - Monitor audiobook listening
- [ ] **Advanced Filtering** - Filter history by date, media type, etc.
- [ ] **Search Functionality** - Search media and users
- [ ] **Export Data** - CSV/JSON export for statistics
- [ ] **Mobile Responsive** - Improved mobile experience

### 🎯 Phase 3
- [ ] **Notifications** - Discord, Email, Webhook support
- [ ] **User Authentication** - Multi-user dashboard access
- [ ] **Custom Widgets** - Configurable dashboard widgets
- [ ] **Theme Options** - Light mode, custom themes
- [ ] **API Documentation** - Interactive API docs

### 🎯 Phase 4
- [ ] **Jellyfin Support** - Add Jellyfin server support
- [ ] **Performance Metrics** - Server performance tracking
- [ ] **Bandwidth Monitoring** - Track streaming bandwidth
- [ ] **Geolocation** - Track viewing locations
- [ ] **Custom Reports** - Generate custom statistics reports

### 🎯 Future Considerations
- [ ] **Mobile App** - Native iOS/Android app
- [ ] **Newsletter** - Weekly/monthly stats via email
- [ ] **Multi-Language** - i18n support
- [ ] **Plugins System** - Extensible plugin architecture
- [ ] **Advanced Analytics** - ML-based recommendations
- [ ] **Social Features** - Share stats with friends
- [ ] **Parental Controls** - Content monitoring for families

## Feature Comparison

| Feature | Tautulli | Astrometrics |
|---------|----------|--------------|
| Plex Support | ✅ | ✅ |
| Emby Support | ❌ | ✅ |
| Audiobookshelf | ❌ | 🔮 Planned |
| Real-time Monitoring | ✅ | ✅ |
| Watch History | ✅ | ✅ |
| User Statistics | ✅ | ✅ |
| Notifications | ✅ | 🔮 Planned |
| Docker Support | ✅ | ✅ |
| Modern UI | ✅ | ✅ |
| Multi-Server | ❌ | ✅ |
| Open Source | ✅ | ✅ |
| Python-based | ✅ | ❌ (Node.js) |
| React Frontend | ❌ | ✅ |

## Technical Features

### Backend
- RESTful API architecture
- WebSocket real-time communication
- SQLite with WAL mode
- Async/await patterns
- Error handling and logging
- Health check endpoints
- CORS support

### Frontend
- React 18 with hooks
- Client-side routing
- State management
- API client abstraction
- Utility functions for formatting
- Responsive design
- Icon library integration

### DevOps
- Multi-stage Docker builds
- Docker Compose configuration
- Environment-based config
- Production optimization
- Security best practices
- Automated health checks

---

**Note:** This is an active development project. Features marked with 🔮 are planned for future releases.

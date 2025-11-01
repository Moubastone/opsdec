# OpsDec - Quick Start Guide

Get up and running with OpsDec in just a few minutes!

## Prerequisites

- Node.js 18+ installed
- An Emby Media Server with API access

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh

# Edit your Emby credentials
nano backend/.env

# Start the application
npm run dev
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your settings

# 3. Create data directory
mkdir -p backend/data

# 4. Start the application
npm run dev
```

## Getting Your Emby API Key

1. Open your Emby web interface
2. Navigate to: **Dashboard** → **Advanced** → **Security** → **API Keys**
3. Click **New API Key** (the + button)
4. Name: `OpsDec`
5. Copy the generated key
6. Paste it into `backend/.env` as `EMBY_API_KEY`

## Configuration

Edit `backend/.env`:

```env
# Your Emby server URL (include http:// or https://)
EMBY_URL=http://192.168.1.100:8096

# Your Emby API key from the steps above
EMBY_API_KEY=abc123def456...

# How often to check for activity (in seconds)
POLL_INTERVAL=30
```

## Starting the Application

### Development Mode
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend UI: http://localhost:3000

The frontend will automatically proxy API requests to the backend.

### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend
npm start
```

Then configure your web server (Nginx, Apache, etc.) to serve the frontend and proxy API requests.

## Verifying Everything Works

1. Open http://localhost:3000 in your browser
2. You should see the OpsDec dashboard
3. Start playing something on your Emby server
4. Within 30 seconds (or your POLL_INTERVAL), you should see it appear in the "Current Activity" section

## Troubleshooting

### "No Active Streams" showing on dashboard

**Possible causes:**
- Emby server is not configured correctly in `.env`
- No one is currently watching anything
- The POLL_INTERVAL hasn't elapsed yet (wait 30 seconds)

**Solution:**
```bash
# Test your Emby connection
curl http://localhost:3001/api/emby/test
```

You should see:
```json
{
  "success": true,
  "serverName": "Your Server Name",
  "version": "4.x.x"
}
```

### Backend won't start

**Check:**
1. Port 3001 is not in use: `lsof -i :3001`
2. `.env` file exists: `ls -la backend/.env`
3. Dependencies are installed: `npm install`

### Frontend won't load

**Check:**
1. Port 3000 is not in use: `lsof -i :3000`
2. Backend is running on port 3001
3. Try clearing browser cache

### Database errors

**Solution:**
```bash
# Remove and recreate the database
rm -f backend/data/opsdec.db
# Restart the backend - it will recreate the database
npm run dev:backend
```

## Default Credentials

OpsDec doesn't require authentication by default. For production deployments, consider:
- Running behind a reverse proxy with authentication
- Restricting access via firewall rules
- Only exposing on localhost/internal network

## Next Steps

- Explore the **Dashboard** for an overview
- Check **Current Activity** to see live streams
- View **History** for past playback sessions
- Click on **Users** to see individual statistics

## Need Help?

- Check the full [README.md](README.md)
- Review the [API documentation](README.md#api-endpoints)
- Open an issue on GitHub

---

Enjoy tracking your media server! 🎬📊

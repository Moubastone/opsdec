import express from 'express';
import db from '../database/init.js';
import { embyService, audiobookshelfService } from '../services/monitor.js';

const router = express.Router();

// Get current activity
router.get('/activity', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT * FROM sessions
      WHERE state IN ('playing', 'paused', 'buffering')
      ORDER BY started_at DESC
    `).all();

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get watch history
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const userId = req.query.user_id;

    let query = `
      SELECT * FROM history
      ${userId ? 'WHERE user_id = ?' : ''}
      ORDER BY watched_at DESC
      LIMIT ? OFFSET ?
    `;

    const params = userId ? [userId, limit, offset] : [limit, offset];
    const history = db.prepare(query).all(...params);

    const countQuery = userId
      ? db.prepare('SELECT COUNT(*) as total FROM history WHERE user_id = ?').get(userId)
      : db.prepare('SELECT COUNT(*) as total FROM history').get();

    res.json({
      success: true,
      data: history,
      pagination: {
        limit,
        offset,
        total: countQuery.total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT * FROM users
      ORDER BY last_seen DESC
    `).all();

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user stats
router.get('/users/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get play counts by media type
    const mediaTypes = db.prepare(`
      SELECT media_type, COUNT(*) as count
      FROM history
      WHERE user_id = ?
      GROUP BY media_type
    `).all(userId);

    // Get recent watches
    const recentWatches = db.prepare(`
      SELECT * FROM history
      WHERE user_id = ?
      ORDER BY watched_at DESC
      LIMIT 10
    `).all(userId);

    // Get most watched
    const mostWatched = db.prepare(`
      SELECT title, parent_title, media_type, COUNT(*) as plays
      FROM history
      WHERE user_id = ?
      GROUP BY media_id
      ORDER BY plays DESC
      LIMIT 10
    `).all(userId);

    res.json({
      success: true,
      data: {
        user,
        mediaTypes,
        recentWatches,
        mostWatched,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', (req, res) => {
  try {
    const totalPlays = db.prepare('SELECT COUNT(*) as count FROM history').get();
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const totalDuration = db.prepare('SELECT SUM(total_duration) as total FROM users').get();
    const activeSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE state IN ('playing', 'paused')
    `).get();

    // Plays by day (last 30 days)
    const playsByDay = db.prepare(`
      SELECT
        DATE(watched_at, 'unixepoch') as date,
        COUNT(*) as plays
      FROM history
      WHERE watched_at > strftime('%s', 'now', '-30 days')
      GROUP BY date
      ORDER BY date ASC
    `).all();

    // Calculate averages
    const thirtyDayTotal = db.prepare(`
      SELECT COUNT(*) as count FROM history
      WHERE watched_at > strftime('%s', 'now', '-30 days')
    `).get();
    const monthlyAverage = playsByDay.length > 0 ? Math.round(thirtyDayTotal.count / 30) : 0;

    const sevenDayTotal = db.prepare(`
      SELECT COUNT(*) as count FROM history
      WHERE watched_at > strftime('%s', 'now', '-7 days')
    `).get();
    const weeklyAverage = sevenDayTotal.count > 0 ? Math.round(sevenDayTotal.count / 7) : 0;

    const oneDayTotal = db.prepare(`
      SELECT COUNT(*) as count FROM history
      WHERE watched_at > strftime('%s', 'now', '-1 day')
    `).get();
    const dailyAverage = oneDayTotal.count;

    // Average active monthly users (unique users in last 30 days)
    const activeMonthlyUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM history
      WHERE watched_at > strftime('%s', 'now', '-30 days')
    `).get();

    // Peak day of week (0 = Sunday, 6 = Saturday)
    const peakDayResult = db.prepare(`
      SELECT
        CASE CAST(strftime('%w', watched_at, 'unixepoch') AS INTEGER)
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as day_name,
        COUNT(*) as count
      FROM history
      WHERE watched_at > strftime('%s', 'now', '-30 days')
      GROUP BY strftime('%w', watched_at, 'unixepoch')
      ORDER BY count DESC
      LIMIT 1
    `).get();
    const peakDay = peakDayResult ? peakDayResult.day_name : 'N/A';

    // Peak hour (0-23)
    const peakHourResult = db.prepare(`
      SELECT
        strftime('%H', watched_at, 'unixepoch', 'localtime') as hour,
        COUNT(*) as count
      FROM history
      WHERE watched_at > strftime('%s', 'now', '-30 days')
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `).get();
    const peakHour = peakHourResult ? `${parseInt(peakHourResult.hour)}:00` : 'N/A';

    // Top users
    const topUsers = db.prepare(`
      SELECT username, total_plays, total_duration, thumb
      FROM users
      ORDER BY total_plays DESC
      LIMIT 10
    `).all();

    // Most watched media - split by type (based on unique users)
    const mostWatchedMovies = db.prepare(`
      SELECT title, parent_title, media_type, thumb, COUNT(DISTINCT user_id) as plays
      FROM history
      WHERE media_type = 'movie'
      GROUP BY media_id
      ORDER BY plays DESC
      LIMIT 10
    `).all();

    const mostWatchedEpisodes = db.prepare(`
      SELECT
        grandparent_title as title,
        media_type,
        thumb,
        COUNT(DISTINCT user_id) as plays
      FROM history
      WHERE media_type = 'episode' AND grandparent_title IS NOT NULL
      GROUP BY grandparent_title
      ORDER BY plays DESC
      LIMIT 10
    `).all();

    const mostWatchedAudiobooks = db.prepare(`
      SELECT title, parent_title, media_type, thumb, COUNT(DISTINCT user_id) as plays
      FROM history
      WHERE media_type IN ('audiobook', 'track')
      GROUP BY media_id
      ORDER BY plays DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      data: {
        totalPlays: totalPlays.count,
        totalUsers: totalUsers.count,
        totalDuration: totalDuration.total || 0,
        activeSessions: activeSessions.count,
        monthlyAverage,
        weeklyAverage,
        dailyAverage,
        activeMonthlyUsers: activeMonthlyUsers.count,
        peakDay,
        peakHour,
        playsByDay,
        topUsers,
        mostWatchedMovies,
        mostWatchedEpisodes,
        mostWatchedAudiobooks,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recently added media (if Emby is configured)
router.get('/media/recent', async (req, res) => {
  try {
    if (!embyService) {
      return res.status(503).json({
        success: false,
        error: 'Emby service not configured',
      });
    }

    const limit = parseInt(req.query.limit || '20', 10);
    const recent = await embyService.getRecentlyAdded(limit);

    res.json({ success: true, data: recent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Emby connection
router.get('/emby/test', async (req, res) => {
  try {
    if (!embyService) {
      return res.status(503).json({
        success: false,
        error: 'Emby service not configured',
      });
    }

    const result = await embyService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Emby libraries
router.get('/emby/libraries', async (req, res) => {
  try {
    if (!embyService) {
      return res.status(503).json({
        success: false,
        error: 'Emby service not configured',
      });
    }

    const libraries = await embyService.getLibraries();
    res.json({ success: true, data: libraries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Audiobookshelf connection
router.get('/audiobookshelf/test', async (req, res) => {
  try {
    if (!audiobookshelfService) {
      return res.status(503).json({
        success: false,
        error: 'Audiobookshelf service not configured',
      });
    }

    const result = await audiobookshelfService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Audiobookshelf libraries
router.get('/audiobookshelf/libraries', async (req, res) => {
  try {
    if (!audiobookshelfService) {
      return res.status(503).json({
        success: false,
        error: 'Audiobookshelf service not configured',
      });
    }

    const libraries = await audiobookshelfService.getLibraries();
    res.json({ success: true, data: libraries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

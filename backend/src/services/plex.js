import axios from 'axios';

class PlexService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Plex-Token': this.token,
        'Accept': 'application/json',
      },
    });
  }

  async testConnection() {
    try {
      const response = await this.client.get('/');
      return {
        success: true,
        serverName: response.data.MediaContainer.friendlyName,
        version: response.data.MediaContainer.version,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSessions() {
    try {
      const response = await this.client.get('/status/sessions');
      return response.data.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching Plex sessions:', error.message);
      return [];
    }
  }

  async getUsers() {
    try {
      const response = await this.client.get('/accounts');
      const users = response.data.MediaContainer.Account || [];
      return users.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        thumb: user.thumb,
      }));
    } catch (error) {
      console.error('Error fetching Plex users:', error.message);
      // Fallback: get users from library sections
      try {
        const homeUsers = await this.client.get('/api/home/users');
        return (homeUsers.data.MediaContainer.User || []).map(user => ({
          id: user.id.toString(),
          name: user.title || user.username,
          email: user.email,
          thumb: user.thumb,
        }));
      } catch (fallbackError) {
        console.error('Error fetching Plex home users:', fallbackError.message);
        return [];
      }
    }
  }

  async getLibraries() {
    try {
      const response = await this.client.get('/library/sections');
      const sections = response.data.MediaContainer.Directory || [];
      return sections.map(lib => ({
        id: lib.key,
        name: lib.title,
        type: lib.type,
        itemCount: lib.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching Plex libraries:', error.message);
      return [];
    }
  }

  parseSessionToActivity(session) {
    try {
      const user = session.User;
      const player = session.Player || {};
      const playState = player.state || 'unknown';

      // Determine media type
      let mediaType = session.type.toLowerCase();
      if (mediaType === 'movie') {
        mediaType = 'movie';
      } else if (mediaType === 'episode') {
        mediaType = 'episode';
      } else if (mediaType === 'track') {
        mediaType = 'track';
      }

      // Get transcode/media info
      const transcodeSession = session.TranscodeSession || {};
      const media = session.Media?.[0] || {};
      const videoStream = media.Part?.[0]?.Stream?.find(s => s.streamType === 1); // 1 = video
      const audioStream = media.Part?.[0]?.Stream?.find(s => s.streamType === 2); // 2 = audio

      // Calculate bitrate
      const bitrate = media.bitrate ? (media.bitrate / 1000).toFixed(2) : null; // Convert to Mbps

      // Build activity object
      return {
        sessionKey: session.Session?.id || session.sessionKey || Math.random().toString(36),
        userId: user?.id?.toString() || 'unknown',
        username: user?.title || 'Unknown User',
        userThumb: user?.thumb || null,
        mediaType,
        mediaId: session.ratingKey,
        title: session.title,
        parentTitle: session.grandparentTitle || session.parentTitle || null,
        grandparentTitle: session.grandparentTitle || null,
        seasonNumber: session.parentIndex || null,
        episodeNumber: session.index || null,
        year: session.year,
        // For episodes, use grandparent (series) thumb; for movies use the movie thumb
        thumb: mediaType === 'episode' && session.grandparentThumb
          ? `${this.baseUrl}${session.grandparentThumb}?X-Plex-Token=${this.token}`
          : session.thumb
          ? `${this.baseUrl}${session.thumb}?X-Plex-Token=${this.token}`
          : null,
        art: session.art ? `${this.baseUrl}${session.art}?X-Plex-Token=${this.token}` : null,
        state: playState === 'paused' ? 'paused' : playState === 'buffering' ? 'buffering' : 'playing',
        progressPercent: session.viewOffset && session.duration
          ? Math.round((session.viewOffset / session.duration) * 100)
          : 0,
        duration: session.duration ? Math.round(session.duration / 1000) : null, // Convert to seconds
        currentTime: session.viewOffset ? Math.round(session.viewOffset / 1000) : 0,
        clientName: player.title || 'Unknown Client',
        deviceName: player.device || 'Unknown Device',
        platform: player.platform || 'Unknown Platform',
        // Bandwidth/Stream info
        bitrate: bitrate,
        transcoding: transcodeSession.videoDecision === 'transcode' || transcodeSession.audioDecision === 'transcode',
        videoCodec: videoStream?.codec || transcodeSession.videoCodec || null,
        audioCodec: audioStream?.codec || transcodeSession.audioCodec || null,
        container: media.container || null,
        resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : null,
      };
    } catch (error) {
      console.error('Error parsing Plex session:', error);
      return null;
    }
  }

  async getActiveStreams() {
    const sessions = await this.getSessions();
    const activeStreams = [];

    for (const session of sessions) {
      const activity = this.parseSessionToActivity(session);
      if (activity) {
        activeStreams.push(activity);
      }
    }

    return activeStreams;
  }

  async getRecentlyAdded(limit = 20) {
    try {
      const response = await this.client.get('/library/recentlyAdded', {
        params: {
          'X-Plex-Container-Start': 0,
          'X-Plex-Container-Size': limit,
        },
      });

      const items = response.data.MediaContainer.Metadata || [];
      return items.map(item => ({
        id: item.ratingKey,
        name: item.title,
        type: item.type,
        year: item.year,
        seriesName: item.grandparentTitle,
        addedAt: item.addedAt ? new Date(item.addedAt * 1000).toISOString() : null,
        thumb: item.thumb ? `${this.baseUrl}${item.thumb}?X-Plex-Token=${this.token}` : null,
      }));
    } catch (error) {
      console.error('Error fetching recently added:', error.message);
      return [];
    }
  }

  async getHistory(limit = 50) {
    try {
      const response = await this.client.get('/status/sessions/history/all', {
        params: {
          sort: 'viewedAt:desc',
          'X-Plex-Container-Start': 0,
          'X-Plex-Container-Size': limit,
        },
      });

      const items = response.data.MediaContainer.Metadata || [];
      return items.map(item => ({
        id: item.historyKey,
        mediaId: item.ratingKey,
        title: item.title,
        parentTitle: item.grandparentTitle || item.parentTitle,
        type: item.type,
        viewedAt: item.viewedAt,
        accountId: item.accountID,
      }));
    } catch (error) {
      console.error('Error fetching Plex history:', error.message);
      return [];
    }
  }
}

export default PlexService;

import axios from 'axios';

class EmbyService {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Emby-Token': this.apiKey,
      },
    });
  }

  async testConnection() {
    try {
      const response = await this.client.get('/System/Info');
      return {
        success: true,
        serverName: response.data.ServerName,
        version: response.data.Version,
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
      const response = await this.client.get('/Sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching Emby sessions:', error.message);
      return [];
    }
  }

  async getUsers() {
    try {
      const response = await this.client.get('/Users');
      return response.data.map(user => ({
        id: user.Id,
        name: user.Name,
        lastActivityDate: user.LastActivityDate,
        lastLoginDate: user.LastLoginDate,
        hasPassword: user.HasPassword,
        hasConfiguredPassword: user.HasConfiguredPassword,
        hasConfiguredEasyPassword: user.HasConfiguredEasyPassword,
        enableAutoLogin: user.EnableAutoLogin,
        policy: user.Policy,
      }));
    } catch (error) {
      console.error('Error fetching Emby users:', error.message);
      return [];
    }
  }

  async getLibraries() {
    try {
      const response = await this.client.get('/Library/MediaFolders');
      return response.data.Items.map(lib => ({
        id: lib.Id,
        name: lib.Name,
        type: lib.CollectionType,
        itemCount: lib.ChildCount,
      }));
    } catch (error) {
      console.error('Error fetching Emby libraries:', error.message);
      return [];
    }
  }

  async getItem(itemId) {
    try {
      const response = await this.client.get(`/Users/${await this.getFirstUserId()}/Items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error.message);
      return null;
    }
  }

  async getFirstUserId() {
    const users = await this.getUsers();
    return users.length > 0 ? users[0].id : null;
  }

  parseSessionToActivity(session) {
    if (!session.NowPlayingItem) {
      return null;
    }

    const item = session.NowPlayingItem;
    const playState = session.PlayState || {};
    const transcodeInfo = session.TranscodingInfo || {};

    // Calculate bitrate (in Mbps)
    const transcodeBitrate = transcodeInfo.Bitrate ? (transcodeInfo.Bitrate / 1000000).toFixed(2) : null;

    // Get stream info
    const videoStream = item.MediaStreams?.find(s => s.Type === 'Video');
    const audioStream = item.MediaStreams?.find(s => s.Type === 'Audio');

    // Get bitrate from media source if transcoding info doesn't have it
    const mediaBitrate = item.MediaSources?.[0]?.Bitrate ? (item.MediaSources[0].Bitrate / 1000000).toFixed(2) : null;

    // Try video stream bitrate if others aren't available
    const streamBitrate = videoStream?.BitRate ? (videoStream.BitRate / 1000000).toFixed(2) : null;

    const finalBitrate = transcodeBitrate || mediaBitrate || streamBitrate;

    return {
      sessionKey: session.Id,
      userId: session.UserId,
      username: session.UserName,
      userThumb: session.UserPrimaryImageTag ? `${this.baseUrl}/Users/${session.UserId}/Images/Primary?api_key=${this.apiKey}` : null,
      mediaType: item.Type.toLowerCase(),
      mediaId: item.Id,
      title: item.Name,
      parentTitle: item.SeriesName || null,
      grandparentTitle: item.SeriesName || null,
      seasonNumber: item.ParentIndexNumber || null,
      episodeNumber: item.IndexNumber || null,
      year: item.ProductionYear,
      // For episodes, use the series poster; for movies use the movie poster
      thumb: item.Type.toLowerCase() === 'episode' && (item.SeriesId || item.SeriesPrimaryImageTag)
        ? `${this.baseUrl}/Items/${item.SeriesId || item.ParentId}/Images/Primary?api_key=${this.apiKey}`
        : item.ImageTags?.Primary
        ? `${this.baseUrl}/Items/${item.Id}/Images/Primary?api_key=${this.apiKey}`
        : null,
      art: item.ParentBackdropImageTags?.[0] ? `${this.baseUrl}/Items/${item.ParentBackdropItemId}/Images/Backdrop?api_key=${this.apiKey}` : null,
      state: playState.IsPaused ? 'paused' : 'playing',
      progressPercent: playState.PositionTicks && item.RunTimeTicks
        ? Math.round((playState.PositionTicks / item.RunTimeTicks) * 100)
        : 0,
      duration: item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000000) : null, // Convert to seconds
      currentTime: playState.PositionTicks ? Math.round(playState.PositionTicks / 10000000) : 0,
      clientName: session.Client,
      deviceName: session.DeviceName,
      platform: session.Client,
      // Bandwidth/Stream info
      bitrate: finalBitrate,
      transcoding: transcodeInfo.IsVideoDirect === false || transcodeInfo.IsAudioDirect === false,
      videoCodec: videoStream?.Codec || transcodeInfo.VideoCodec || null,
      audioCodec: audioStream?.Codec || transcodeInfo.AudioCodec || null,
      container: item.Container || null,
      resolution: videoStream ? `${videoStream.Width}x${videoStream.Height}` : null,
    };
  }

  async getActiveStreams() {
    const sessions = await this.getSessions();
    const activeStreams = [];

    for (const session of sessions) {
      if (session.NowPlayingItem) {
        const activity = this.parseSessionToActivity(session);
        if (activity) {
          activeStreams.push(activity);
        }
      }
    }

    return activeStreams;
  }

  async getRecentlyAdded(limit = 20) {
    try {
      const userId = await this.getFirstUserId();
      if (!userId) return [];

      const response = await this.client.get('/Users/' + userId + '/Items/Latest', {
        params: {
          Limit: limit,
          Fields: 'BasicSyncInfo,Path,ProductionYear',
          IncludeItemTypes: 'Movie,Episode',
        },
      });

      return response.data.map(item => ({
        id: item.Id,
        name: item.Name,
        type: item.Type,
        year: item.ProductionYear,
        seriesName: item.SeriesName,
        addedAt: item.DateCreated,
        thumb: item.ImageTags?.Primary ? `${this.baseUrl}/Items/${item.Id}/Images/Primary?api_key=${this.apiKey}` : null,
      }));
    } catch (error) {
      console.error('Error fetching recently added:', error.message);
      return [];
    }
  }
}

export default EmbyService;

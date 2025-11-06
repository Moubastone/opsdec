import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserStats } from '../utils/api';
import { formatTimeAgo, formatDuration } from '../utils/format';
import { ArrowLeft, Film, Tv, Headphones, Music, Book, Server, Clock, Play, Activity, Link2, MapPin } from 'lucide-react';

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    try {
      const response = await getUserStats(userId);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  const getMediaIcon = (type) => {
    switch (type) {
      case 'movie': return <Film className="w-5 h-5" />;
      case 'episode': return <Tv className="w-5 h-5" />;
      case 'track': return <Music className="w-5 h-5" />;
      case 'audiobook': return <Book className="w-5 h-5" />;
      default: return <Headphones className="w-5 h-5" />;
    }
  };

  const getServerIcon = (serverType) => {
    switch (serverType) {
      case 'emby':
        return <img src="/logos/emby.svg" alt="Emby" className="w-5 h-5" title="Emby" />;
      case 'plex':
        return <img src="/logos/plex.svg" alt="Plex" className="w-5 h-5" title="Plex" />;
      case 'audiobookshelf':
        return <img src="/logos/audiobookshelf.svg" alt="Audiobookshelf" className="w-5 h-5" title="Audiobookshelf" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">User Details</h1>
      </div>

      {/* User Profile Card */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {stats.user.thumb ? (
                <img
                  src={`/proxy/image?url=${encodeURIComponent(stats.user.thumb)}`}
                  alt={stats.user.username}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                  {stats.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{stats.user.username}</h2>
              {stats.user.email && (
                <p className="text-gray-400 mb-3">{stats.user.email}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {stats.user.is_admin === 1 && (
                  <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium border border-primary-500/30">
                    Admin
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stats.user.history_enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                  History {stats.user.history_enabled ? 'Enabled' : 'Disabled'}
                </span>
                {stats.user.is_mapped && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3" />
                    Mapped User ({stats.user.mapped_servers} servers)
                  </span>
                )}
                {stats.user.server_types && stats.user.server_types.map((serverType, index) => (
                  <span key={index} className="px-3 py-1 bg-dark-700 rounded-full text-xs font-medium border border-dark-600 flex items-center gap-1.5">
                    {getServerIcon(serverType)}
                    <span className="capitalize">{serverType}</span>
                  </span>
                ))}
              </div>

              {/* Mapped Accounts */}
              {stats.user.is_mapped && stats.user.mapped_usernames && stats.user.mapped_usernames.length > 0 && (
                <div className="mt-4 p-4 bg-dark-700/30 rounded-lg border border-dark-600">
                  <div className="text-sm font-medium text-gray-300 mb-3">Mapped Accounts</div>
                  <div className="space-y-2">
                    {stats.user.mapped_usernames.map((account, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-md border border-dark-600">
                          {getServerIcon(account.server_type)}
                          <span className="text-gray-300">{account.username}</span>
                          <span className="text-gray-500">on</span>
                          <span className="text-gray-400 capitalize">{account.server_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Seen */}
              {stats.user.last_seen && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Last seen {formatTimeAgo(stats.user.last_seen)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="text-sm text-gray-400 mb-1">Total Plays</div>
          <div className="text-3xl font-bold text-white">{stats.user.total_plays || 0}</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="text-sm text-gray-400 mb-1">Total Time</div>
          <div className="text-3xl font-bold text-primary-400">{formatDuration(stats.user.total_duration || 0)}</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="text-sm text-gray-400 mb-1">Watch Time</div>
          <div className="text-3xl font-bold text-white">{formatDuration(stats.user.watch_duration || 0)}</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
          <div className="text-sm text-gray-400 mb-1">Listen Time</div>
          <div className="text-3xl font-bold text-white">{formatDuration(stats.user.listen_duration || 0)}</div>
        </div>
      </div>

      {/* Media Type Breakdown */}
      {stats.mediaTypes && stats.mediaTypes.length > 0 && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700">
            <h3 className="text-lg font-semibold text-white">Media Type Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.mediaTypes.map((item) => (
                <div key={item.media_type} className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                      {getMediaIcon(item.media_type)}
                    </div>
                    <span className="text-sm font-medium text-gray-300 capitalize">{item.media_type}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-white">{item.count} <span className="text-sm font-normal text-gray-400">plays</span></div>
                    <div className="text-sm text-gray-400">{formatDuration(item.total_duration || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Server Usage (if multiple servers) */}
      {stats.serverBreakdown && stats.serverBreakdown.length > 1 && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700">
            <h3 className="text-lg font-semibold text-white">Server Usage</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.serverBreakdown.map((server) => (
                <div key={server.server_type} className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
                  <div className="flex items-center gap-2 mb-3">
                    {getServerIcon(server.server_type)}
                    <span className="text-sm font-medium text-gray-300 capitalize">{server.server_type}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white">{server.count} <span className="text-sm font-normal text-gray-400">plays</span></div>
                    <div className="text-sm text-gray-400">{formatDuration(server.total_duration || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentWatches && stats.recentWatches.length > 0 && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-dark-700">
            {stats.recentWatches.map((watch, index) => (
              <div key={index} className="p-4 hover:bg-dark-700/30 transition-colors">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {watch.thumb ? (
                      <div className="relative overflow-hidden rounded">
                        <img
                          src={`/proxy/image?url=${encodeURIComponent(watch.thumb)}`}
                          alt={watch.title}
                          className="w-14 h-20 object-cover"
                        />
                        <div className="absolute bottom-1 right-1 p-0.5 bg-black/80 rounded">
                          {getMediaIcon(watch.media_type)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-20 bg-dark-600 rounded flex items-center justify-center text-gray-500">
                        {getMediaIcon(watch.media_type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{watch.title}</h4>
                    {watch.parent_title && (
                      <p className="text-xs text-gray-400 truncate">{watch.parent_title}</p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(watch.watched_at)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{watch.media_type}</span>
                      {watch.city && watch.region && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {watch.city}, {watch.region}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{watch.percent_complete}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                          style={{ width: `${watch.percent_complete}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetails;

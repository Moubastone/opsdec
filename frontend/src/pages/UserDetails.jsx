import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserStats } from '../utils/api';
import { formatTimeAgo, formatDuration } from '../utils/format';
import { ArrowLeft, Film, Tv, Headphones, Music, Book, Server } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center gap-4">
          {stats.user.thumb ? (
            <img
              src={`/proxy/image?url=${encodeURIComponent(stats.user.thumb)}`}
              alt={stats.user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : stats.user.server_type ? (
            <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center">
              <Server className="w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
              {stats.user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{stats.user.username}</h1>
            {stats.user.email && (
              <p className="text-gray-400">{stats.user.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Total Plays</p>
          <p className="text-2xl font-bold text-white">{stats.user.total_plays || 0}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Total Duration</p>
          <p className="text-2xl font-bold text-white">{formatDuration(stats.user.total_duration || 0)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Last Seen</p>
          <p className="text-2xl font-bold text-white">
            {stats.user.last_seen ? formatTimeAgo(stats.user.last_seen * 1000) : 'Never'}
          </p>
        </div>
        <div className="bg-dark-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">History Tracking</p>
          <p className="text-2xl font-bold text-white">
            {stats.user.history_enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Activity by Type */}
      {stats.mediaTypes && stats.mediaTypes.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Activity by Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.mediaTypes.map((item) => (
              <div key={item.media_type} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-primary-400">
                    {getMediaIcon(item.media_type)}
                  </div>
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {item.media_type}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{item.count}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDuration(item.total_duration)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Watched & Listened */}
      {stats.mostWatched && stats.mostWatched.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Most Watched & Listened</h2>
          <div className="bg-dark-700 rounded-lg overflow-hidden max-w-4xl">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-dark-600">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-400" style={{width: '56px'}}></th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Title</th>
                  <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-400" style={{width: '90px'}}>Type</th>
                  <th className="px-2 py-1.5 text-right text-xs font-semibold text-gray-400" style={{width: '60px'}}>Plays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {stats.mostWatched.map((item, index) => (
                  <tr key={index} className="hover:bg-dark-600/50">
                    <td className="px-2 py-1.5">
                      {item.thumb ? (
                        <img
                          src={`/proxy/image?url=${encodeURIComponent(item.thumb)}`}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-dark-600 rounded flex items-center justify-center">
                          {item.media_type === 'movie' && <Film className="w-5 h-5 text-gray-500" />}
                          {item.media_type === 'episode' && <Tv className="w-5 h-5 text-gray-500" />}
                          {item.media_type === 'track' && <Music className="w-5 h-5 text-gray-500" />}
                          {item.media_type === 'audiobook' && <Book className="w-5 h-5 text-gray-500" />}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-sm text-gray-200 truncate">
                      {item.parent_title ? (
                        <div>
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-gray-400 truncate">{item.parent_title}</div>
                        </div>
                      ) : (
                        <div className="font-medium truncate">{item.title}</div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-sm text-gray-400 capitalize truncate">{item.media_type}</td>
                    <td className="px-2 py-1.5 text-sm text-gray-200 text-right font-medium">{item.plays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server Breakdown */}
      {stats.serverBreakdown && stats.serverBreakdown.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Server Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.serverBreakdown.map((server) => (
              <div key={server.server_type} className="bg-dark-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-300 capitalize mb-2">{server.server_type}</p>
                <p className="text-2xl font-bold text-white mb-1">{server.count} plays</p>
                <p className="text-xs text-gray-400">{formatDuration(server.total_duration)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentWatches && stats.recentWatches.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentWatches.map((watch, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4 flex items-center gap-4">
                {watch.thumb ? (
                  <img
                    src={`/proxy/image?url=${encodeURIComponent(watch.thumb)}`}
                    alt={watch.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-20 bg-dark-600 rounded flex items-center justify-center">
                    {getMediaIcon(watch.media_type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{watch.title}</h3>
                  {watch.parent_title && (
                    <p className="text-xs text-gray-400 truncate">{watch.parent_title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(watch.watched_at * 1000)} • {watch.percent_complete}% complete
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 capitalize">{watch.media_type}</span>
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

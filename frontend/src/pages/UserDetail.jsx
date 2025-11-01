import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserStats } from '../utils/api';
import { formatTimeAgo, formatDuration, formatTimestamp, formatMediaType } from '../utils/format';
import { ArrowLeft, PlayCircle, TrendingUp } from 'lucide-react';

function UserDetail() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [userId]);

  const loadUserStats = async () => {
    try {
      const response = await getUserStats(userId);
      setData(response.data.data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading user stats...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">User not found</div>
      </div>
    );
  }

  const { user, mediaTypes, recentWatches, mostWatched } = data;

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div>
        <Link to="/users" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{user.username}</h2>
            <p className="text-gray-400 mt-1">
              Member since {formatTimestamp(user.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-label">Total Plays</div>
          <div className="stat-value">{user.total_plays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Watch Time</div>
          <div className="stat-value">{formatDuration(user.total_duration)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Active</div>
          <div className="stat-value text-2xl">{formatTimeAgo(user.last_seen)}</div>
        </div>
      </div>

      {/* Media Types */}
      {mediaTypes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Watch Distribution</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {mediaTypes.map((type) => {
                const percentage = (type.count / user.total_plays) * 100;
                return (
                  <div key={type.media_type}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 capitalize">{formatMediaType(type.media_type)}</span>
                      <span className="text-gray-400">{type.count} plays ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-dark-600 rounded-full h-3">
                      <div
                        className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Watches */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Watches</h3>
          </div>
          <div className="card-body">
            {recentWatches.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No recent activity</div>
            ) : (
              <div className="space-y-3">
                {recentWatches.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.thumb ? (
                        <img
                          src={item.thumb}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-dark-600 rounded flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{item.title}</div>
                      {item.parent_title && (
                        <div className="text-sm text-gray-400 truncate">{item.parent_title}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(item.watched_at)}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-400">
                      {item.percent_complete}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Watched */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Most Watched</h3>
          </div>
          <div className="card-body">
            {mostWatched.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No watch history</div>
            ) : (
              <div className="space-y-3">
                {mostWatched.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        {item.parent_title && (
                          <div className="text-sm text-gray-400 truncate">{item.parent_title}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <TrendingUp className="w-4 h-4 text-primary-400" />
                      <span className="text-primary-400 font-semibold">{item.plays}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../utils/api';
import { formatTimeAgo, formatDuration } from '../utils/format';
import { Users as UsersIcon, ChevronRight } from 'lucide-react';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {users.length > 0 && (
        <div className="text-sm text-gray-400 mb-2">
          {users.length} total users
        </div>
      )}

      {users.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Users</h3>
            <p className="text-gray-500">No user data available</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Link key={user.id} to={`/users/${user.id}`}>
              <div className="card hover:border-primary-500 transition-colors cursor-pointer h-full">
                <div className="card-body">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{user.username}</h3>
                      {user.is_admin ? (
                        <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Plays</span>
                      <span className="text-white font-semibold">{user.total_plays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Watch Time</span>
                      <span className="text-white font-semibold">
                        {formatDuration(user.total_duration)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Seen</span>
                      <span className="text-white font-semibold">
                        {formatTimeAgo(user.last_seen)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;

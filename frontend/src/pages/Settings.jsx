import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, RefreshCw, Check, X, Server, AlertCircle, Film, Tv, Headphones, Globe } from 'lucide-react';
import api, { getSettings, updateSetting } from '../utils/api';
import { useTimezone } from '../contexts/TimezoneContext';

export default function Settings() {
  const { timezone: currentTimezone, setTimezone: updateTimezone } = useTimezone();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [serverVersions, setServerVersions] = useState({});
  const [editingServer, setEditingServer] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settings, setSettings] = useState({ timezone: 'UTC' });
  const [savingSettings, setSavingSettings] = useState(false);

  const [formData, setFormData] = useState({
    type: 'emby',
    name: '',
    url: '',
    api_key: '',
    enabled: true
  });

  useEffect(() => {
    loadServers();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Silently fetch version info when page loads
  useEffect(() => {
    const fetchVersions = async () => {
      if (servers.length > 0) {
        for (const server of servers) {
          try {
            const response = await api.post(`/servers/${server.id}/test`);

            if (response.data.success && response.data.data && response.data.data.version) {
              setServerVersions(prev => ({
                ...prev,
                [server.id]: response.data.data.version
              }));
            }
          } catch (error) {
            console.error(`Failed to fetch version for ${server.id}:`, error);
          }
        }
      }
    };

    fetchVersions();
  }, [servers.length]);

  const loadServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingServer(null);
    setFormData({
      type: 'emby',
      name: '',
      url: '',
      api_key: '',
      enabled: true
    });
  };

  const handleEdit = (server) => {
    setEditingServer(server.id);
    setShowAddForm(true);
    setFormData({
      type: server.type,
      name: server.name,
      url: server.url,
      api_key: server.api_key,
      enabled: server.enabled === 1
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingServer(null);
    setFormData({
      type: 'emby',
      name: '',
      url: '',
      api_key: '',
      enabled: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isNewServer = !editingServer;
      let serverId;

      if (editingServer) {
        await api.put(`/servers/${editingServer}`, formData);
        serverId = editingServer;
      } else {
        const response = await api.post('/servers', formData);
        serverId = response.data.data.id;
      }
      await loadServers();
      handleCancel();

      // For new servers, automatically test connection and restart monitoring
      if (isNewServer && serverId) {
        try {
          // Test the connection
          setTesting(prev => ({ ...prev, [serverId]: true }));
          const testResponse = await api.post(`/servers/${serverId}/test`);
          setTestResults(prev => ({
            ...prev,
            [serverId]: {
              success: testResponse.data.data.success,
              message: testResponse.data.data.success
                ? `Connected to ${testResponse.data.data.serverName || 'server'}`
                : `Failed: ${testResponse.data.data.error}`
            }
          }));
          setTesting(prev => ({ ...prev, [serverId]: false }));

          // Restart monitoring
          await api.post('/monitoring/restart');
          console.log('Monitoring service restarted successfully');
        } catch (error) {
          console.error('Failed to test or restart:', error);
          setTesting(prev => ({ ...prev, [serverId]: false }));
        }
      }
    } catch (error) {
      console.error('Failed to save server:', error);
      alert(`Failed to save server: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this server?')) return;

    try {
      await api.delete(`/servers/${id}`);
      await loadServers();
    } catch (error) {
      console.error('Failed to delete server:', error);
      alert(`Failed to delete server: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleTest = async (id) => {
    setTesting(prev => ({ ...prev, [id]: true }));
    setTestResults(prev => ({ ...prev, [id]: null }));

    try {
      console.log(`Testing server: ${id}`);
      console.log(`Request URL: /api/servers/${id}/test`);
      const response = await api.post(`/servers/${id}/test`);
      console.log(`Test response:`, response);
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: response.data.data.success,
          message: response.data.data.success
            ? response.data.data.message || `Connected to ${response.data.data.serverName || 'server'}`
            : response.data.data.error || 'Connection failed',
          version: response.data.data.version
        }
      }));

      // Clear the test result after 5 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[id];
          return newResults;
        });
      }, 5000);
    } catch (error) {
      console.error(`Test error for ${id}:`, error);
      console.error(`Error response:`, error.response);
      setTestResults(prev => ({
        ...prev,
        [id]: {
          success: false,
          message: `Error: ${error.response?.data?.error || error.message}`
        }
      }));

      // Clear the error result after 5 seconds
      setTimeout(() => {
        setTestResults(prev => {
          const newResults = { ...prev };
          delete newResults[id];
          return newResults;
        });
      }, 5000);
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRestartMonitoring = async () => {
    try {
      await api.post('/monitoring/restart');
      alert('Monitoring service restarted successfully!');
    } catch (error) {
      console.error('Failed to restart monitoring:', error);
      alert(`Failed to restart monitoring: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleTimezoneChange = async (timezone) => {
    setSavingSettings(true);
    try {
      await updateSetting('timezone', timezone);
      setSettings({ ...settings, timezone });
      // Update the timezone in context (which updates format utility)
      updateTimezone(timezone);
    } catch (error) {
      console.error('Failed to update timezone:', error);
      alert(`Failed to update timezone: ${error.response?.data?.error || error.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const getServerTypeLabel = (type) => {
    const labels = {
      emby: { name: 'Emby', color: 'bg-green-500/20 text-green-400' },
      plex: { name: 'Plex', color: 'bg-yellow-500/20 text-yellow-400' },
      audiobookshelf: { name: 'Audiobookshelf', color: 'bg-blue-500/20 text-blue-400' }
    };
    return labels[type] || { name: type, color: 'bg-gray-500/20 text-gray-400' };
  };

  const getServerIcon = (type) => {
    switch (type) {
      case 'emby':
        return <img src="/logos/emby.svg" alt="Emby" className="w-5 h-5" />;
      case 'plex':
        return <img src="/logos/plex.svg" alt="Plex" className="w-5 h-5" />;
      case 'audiobookshelf':
        return <img src="/logos/audiobookshelf.svg" alt="Audiobookshelf" className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Settings</h1>
        <p className="text-gray-400 text-lg">Configure your media servers and monitoring options</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Server
        </button>
        <button
          onClick={handleRestartMonitoring}
          className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Restart Monitoring
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl mb-8 overflow-hidden shadow-xl">
          <div className="bg-dark-750 px-6 py-4 border-b border-dark-600">
            <h3 className="text-xl font-semibold text-white">
              {editingServer ? 'Edit Server' : 'Add New Server'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="emby">Emby</option>
                  <option value="plex">Plex</option>
                  <option value="audiobookshelf">Audiobookshelf</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="My Media Server"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="http://192.168.1.100:8096"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Include http:// or https:// and port number
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {formData.type === 'plex' ? 'API Token' : 'API Key'}
                </label>
                <input
                  type="text"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder={formData.type === 'plex' ? 'Your Plex token' : 'Your API key'}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 p-4 bg-dark-750 rounded-lg">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="enabled" className="text-base text-gray-300 cursor-pointer flex-1">
                Enable monitoring for this server
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Server'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Server List */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white mb-4">Configured Servers</h3>
      </div>

      {servers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-700 rounded-full mb-4">
            <Server className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No servers configured yet</p>
          <p className="text-gray-500">Add a server to start monitoring your media</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {servers.map((server) => {
            const typeInfo = getServerTypeLabel(server.type);
            return (
              <div key={server.id} className={`card ${server.from_env ? 'opacity-90' : ''}`}>
                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${server.enabled === 1 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`} />
                      <h4 className="text-lg font-semibold text-white">{server.name}</h4>
                    </div>
                    <div className="ml-5">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-2 ${typeInfo.color}`}>
                        {getServerIcon(server.type)}
                        {typeInfo.name}
                      </span>
                    </div>
                  </div>

                  {/* Environment Variable Badge */}
                  {server.from_env && (
                    <div className="mb-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Environment Variable
                    </div>
                  )}

                  {/* Server Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-dark-700">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500 text-sm flex-shrink-0">URL:</span>
                      <span className="text-gray-400 font-mono text-sm truncate text-right">{server.url}</span>
                    </div>
                    {serverVersions[server.id] && serverVersions[server.id] !== 'Unknown' && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-500 text-sm flex-shrink-0">Version:</span>
                        <span className="text-gray-400 font-medium text-sm">{serverVersions[server.id]}</span>
                      </div>
                    )}
                  </div>

                  {/* Environment Warning */}
                  {server.from_env && (
                    <div className="text-yellow-400/80 text-sm mb-4 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>This server is configured via environment variables and cannot be edited or deleted through the UI.</span>
                    </div>
                  )}

                  {/* Test Results */}
                  {testResults[server.id] && (
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-4 ${
                      testResults[server.id].success
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {testResults[server.id].success ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {testResults[server.id].message}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleTest(server.id)}
                      disabled={testing[server.id]}
                      className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:bg-dark-750 disabled:opacity-50 text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      {testing[server.id] ? 'Testing...' : 'Test'}
                    </button>
                    {!server.from_env && (
                      <>
                        <button
                          onClick={() => handleEdit(server)}
                          className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Settings */}
      <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 mt-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Application Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone || 'UTC'}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              disabled={savingSettings}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <optgroup label="UTC">
                <option value="UTC">UTC</option>
              </optgroup>
              <optgroup label="Americas">
                <option value="America/New_York">Eastern Time (New York)</option>
                <option value="America/Chicago">Central Time (Chicago)</option>
                <option value="America/Denver">Mountain Time (Denver)</option>
                <option value="America/Phoenix">Mountain Time - Arizona (Phoenix)</option>
                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                <option value="America/Anchorage">Alaska Time (Anchorage)</option>
                <option value="Pacific/Honolulu">Hawaii Time (Honolulu)</option>
                <option value="America/Toronto">Eastern Time (Toronto)</option>
                <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                <option value="America/Mexico_City">Central Time (Mexico City)</option>
                <option value="America/Sao_Paulo">Brasilia Time (São Paulo)</option>
                <option value="America/Buenos_Aires">Argentina Time (Buenos Aires)</option>
                <option value="America/Santiago">Chile Time (Santiago)</option>
                <option value="America/Lima">Peru Time (Lima)</option>
                <option value="America/Bogota">Colombia Time (Bogotá)</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="Europe/London">GMT/BST (London)</option>
                <option value="Europe/Dublin">GMT/IST (Dublin)</option>
                <option value="Europe/Paris">CET/CEST (Paris)</option>
                <option value="Europe/Berlin">CET/CEST (Berlin)</option>
                <option value="Europe/Rome">CET/CEST (Rome)</option>
                <option value="Europe/Madrid">CET/CEST (Madrid)</option>
                <option value="Europe/Amsterdam">CET/CEST (Amsterdam)</option>
                <option value="Europe/Brussels">CET/CEST (Brussels)</option>
                <option value="Europe/Vienna">CET/CEST (Vienna)</option>
                <option value="Europe/Zurich">CET/CEST (Zurich)</option>
                <option value="Europe/Stockholm">CET/CEST (Stockholm)</option>
                <option value="Europe/Athens">EET/EEST (Athens)</option>
                <option value="Europe/Helsinki">EET/EEST (Helsinki)</option>
                <option value="Europe/Istanbul">Turkey Time (Istanbul)</option>
                <option value="Europe/Moscow">Moscow Time (Moscow)</option>
              </optgroup>
              <optgroup label="Asia">
                <option value="Asia/Dubai">Gulf Time (Dubai)</option>
                <option value="Asia/Kolkata">India Time (Kolkata)</option>
                <option value="Asia/Dhaka">Bangladesh Time (Dhaka)</option>
                <option value="Asia/Bangkok">Indochina Time (Bangkok)</option>
                <option value="Asia/Singapore">Singapore Time (Singapore)</option>
                <option value="Asia/Hong_Kong">Hong Kong Time (Hong Kong)</option>
                <option value="Asia/Shanghai">China Time (Shanghai)</option>
                <option value="Asia/Tokyo">Japan Time (Tokyo)</option>
                <option value="Asia/Seoul">Korea Time (Seoul)</option>
                <option value="Asia/Jakarta">Indonesia Western Time (Jakarta)</option>
                <option value="Asia/Manila">Philippines Time (Manila)</option>
                <option value="Asia/Taipei">Taiwan Time (Taipei)</option>
                <option value="Asia/Karachi">Pakistan Time (Karachi)</option>
              </optgroup>
              <optgroup label="Australia & Pacific">
                <option value="Australia/Perth">Australian Western Time (Perth)</option>
                <option value="Australia/Adelaide">Australian Central Time (Adelaide)</option>
                <option value="Australia/Darwin">Australian Central Time (Darwin)</option>
                <option value="Australia/Brisbane">Australian Eastern Time (Brisbane)</option>
                <option value="Australia/Sydney">Australian Eastern Time (Sydney)</option>
                <option value="Australia/Melbourne">Australian Eastern Time (Melbourne)</option>
                <option value="Pacific/Auckland">New Zealand Time (Auckland)</option>
                <option value="Pacific/Fiji">Fiji Time (Fiji)</option>
              </optgroup>
              <optgroup label="Africa">
                <option value="Africa/Cairo">Eastern European Time (Cairo)</option>
                <option value="Africa/Johannesburg">South Africa Time (Johannesburg)</option>
                <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
              </optgroup>
            </select>
            {savingSettings && (
              <p className="mt-2 text-sm text-gray-400">Saving...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

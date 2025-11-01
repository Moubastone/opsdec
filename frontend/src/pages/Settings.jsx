import { useState, useEffect } from 'react';
import { Save, Server, RefreshCw } from 'lucide-react';

function Settings() {
  const [settings, setSettings] = useState({
    plexUrl: '',
    plexToken: '',
    embyUrl: '',
    embyApiKey: '',
    audiobookshelfUrl: '',
    audiobookshelfApiKey: '',
    pollInterval: 30,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Note: In a real implementation, you'd need a backend endpoint to get/set these
  // For now, this is a UI placeholder

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement settings API endpoint
      // await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      setMessage({ type: 'success', text: 'Settings saved! Restart the container for changes to take effect.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service) => {
    setMessage({ type: 'info', text: `Testing ${service} connection...` });

    try {
      if (service === 'emby') {
        const response = await fetch('/api/emby/test');
        const data = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: `✓ Emby connected: ${data.serverName} v${data.version}` });
        } else {
          setMessage({ type: 'error', text: `✗ Emby connection failed: ${data.error}` });
        }
      } else if (service === 'audiobookshelf') {
        const response = await fetch('/api/audiobookshelf/test');
        const data = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: `✓ Audiobookshelf connected: ${data.serverName || 'Server'} v${data.version || 'Unknown'}` });
        } else {
          setMessage({ type: 'error', text: `✗ Audiobookshelf connection failed: ${data.error}` });
        }
      }
      // TODO: Add Plex test endpoint
    } catch (error) {
      setMessage({ type: 'error', text: `Connection test failed: ${error.message}` });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Configuration</h3>
        <p className="text-sm text-gray-400">
          Manage your media server connections and monitoring settings.
        </p>
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> Settings are currently configured via environment variables in docker-compose.yml.
            This UI is a preview - changes require container restart.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
          message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
          'bg-blue-500/10 border border-blue-500/20 text-blue-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plex Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Plex Media Server</span>
              </h3>
              <button
                type="button"
                onClick={() => testConnection('plex')}
                className="btn btn-secondary text-xs flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test</span>
              </button>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server URL
              </label>
              <input
                type="text"
                name="plexUrl"
                value={settings.plexUrl}
                onChange={handleChange}
                placeholder="http://192.168.1.100:32400"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                The URL to your Plex server (e.g., http://192.168.1.100:32400)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                X-Plex-Token
              </label>
              <input
                type="password"
                name="plexToken"
                value={settings.plexToken}
                onChange={handleChange}
                placeholder="Your Plex authentication token"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Get your token from Plex: Settings → Account → Get Info → View XML (look for X-Plex-Token)
              </p>
            </div>
          </div>
        </div>

        {/* Emby Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Emby Media Server</span>
              </h3>
              <button
                type="button"
                onClick={() => testConnection('emby')}
                className="btn btn-secondary text-xs flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test</span>
              </button>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server URL
              </label>
              <input
                type="text"
                name="embyUrl"
                value={settings.embyUrl}
                onChange={handleChange}
                placeholder="http://192.168.1.100:8096"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                The URL to your Emby server (e.g., http://192.168.1.100:8096)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                name="embyApiKey"
                value={settings.embyApiKey}
                onChange={handleChange}
                placeholder="Your Emby API key"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Get your API key from Emby: Dashboard → Advanced → API Keys → New API Key
              </p>
            </div>
          </div>
        </div>

        {/* Audiobookshelf Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Audiobookshelf Server</span>
              </h3>
              <button
                type="button"
                onClick={() => testConnection('audiobookshelf')}
                className="btn btn-secondary text-xs flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test</span>
              </button>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server URL
              </label>
              <input
                type="text"
                name="audiobookshelfUrl"
                value={settings.audiobookshelfUrl}
                onChange={handleChange}
                placeholder="http://192.168.1.100:13378"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                The URL to your Audiobookshelf server (e.g., http://192.168.1.100:13378)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <input
                type="password"
                name="audiobookshelfApiKey"
                value={settings.audiobookshelfApiKey}
                onChange={handleChange}
                placeholder="Your Audiobookshelf API token"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Get your API token from Audiobookshelf: Settings → Users → [Your Account] → API Tokens → Generate
              </p>
            </div>
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monitoring Settings</h3>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poll Interval (seconds)
              </label>
              <input
                type="number"
                name="pollInterval"
                value={settings.pollInterval}
                onChange={handleChange}
                min="10"
                max="300"
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                How often to check for activity updates (recommended: 30 seconds)
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Current Configuration Display */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Current Configuration</h3>
        </div>
        <div className="card-body">
          <div className="text-sm text-gray-400 space-y-2 font-mono">
            <p>To modify these values, edit your docker-compose.yml:</p>
            <pre className="bg-dark-700 p-4 rounded-lg mt-3 overflow-x-auto">
{`environment:
  - PLEX_URL=http://your-plex-server:32400
  - PLEX_TOKEN=your_plex_token
  - EMBY_URL=http://your-emby-server:8096
  - EMBY_API_KEY=your_emby_api_key
  - AUDIOBOOKSHELF_URL=http://your-audiobookshelf-server:13378
  - AUDIOBOOKSHELF_API_KEY=your_audiobookshelf_token
  - POLL_INTERVAL=30`}
            </pre>
            <p className="mt-3">Then restart the container:</p>
            <pre className="bg-dark-700 p-4 rounded-lg mt-2">
              docker-compose restart
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

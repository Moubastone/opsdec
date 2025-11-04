import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Settings from './pages/Settings';
import { getSettings } from './utils/api';
import { setTimezone } from './utils/format';

function App() {
  useEffect(() => {
    // Load timezone setting on app startup
    const loadTimezone = async () => {
      try {
        const response = await getSettings();
        const timezone = response.data.data.timezone || 'UTC';
        setTimezone(timezone);
      } catch (error) {
        console.error('Failed to load timezone setting:', error);
        setTimezone('UTC');
      }
    };

    loadTimezone();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:userId" element={<UserDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

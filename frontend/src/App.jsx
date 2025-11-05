import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Settings from './pages/Settings';
import { TimezoneProvider } from './contexts/TimezoneContext';

function App() {
  return (
    <TimezoneProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:userId" element={<UserDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </TimezoneProvider>
  );
}

export default App;

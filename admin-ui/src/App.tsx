import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Playground from './pages/Playground';
import Analytics from './pages/Analytics';
import QueueMonitoring from './pages/QueueMonitoring';
import ProviderConfigs from './pages/ProviderConfigs';
import Templates from './pages/Templates';
import Outbox from './pages/Outbox';
import ScheduledEmails from './pages/ScheduledEmails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="playground" element={<Playground />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="queues" element={<QueueMonitoring />} />
            <Route path="providers" element={<ProviderConfigs />} />
            <Route path="templates" element={<Templates />} />
            <Route path="outbox" element={<Outbox />} />
            <Route path="scheduled" element={<ScheduledEmails />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

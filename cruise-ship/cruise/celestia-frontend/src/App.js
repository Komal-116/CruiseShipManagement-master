import './App.css';
import Dashboard from './Dashboard';
import VoyagerDashboard from './VoyagerDashboard';
import GuestDashboard from './GuestDashboard';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import HeadCookDashboard from './HeadCookDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Payment from './Payment';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/voyager" element={<VoyagerDashboard />} />
            <Route path="/guest" element={<GuestDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/head-cook" element={<HeadCookDashboard />} />
            <Route path="/supervisor" element={<SupervisorDashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Add more routes for different user roles and services here */}
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

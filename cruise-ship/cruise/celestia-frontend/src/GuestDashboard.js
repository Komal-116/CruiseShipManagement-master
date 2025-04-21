import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { fetchUserProfile, updateUserProfile, fetchServices } from './api';
import ServiceCard from './ServiceCard';

const GuestDashboard = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('Pending Approval');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userData = await fetchUserProfile(currentUser.uid);
          setProfile({ name: userData.name, phone: userData.phone });
          setStatus(userData.approved ? 'Approved' : 'Pending Approval');
          if (userData.approved && userData.role === 'Voyager') {
            window.location.href = '/voyager/dashboard';
          }
          const servicesList = await fetchServices();
          setServices(servicesList);
        } catch (error) {
          alert('Error loading data: ' + error.message);
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        name: profile.name,
        phone: profile.phone,
      });
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please log in to view your dashboard.</div>;

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Guest Dashboard</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Available Services (View Only)</h2>
        <div className="row">
          {services.map(service => (
            <div className="col-md-4" key={service.id}>
              <ServiceCard service={service} onBook={() => alert('Booking not allowed for guests')} />
            </div>
          ))}
        </div>
        <h2>Your Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
            required
          />
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone"
            required
          />
          <button type="submit">Update Profile</button>
        </form>
        <p>Status: {status === 'Pending Approval' ? <span className="badge bg-warning text-dark">Pending Approval</span> : <span className="badge bg-success">Approved</span>}</p>
        {/* Optional contact form to reach admin can be added here */}
      </div>
    </>
  );
};

export default GuestDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { fetchBookings, updateBookingStatus } from './api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from './UserContext';

const HeadCookDashboard = () => {
  const { userId } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const allBookings = await fetchBookings();
      // Filter bookings for Catering / Meal Booking assigned to this user
      const filtered = allBookings.filter(
        b => b.serviceType === 'Catering / Meal Booking' && b.assignedTo === userId
      );
      setBookings(filtered);
    } catch (error) {
      alert('Error loading bookings: ' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [userId]);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      alert(`Booking status updated to ${status}`);
      await loadBookings();
    } catch (error) {
      alert('Error updating booking status: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('idToken');
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Head Cook Dashboard</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Catering Bookings</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Voyager ID</th>
              <th>Meal Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.userId}</td>
                <td>{booking.mealType}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status !== 'Delivered' && (
                    <>
                      {booking.status !== 'Preparing' && (
                        <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdateStatus(booking.id, 'Preparing')}>Mark Preparing</button>
                      )}
                      {booking.status !== 'Ready' && (
                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleUpdateStatus(booking.id, 'Ready')}>Mark Ready</button>
                      )}
                      <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Delivered')}>Mark Delivered</button>
                    </>
                  )}
                  {booking.status === 'Delivered' && <span>Delivered</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Manage Meal Menu, Schedule Meals, and Reports can be added here */}

      </div>
    </>
  );
};

export default HeadCookDashboard;

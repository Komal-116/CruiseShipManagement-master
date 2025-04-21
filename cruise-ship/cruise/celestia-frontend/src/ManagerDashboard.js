import React, { useState, useEffect, useContext } from 'react';
import { fetchBookings, updateBookingStatus, fetchServiceAvailability, updateServiceAvailability } from './api';
import { UserContext } from './UserContext';
import { Tab, Tabs, Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManagerDashboard = () => {
  const { userId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceAvailability, setServiceAvailability] = useState({});

  const managerServiceTypes = [
    'Salon / Spa Booking',
    'Fitness Center',
    'Movie / Entertainment',
    'Resort / Lounge Booking'
  ];

  const loadBookings = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const allBookings = await fetchBookings();
      const filtered = allBookings.filter(
        b => managerServiceTypes.includes(b.serviceType) && b.assignedTo === userId
      );
      setBookings(filtered);
    } catch (error) {
      alert('Error loading bookings: ' + error.message);
    }
    setLoading(false);
  };

  const loadServiceAvailability = async () => {
    try {
      const availability = await fetchServiceAvailability();
      setServiceAvailability(availability);
    } catch (error) {
      alert('Error loading service availability: ' + error.message);
    }
  };

  const handleToggleService = async (serviceName) => {
    const currentStatus = serviceAvailability[serviceName];
    const newStatus = !currentStatus;
    const updatedAvailability = { ...serviceAvailability, [serviceName]: newStatus };
    setServiceAvailability(updatedAvailability);
    try {
      await updateServiceAvailability(updatedAvailability);
      alert(`${serviceName} service ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      alert('Error updating service availability: ' + error.message);
    }
  };

  useEffect(() => {
    loadBookings();
    loadServiceAvailability();
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

  const handleLogout = () => {
    localStorage.removeItem('idToken');
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Manager Dashboard</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="bookings" title="Service Bookings">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Additional Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.userId}</td>
                    <td>{booking.serviceType}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>
                      {booking.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
                      {booking.status === 'approved' && <span className="badge bg-info text-dark">Approved</span>}
                      {booking.status === 'rejected' && <span className="badge bg-danger">Rejected</span>}
                      {booking.status === 'In Service' && <span className="badge bg-primary text-white">In Service</span>}
                      {booking.status === 'Session Started' && <span className="badge bg-primary text-white">Session Started</span>}
                      {booking.status === 'Playing' && <span className="badge bg-primary text-white">Playing</span>}
                      {booking.status === 'Occupied' && <span className="badge bg-primary text-white">Occupied</span>}
                      {booking.status === 'Ready' && <span className="badge bg-secondary text-white">Ready</span>}
                      {booking.status === 'Completed' && <span className="badge bg-success">Completed</span>}
                      {booking.status === 'Session Completed' && <span className="badge bg-success">Session Completed</span>}
                      {booking.status === 'Vacated' && <span className="badge bg-success">Vacated</span>}
                      {![ 'pending', 'approved', 'rejected', 'In Service', 'Session Started', 'Playing', 'Occupied', 'Ready', 'Completed', 'Session Completed', 'Vacated' ].includes(booking.status) && booking.status}
                    </td>
                    <td>
                      {booking.serviceType === 'Salon / Spa Booking' && `Category: ${booking.category}`}
                      {booking.serviceType === 'Fitness Center' && `Activity: ${booking.activity}, Trainer: ${booking.trainer}`}
                      {booking.serviceType === 'Movie / Entertainment' && `Title: ${booking.title}`}
                      {booking.serviceType === 'Resort / Lounge Booking' && `Location: ${booking.location}, Duration: ${booking.duration}`}
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <>
                          <Button className="btn btn-success btn-sm me-2" onClick={() => handleUpdateStatus(booking.id, 'approved')}>Approve</Button>
                          <Button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(booking.id, 'rejected')}>Reject</Button>
                        </>
                      )}
                      {booking.status === 'approved' && booking.serviceType === 'Salon / Spa Booking' && (
                        <Button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(booking.id, 'In Service')}>Mark In Service</Button>
                      )}
                      {booking.status === 'In Service' && booking.serviceType === 'Salon / Spa Booking' && (
                        <Button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Completed')}>Mark Completed</Button>
                      )}
                      {booking.status === 'approved' && booking.serviceType === 'Fitness Center' && (
                        <Button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Session Started')}>Start Session</Button>
                      )}
                      {booking.status === 'Session Started' && booking.serviceType === 'Fitness Center' && (
                        <Button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Session Completed')}>Complete Session</Button>
                      )}
                      {booking.status === 'approved' && booking.serviceType === 'Movie / Entertainment' && (
                        <Button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Playing')}>Start Movie</Button>
                      )}
                      {booking.status === 'Playing' && booking.serviceType === 'Movie / Entertainment' && (
                        <Button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Completed')}>End Movie</Button>
                      )}
                      {booking.status === 'approved' && booking.serviceType === 'Resort / Lounge Booking' && (
                        <Button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Occupied')}>Mark Occupied</Button>
                      )}
                      {booking.status === 'Occupied' && booking.serviceType === 'Resort / Lounge Booking' && (
                        <Button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(booking.id, 'Vacated')}>Mark Vacated</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="serviceAvailability" title="Service Availability">
            <ul>
              {Object.keys(serviceAvailability).map(service => (
                <li key={service}>
                  {service}: {serviceAvailability[service] ? 'Enabled' : 'Disabled'}
                  <Button className="btn btn-sm btn-secondary ms-2" onClick={() => handleToggleService(service)}>
                    {serviceAvailability[service] ? 'Disable' : 'Enable'}
                  </Button>
                </li>
              ))}
            </ul>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default ManagerDashboard;

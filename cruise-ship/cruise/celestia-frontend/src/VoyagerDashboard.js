import React, { useState, useEffect, useContext } from 'react';
import {
  fetchBookings,
  cancelBooking,
  submitFeedback,
  fetchUserProfile,
  updateUserProfile,
  fetchUsers,
} from './api';
import { Navbar, Nav, Container, Row, Col, Card, Button, Form, Tab, ListGroup, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from './UserContext';
import BookingForm from './BookingForm';  // Import BookingForm component

import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// Mapping service types to responsible roles
const serviceRoleMap = {
  'Catering / Meal Booking': 'head cook',
  'Salon / Spa Booking': 'manager',
  'Fitness Center': 'manager',
  'Movie / Entertainment': 'manager',
  'Resort / Lounge Booking': 'manager',
  'Facility Maintenance': 'supervisor',
  'Stationery Requests': 'supervisor',
};

const VoyagerDashboard = () => {
  const { userId } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  // Remove handleUpdateStatus as Voyager does not update booking status

  useEffect(() => {
    if (!userId) return;

    const app = getApp();
    const db = getFirestore(app);

    const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', userId));

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsList = [];
      snapshot.forEach(doc => {
        bookingsList.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to bookings:', error);
      setLoading(false);
    });

    // Fetch users and profile once
    async function loadUserData() {
      try {
        const usersList = await fetchUsers();
        setUsers(usersList);

        const userProfile = await fetchUserProfile(userId);
        setProfile({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          profileImage: userProfile.profileImage || '',
        });
      } catch (error) {
        alert('Error loading user data: ' + error.message);
      }
    }
    loadUserData();

    return () => unsubscribe();
  }, [userId]);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  const cateringBookings = bookings.filter(b => b.serviceType === 'Catering / Meal Booking');
  const salonBookings = bookings.filter(b => b.serviceType === 'Salon / Spa Booking');
  const fitnessBookings = bookings.filter(b => b.serviceType === 'Fitness Center');
  const movieBookings = bookings.filter(b => b.serviceType === 'Movie / Entertainment');
  const resortBookings = bookings.filter(b => b.serviceType === 'Resort / Lounge Booking');
  const maintenanceBookings = bookings.filter(b => b.serviceType === 'Facility Maintenance');
  const stationeryBookings = bookings.filter(b => b.serviceType === 'Stationery Requests');

  const confirmCancelBooking = (bookingId) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    setCancellingBookingId(cancelBookingId);
    setShowCancelModal(false);
    try {
      await cancelBooking(cancelBookingId);
      alert('Booking cancelled');
      const bookingsList = await fetchBookings(userId);
      setBookings(bookingsList);
    } catch (error) {
      alert('Error cancelling booking: ' + error.message);
    } finally {
      setCancellingBookingId(null);
      setCancelBookingId(null);
    }
  };

  const handleSubmitFeedback = async (bookingId) => {
    if (!feedbacks[bookingId]) {
      alert('Please enter feedback before submitting');
      return;
    }
    setSubmittingFeedbackId(bookingId);
    try {
      await submitFeedback(bookingId, feedbacks[bookingId]);
      alert('Feedback submitted');
      const bookingsList = await fetchBookings(userId);
      setBookings(bookingsList);
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(userId, {
        name: profile.name,
        phone: profile.phone,
        profileImage: profile.profileImage,
      });
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand>Welcome, {profile.name || 'Voyager'}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <Col md={3} className="bg-light vh-100 p-3">
            <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="bookservice">Book a Service</Nav.Link>
              </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="mybookings">My Bookings</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="feedback">Feedback</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="profile">Profile</Nav.Link>
          </Nav.Item>
        </Nav>
      </Col>

          <Col md={9} className="p-3">
            <Tab.Content>
              <Tab.Pane eventKey="dashboard" active={activeTab === 'dashboard'}>
                <h2>Dashboard Summary</h2>
                <Row className="mb-3">
                  <Col>
                    <Card bg="primary" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Total Bookings</Card.Title>
                        <Card.Text>{totalBookings}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="warning" text="dark" className="mb-2">
                      <Card.Body>
                        <Card.Title>Pending Approvals</Card.Title>
                        <Card.Text>{pendingBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="success" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Approved Services</Card.Title>
                        <Card.Text>{approvedBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="secondary" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Past Services</Card.Title>
                        <Card.Text>{pastBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <h3>Service-wise Bookings</h3>
                <Row className="mb-3">
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Catering / Meal Booking</Card.Title>
                        <Card.Text>{cateringBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Salon / Spa Booking</Card.Title>
                        <Card.Text>{salonBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Fitness Center</Card.Title>
                        <Card.Text>{fitnessBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Movie / Entertainment</Card.Title>
                        <Card.Text>{movieBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Resort / Lounge Booking</Card.Title>
                        <Card.Text>{resortBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Facility Maintenance</Card.Title>
                        <Card.Text>{maintenanceBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card bg="info" text="white" className="mb-2">
                      <Card.Body>
                        <Card.Title>Stationery Requests</Card.Title>
                        <Card.Text>{stationeryBookings.length}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="bookservice" active={activeTab === 'bookservice'}>
                <BookingForm />
              </Tab.Pane>

          <Tab.Pane eventKey="mybookings" active={activeTab === 'mybookings'}>
            <h2>My Bookings</h2>
            <Button variant="secondary" className="mb-3" onClick={async () => {
              try {
                const bookingsList = await fetchBookings(userId);
                setBookings(bookingsList);
              } catch (error) {
                alert('Error refreshing bookings: ' + error.message);
              }
            }}>
              Refresh Bookings
            </Button>
            <ListGroup>
              {bookings.map(booking => (
                <ListGroup.Item key={booking.id}>
                  <div>
                    <strong>Service:</strong> {booking.serviceType} <br />
                    <strong>Date:</strong> {booking.date} <br />
                    <strong>Time:</strong> {booking.time || booking.showTime} <br />
                    <strong>Status:</strong>{' '}
                    {booking.status === 'pending' && <Badge bg="warning" text="dark">Pending</Badge>}
                    {booking.status === 'approved' && <Badge bg="info" text="dark">Approved</Badge>}
                    {booking.status === 'completed' && <Badge bg="success">Completed</Badge>}
                    {booking.status === 'cancelled' && <Badge bg="danger">Cancelled</Badge>}
                    {booking.status === 'Preparing' && <Badge bg="primary" text="white">Preparing</Badge>}
                    {booking.status === 'Ready' && <Badge bg="secondary" text="white">Ready</Badge>}
                    {booking.status === 'Delivered' && <Badge bg="success">Delivered</Badge>}
                    {booking.status === 'In Service' && <Badge bg="primary" text="white">In Service</Badge>}
                    {booking.status === 'Session Started' && <Badge bg="primary" text="white">Session Started</Badge>}
                    {booking.status === 'Playing' && <Badge bg="primary" text="white">Playing</Badge>}
                    {booking.status === 'Occupied' && <Badge bg="primary" text="white">Occupied</Badge>}
                    {booking.status === 'Session Completed' && <Badge bg="success">Session Completed</Badge>}
                    {booking.status === 'Vacated' && <Badge bg="success">Vacated</Badge>}
                  </div>
                  {booking.status === 'pending' && (
                    <Button variant="outline-danger" size="sm" className="mt-2" onClick={() => confirmCancelBooking(booking.id)} disabled={cancellingBookingId === booking.id}>
                      {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Tab.Pane>

              <Tab.Pane eventKey="feedback" active={activeTab === 'feedback'}>
                <h2>Feedback & Ratings</h2>
                {bookings.filter(b => b.status === 'completed').length === 0 && <p>No completed bookings to provide feedback.</p>}
                {bookings.filter(b => b.status === 'completed').map(booking => (
                  <Card key={booking.id} className="mb-3">
                    <Card.Body>
                      <Card.Title>{booking.serviceType} on {booking.date}</Card.Title>
                      <Form.Group controlId={`feedback-${booking.id}`} className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select
                          value={feedbacks[booking.id]?.rating || ''}
                          onChange={(e) => setFeedbacks({
                            ...feedbacks,
                            [booking.id]: { ...feedbacks[booking.id], rating: e.target.value }
                          })}
                        >
                          <option value="">Select rating</option>
                          <option value="very bad">Very Bad</option>
                          <option value="bad">Bad</option>
                          <option value="good">Good</option>
                          <option value="very good">Very Good</option>
                          <option value="excellent">Excellent</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId={`comment-${booking.id}`} className="mb-3">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Write your experience..."
                          value={feedbacks[booking.id]?.comment || ''}
                          onChange={(e) => setFeedbacks({
                            ...feedbacks,
                            [booking.id]: { ...feedbacks[booking.id], comment: e.target.value }
                          })}
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        onClick={() => handleSubmitFeedback(booking.id)}
                        disabled={submittingFeedbackId === booking.id}
                      >
                        {submittingFeedbackId === booking.id ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </Tab.Pane>

              <Tab.Pane eventKey="profile" active={activeTab === 'profile'}>
                <h2>Profile Management</h2>
                <Form>
                  <Form.Group controlId="profileName" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" name="name" value={profile.name} onChange={handleProfileChange} />
                  </Form.Group>
                  <Form.Group controlId="profileEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={profile.email} readOnly />
                  </Form.Group>
                  <Form.Group controlId="profilePhone" className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control type="text" name="phone" value={profile.phone} onChange={handleProfileChange} />
                  </Form.Group>
                  <Form.Group controlId="profileImage" className="mb-3">
                    <Form.Label>Profile Image URL</Form.Label>
                    <Form.Control type="text" name="profileImage" value={profile.profileImage} onChange={handleProfileChange} />
                  </Form.Group>
                  <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
                </Form>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Container>

      <footer className="bg-dark text-white text-center py-3 mt-4">
        © Celestia Cruises 2025
      </footer>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this booking?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Close</Button>
          <Button variant="danger" onClick={handleCancelBooking}>Cancel Booking</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VoyagerDashboard;

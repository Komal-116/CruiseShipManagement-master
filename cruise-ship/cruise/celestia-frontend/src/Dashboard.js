import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css'; // Assuming custom styles for animations and layout
import { fetchUserProfile } from './api';

const servicesData = [
  {
    id: 'catering',
    name: 'Catering Services',
    image: '/images/catering.jpg',
    route: '/voyager', // Assuming voyager books services
  },
  {
    id: 'roomBooking',
    name: 'Room Booking',
    image: '/images/room-booking.jpg',
    route: '/voyager',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    image: '/images/entertainment.jpg',
    route: '/voyager',
  },
  {
    id: 'excursions',
    name: 'Excursions',
    image: '/images/excursions.jpg',
    route: '/voyager',
  },
  {
    id: 'cook',
    name: 'Cook Services',
    image: '/images/cook.jpg',
    route: '/voyager',
  },
  {
    id: 'medical',
    name: 'Medical Services',
    image: '/images/medical.jpg',
    route: '/voyager',
  },
  {
    id: 'salonSpa',
    name: 'Salon/Spa',
    image: '/images/salon-spa.jpg',
    route: '/voyager',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    image: '/images/fitness.jpg',
    route: '/voyager',
  },
  {
    id: 'movie',
    name: 'Movie',
    image: '/images/movie.jpg',
    route: '/voyager',
  },
  {
    id: 'resort',
    name: 'Resort',
    image: '/images/resort.jpg',
    route: '/voyager',
  },
  {
    id: 'facilityMaintenance',
    name: 'Facility Maintenance',
    image: '/images/facility-maintenance.jpg',
    route: '/voyager',
  },
  {
    id: 'stationeryRequests',
    name: 'Stationery Requests',
    image: '/images/stationery.jpg',
    route: '/voyager',
  },
];

const Dashboard = () => {
  const [user, setUser] = React.useState(null);
  const [approved, setApproved] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = React.useState({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
    console.log('Auth state changed:', currentUser);
    if (currentUser) {
      // Refresh ID token and store in localStorage
      const idToken = await currentUser.getIdToken(true);
      localStorage.setItem('idToken', idToken);

      setUser(currentUser);
      // Fetch user approval status and role from backend API using api.js
      try {
        const userData = await fetchUserProfile(currentUser.uid);
        console.log('User data:', userData);
        setApproved(userData.approved);
        if (userData.approved) {
          // Redirect to respective dashboard based on role
          switch (userData.role.toLowerCase()) {
            case 'admin':
              navigate('/admin');
              break;
            case 'voyager':
              navigate('/voyager');
              break;
            case 'manager':
              navigate('/manager');
              break;
            case 'head cook':
              navigate('/head-cook');
              break;
            case 'supervisor':
              navigate('/supervisor');
              break;
            case 'guest':
              navigate('/guest');
              break;
            default:
              navigate('/');
              break;
          }
        } else {
          // User not approved - stay on dashboard and show message
          setApproved(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setApproved(false);
      }
    } else {
      setUser(null);
      setApproved(null);
    }
  });
  return () => unsubscribe();
}, [navigate]);

  // Adjust rendering logic for nav bar
  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/signup">Register</Link></li>
        </>
      );
    }
    if (user && approved === false) {
      return (
        <li className="nav-item">
          <span className="nav-link text-warning">Your account is not yet approved. Please wait for admin approval.</span>
        </li>
      );
    }
    if (user && approved === true) {
      return (
        <li className="nav-item">
          <button className="btn btn-outline-light" onClick={() => auth.signOut().then(() => window.location.reload())}>
            Logout
          </button>
        </li>
      );
    }
    return null;
  };

  useEffect(() => {
    // Smooth scroll for anchor links
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleServiceClick = (service) => {
    if (!user) {
      alert('Please login to book a service.');
      navigate('/login');
      return;
    }
    if (!approved) {
      alert('Your account is not approved yet. Please wait for admin approval.');
      return;
    }
    navigate(service.route);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) errors.message = 'Message is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you can add form submission logic, e.g., send to backend or Firebase
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setFormErrors({});
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Celestia Cruises</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className={`nav-item ${isActiveLink('/')}`}><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <ul className="navbar-nav ms-auto">
              {renderNavLinks()}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-white d-flex align-items-center justify-content-center" style={{
        backgroundImage: 'url(https://vistapointe.net/images/ship-10.jpg)',
        
        height: '60vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div className="text-center p-4 bg-dark bg-opacity-50 rounded">
          <h1>Welcome to Celestia Cruises</h1>
          <p className="lead">Experience luxury and adventure on the high seas</p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container my-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2>About Celestia Cruises</h2>
            <p>
              Celestia Cruises offers an unforgettable experience combining luxury, comfort, and adventure.
              Our fleet of modern ships and exceptional service ensure a memorable journey for all our guests.
            </p>
            <p>
              Explore exotic destinations, enjoy world-class dining, and participate in exciting onboard activities.
            </p>
          </div>
          <div className="col-md-6">
            <img src="https://image.shutterstock.com/image-vector/cruise-ship-captain-cartoon-illustration-260nw-2155184557.jpg" alt="Cruise Ship" className="img-fluid rounded shadow" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container my-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <div className="row">
          {servicesData.map(service => (
            <div key={service.id} className="col-md-3 mb-4">
              <div
                className={`card service-card h-100 shadow-sm ${approved ? 'service-card-animate' : ''}`}
                style={{ cursor: approved ? 'pointer' : 'not-allowed' }}
                onClick={() => handleServiceClick(service)}
              >
                <img src="https://th.bing.com/th/id/OIP.X0rc2xMc9x3IPQctR6GpMAHaDa?rs=1&pid=ImgDetMain" className="card-img-top" alt={service.name} />
                <div className="card-body">
                  <h5 className="card-title">{service.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container my-5">
        <h2 className="text-center mb-4">Contact Us</h2>
        {formSubmitted && <div className="alert alert-success">Thank you for your message! We will get back to you soon.</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="contactName" className="form-label">Name</label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
              id="contactName"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="contactEmail" className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
              id="contactEmail"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="contactMessage" className="form-label">Message</label>
            <textarea
              className={`form-control ${formErrors.message ? 'is-invalid' : ''}`}
              id="contactMessage"
              name="message"
              rows="4"
              placeholder="Your message here..."
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
            {formErrors.message && <div className="invalid-feedback">{formErrors.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Celestia Cruises. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;
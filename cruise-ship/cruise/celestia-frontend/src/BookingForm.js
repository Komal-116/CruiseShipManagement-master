import React, { useState, useContext } from 'react';
import { createBooking } from './api';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

const OPTIONS = {
  mealOptions: ['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Snack'],
  salonSpaOptions: ['Facial', 'Massage', 'Haircut', 'Manicure', 'Pedicure', 'Body Wrap', 'Other'],
  fitnessActivities: ['Gym', 'Yoga', 'Zumba', 'Pilates', 'Crossfit', 'Swimming', 'Other'],
  trainers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Emily Davis', 'Rajesh Kumar', 'Other'],
  movieTitles: ['Movie A', 'Movie B', 'Movie C', 'Movie D', 'Movie E', 'Documentary X', 'Other'],
  resortLocations: ['Lounge A', 'Lounge B', 'Lounge C', 'Poolside', 'Rooftop', 'Beachfront', 'Other'],
  requestTypes: ['Electrical', 'Plumbing', 'Cleaning', 'HVAC', 'Carpentry', 'Other'],
  facilities: ['Pool', 'Gym', 'Spa', 'Restaurant', 'Theater', 'Conference Room', 'Other'],
  stationeryItems: ['Pens', 'Notebooks', 'Markers', 'Folders', 'Staplers', 'Paper Clips', 'Other'],
  requesters: ['Manager', 'Supervisor', 'Receptionist', 'Guest', 'Housekeeping', 'Other'],
};

// Predefined charges in Indian Rupees for each service type and options
const CHARGES = {
  'Catering / Meal Booking': {
    Breakfast: 150,
    Lunch: 250,
    Dinner: 300,
    Brunch: 200,
    Snack: 100,
  },
  'Salon / Spa Booking': {
    Facial: 1200,
    Massage: 1500,
    Haircut: 800,
    Manicure: 700,
    Pedicure: 700,
    'Body Wrap': 1800,
    Other: 0,
  },
  'Fitness Center': {
    Gym: 500,
    Yoga: 600,
    Zumba: 700,
    Pilates: 800,
    Crossfit: 900,
    Swimming: 1000,
    Other: 0,
  },
  trainers: {
    'John Doe': 1000,
    'Jane Smith': 1100,
    'Mike Johnson': 1200,
    'Emily Davis': 1300,
    'Rajesh Kumar': 1400,
    Other: 0,
  },
  'Movie / Entertainment': {
    'Movie A': 300,
    'Movie B': 350,
    'Movie C': 400,
    'Movie D': 450,
    'Movie E': 500,
    'Documentary X': 250,
    Other: 0,
  },
  'Resort / Lounge Booking': {
    'Lounge A': 2000,
    'Lounge B': 2200,
    'Lounge C': 2500,
    Poolside: 3000,
    Rooftop: 3500,
    Beachfront: 4000,
    Other: 0,
  },
  'Facility Maintenance': {
    Electrical: 500,
    Plumbing: 600,
    Cleaning: 400,
    HVAC: 700,
    Carpentry: 800,
    Other: 0,
  },
  'Stationery Requests': {
    Pens: 10,
    Notebooks: 20,
    Markers: 15,
    Folders: 25,
    Staplers: 30,
    'Paper Clips': 5,
    Other: 0,
  },
};

const BookingForm = () => {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    serviceType: '',
    mealType: '',
    date: '',
    time: '',
    quantity: '',
    category: '',
    categoryManual: '',
    activity: '',
    activityManual: '',
    trainer: '',
    trainerManual: '',
    title: '',
    titleManual: '',
    showTime: '',
    seats: '',
    location: '',
    locationManual: '',
    duration: '',
    requestType: '',
    requestTypeManual: '',
    facility: '',
    facilityManual: '',
    issue: '',
    item: '',
    itemManual: '',
    requestedBy: '',
    requestedByManual: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const requiredFieldsByService = {
    'Catering / Meal Booking': ['mealType', 'time', 'quantity'],
    'Salon / Spa Booking': ['category', 'time'],
    'Fitness Center': ['activity', 'trainer', 'date', 'time'],
    'Movie / Entertainment': ['title', 'showTime', 'seats'],
    'Resort / Lounge Booking': ['location', 'date', 'duration'],
    'Facility Maintenance': ['requestType', 'facility', 'issue'],
    'Stationery Requests': ['requestType', 'item', 'quantity', 'requestedBy'],
  };

  const manualFieldsMap = {
    category: 'categoryManual',
    activity: 'activityManual',
    trainer: 'trainerManual',
    title: 'titleManual',
    location: 'locationManual',
    requestType: 'requestTypeManual',
    facility: 'facilityManual',
    item: 'itemManual',
    requestedBy: 'requestedByManual',
  };

  const validateFields = () => {
    if (!bookingData.serviceType) {
      setError('Please select a service type');
      return false;
    }
    const requiredFields = requiredFieldsByService[bookingData.serviceType] || [];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        setError(`Please fill all required fields for ${bookingData.serviceType}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    if (!userId) {
      setError('User not logged in');
      return;
    }

    setSubmitting(true);
    try {
      let bookingPayload = {
        userId,
        serviceType: bookingData.serviceType,
        status: 'pending',
        date: bookingData.date || new Date().toISOString().split('T')[0],
        assignedTo: null,
      };

      switch (bookingData.serviceType) {
        case 'Catering / Meal Booking':
          bookingPayload.mealType = bookingData.mealType;
          bookingPayload.time = bookingData.time;
          bookingPayload.quantity = bookingData.quantity;
          break;
        case 'Salon / Spa Booking':
          bookingPayload.category = bookingData.category === 'Other' ? bookingData[manualFieldsMap.category] : bookingData.category;
          bookingPayload.time = bookingData.time;
          break;
        case 'Fitness Center':
          bookingPayload.activity = bookingData.activity === 'Other' ? bookingData[manualFieldsMap.activity] : bookingData.activity;
          bookingPayload.trainer = bookingData.trainer === 'Other' ? bookingData[manualFieldsMap.trainer] : bookingData.trainer;
          bookingPayload.time = bookingData.time;
          bookingPayload.date = bookingData.date || new Date().toISOString().split('T')[0];
          break;
        case 'Movie / Entertainment':
          bookingPayload.title = bookingData.title === 'Other' ? bookingData[manualFieldsMap.title] : bookingData.title;
          bookingPayload.showTime = bookingData.showTime;
          bookingPayload.seats = bookingData.seats;
          bookingPayload.date = bookingData.date || new Date().toISOString().split('T')[0];
          break;
        case 'Resort / Lounge Booking':
          bookingPayload.location = bookingData.location === 'Other' ? bookingData[manualFieldsMap.location] : bookingData.location;
          bookingPayload.duration = bookingData.duration;
          bookingPayload.date = bookingData.date || new Date().toISOString().split('T')[0];
          break;
        case 'Facility Maintenance':
          bookingPayload.requestType = bookingData.requestType === 'Other' ? bookingData[manualFieldsMap.requestType] : bookingData.requestType;
          bookingPayload.facility = bookingData.facility === 'Other' ? bookingData[manualFieldsMap.facility] : bookingData.facility;
          bookingPayload.issue = bookingData.issue;
          bookingPayload.date = bookingData.date || new Date().toISOString().split('T')[0];
          break;
        case 'Stationery Requests':
          bookingPayload.requestType = bookingData.requestType === 'Other' ? bookingData[manualFieldsMap.requestType] : bookingData.requestType;
          bookingPayload.item = bookingData.item === 'Other' ? bookingData[manualFieldsMap.item] : bookingData.item;
          bookingPayload.quantity = bookingData.quantity;
          bookingPayload.requestedBy = bookingData.requestedBy === 'Other' ? bookingData[manualFieldsMap.requestedBy] : bookingData.requestedBy;
          bookingPayload.date = bookingData.date || new Date().toISOString().split('T')[0];
          break;
        default:
          break;
      }

      // Create booking first
      const createdBooking = await createBooking(bookingPayload);

      setSuccess('Booking created successfully. Redirecting to payment...');

      // Navigate to payment page with booking data
      navigate('/payment', { state: { booking: createdBooking } });

      // Reset form
      setBookingData({
        serviceType: '',
        mealType: '',
        date: '',
        time: '',
        quantity: '',
        category: '',
        categoryManual: '',
        activity: '',
        activityManual: '',
        trainer: '',
        trainerManual: '',
        title: '',
        titleManual: '',
        showTime: '',
        seats: '',
        location: '',
        locationManual: '',
        duration: '',
        requestType: '',
        requestTypeManual: '',
        facility: '',
        facilityManual: '',
        issue: '',
        item: '',
        itemManual: '',
        requestedBy: '',
        requestedByManual: '',
      });
    } catch (err) {
      setError('Error submitting booking: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelect = (id, name, label, value, onChange, optionsList, required = false) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <select
        id={id}
        name={name}
        className="form-select"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {optionsList.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const renderInput = (id, name, label, value, onChange, type = 'text', required = false, min = null) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        className="form-control"
        value={value}
        onChange={onChange}
        required={required}
        min={min}
      />
    </div>
  );

  const renderTextarea = (id, name, label, value, onChange, required = false) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <textarea
        id={id}
        name={name}
        className="form-control"
        rows="3"
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>Book a Service</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        {renderSelect('serviceType', 'serviceType', 'Service Type', bookingData.serviceType, handleChange, [
          'Catering / Meal Booking',
          'Salon / Spa Booking',
          'Fitness Center',
          'Movie / Entertainment',
          'Resort / Lounge Booking',
          'Facility Maintenance',
          'Stationery Requests',
        ], true)}

        {bookingData.serviceType === 'Catering / Meal Booking' && (
          <>
            {renderSelect('mealType', 'mealType', 'Meal Type', bookingData.mealType, handleChange, OPTIONS.mealOptions, true)}
            {renderInput('time', 'time', 'Time', bookingData.time, handleChange, 'time', true)}
            {renderInput('quantity', 'quantity', 'Quantity', bookingData.quantity, handleChange, 'number', true, 1)}
          </>
        )}

        {bookingData.serviceType === 'Salon / Spa Booking' && (
          <>
            {renderSelect('category', 'category', 'Service', bookingData.category, handleChange, OPTIONS.salonSpaOptions, true)}
            {bookingData.category === 'Other' && renderInput('categoryManual', 'categoryManual', 'Enter Service', bookingData.categoryManual, handleChange, 'text', true)}
            {renderInput('time', 'time', 'Time Slot', bookingData.time, handleChange, 'time', true)}
          </>
        )}

        {bookingData.serviceType === 'Fitness Center' && (
          <>
            {renderSelect('activity', 'activity', 'Activity', bookingData.activity, handleChange, OPTIONS.fitnessActivities, true)}
            {bookingData.activity === 'Other' && renderInput('activityManual', 'activityManual', 'Enter Activity', bookingData.activityManual, handleChange, 'text', true)}
            {renderSelect('trainer', 'trainer', 'Trainer', bookingData.trainer, handleChange, OPTIONS.trainers, true)}
            {bookingData.trainer === 'Other' && renderInput('trainerManual', 'trainerManual', 'Enter Trainer', bookingData.trainerManual, handleChange, 'text', true)}
            {renderInput('date', 'date', 'Date', bookingData.date, handleChange, 'date', true)}
            {renderInput('time', 'time', 'Time', bookingData.time, handleChange, 'time', true)}
          </>
        )}

        {bookingData.serviceType === 'Movie / Entertainment' && (
          <>
            {renderSelect('title', 'title', 'Show Title', bookingData.title, handleChange, OPTIONS.movieTitles, true)}
            {bookingData.title === 'Other' && renderInput('titleManual', 'titleManual', 'Enter Show Title', bookingData.titleManual, handleChange, 'text', true)}
            {renderInput('showTime', 'showTime', 'Show Time', bookingData.showTime, handleChange, 'time', true)}
            {renderInput('seats', 'seats', 'Seats', bookingData.seats, handleChange, 'number', true, 1)}
          </>
        )}

        {bookingData.serviceType === 'Resort / Lounge Booking' && (
          <>
            {renderSelect('location', 'location', 'Location', bookingData.location, handleChange, OPTIONS.resortLocations, true)}
            {bookingData.location === 'Other' && renderInput('locationManual', 'locationManual', 'Enter Location', bookingData.locationManual, handleChange, 'text', true)}
            {renderInput('duration', 'duration', 'Duration', bookingData.duration, handleChange, 'text', true)}
            {renderInput('date', 'date', 'Date', bookingData.date, handleChange, 'date', true)}
          </>
        )}

        {bookingData.serviceType === 'Facility Maintenance' && (
          <>
            {renderSelect('requestType', 'requestType', 'Request Type', bookingData.requestType, handleChange, OPTIONS.requestTypes, true)}
            {bookingData.requestType === 'Other' && renderInput('requestTypeManual', 'requestTypeManual', 'Enter Request Type', bookingData.requestTypeManual, handleChange, 'text', true)}
            {renderSelect('facility', 'facility', 'Facility', bookingData.facility, handleChange, OPTIONS.facilities, true)}
            {bookingData.facility === 'Other' && renderInput('facilityManual', 'facilityManual', 'Enter Facility', bookingData.facilityManual, handleChange, 'text', true)}
            {renderTextarea('issue', 'issue', 'Issue', bookingData.issue, handleChange, true)}
          </>
        )}

        {bookingData.serviceType === 'Stationery Requests' && (
          <>
            {renderInput('requestType', 'requestType', 'Request Type', bookingData.requestType, handleChange, 'text', true)}
            {renderSelect('item', 'item', 'Item', bookingData.item, handleChange, OPTIONS.stationeryItems, true)}
            {bookingData.item === 'Other' && renderInput('itemManual', 'itemManual', 'Enter Item', bookingData.itemManual, handleChange, 'text', true)}
            {renderInput('quantity', 'quantity', 'Quantity', bookingData.quantity, handleChange, 'number', true, 1)}
            {renderSelect('requestedBy', 'requestedBy', 'Requested By', bookingData.requestedBy, handleChange, OPTIONS.requesters, true)}
            {bookingData.requestedBy === 'Other' && renderInput('requestedByManual', 'requestedByManual', 'Enter Requester', bookingData.requestedByManual, handleChange, 'text', true)}
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;

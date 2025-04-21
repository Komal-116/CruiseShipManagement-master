const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// Get bookings, optionally filtered by userId or status
router.get('/', async (req, res) => {
  const { userId, status } = req.query;
  try {
    let bookingsRef = db.collection('bookings');
    if (userId) {
      bookingsRef = bookingsRef.where('userId', '==', userId);
    }
    if (status) {
      bookingsRef = bookingsRef.where('status', '==', status);
    }
    const snapshot = await bookingsRef.get();
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  const bookingData = req.body;
  if (!bookingData.userId || !bookingData.serviceType || !bookingData.date || !bookingData.status) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }
  // Add price and paymentStatus fields with defaults if not provided
  if (!bookingData.price) {
    bookingData.price = 0;
  }
  if (!bookingData.paymentStatus) {
    bookingData.paymentStatus = 'pending'; // pending, paid, failed
  }
  try {
    const docRef = await db.collection('bookings').add(bookingData);
    res.status(201).json({ id: docRef.id, ...bookingData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status or other fields
router.patch('/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const updateData = req.body;
  try {
    await db.collection('bookings').doc(bookingId).update(updateData);
    res.json({ message: 'Booking updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a booking (set status to cancelled)
router.post('/:bookingId/cancel', async (req, res) => {
  const { bookingId } = req.params;
  try {
    await db.collection('bookings').doc(bookingId).update({ status: 'cancelled' });
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:bookingId/pay', async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod, amount } = req.body;

  if (!paymentMethod || !amount) {
    return res.status(400).json({ error: 'Missing payment method or amount' });
  }

  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();

    // Simple mock payment processing logic
    if (amount < booking.price) {
      return res.status(400).json({ error: 'Insufficient payment amount' });
    }

    // Fetch staff userIds by role
    const usersSnapshot = await db.collection('users').get();
    let headCookId = null;
    let managerId = null;
    let supervisorId = null;
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.role === 'Head Cook' && !headCookId) headCookId = doc.id;
      if (user.role === 'Manager' && !managerId) managerId = doc.id;
      if (user.role === 'Supervisor' && !supervisorId) supervisorId = doc.id;
    });

    // Assign booking to staff based on serviceType
    let assignedStaffId = null;
    const cateringServices = ['Catering / Meal Booking'];
    const managerServices = ['Salon / Spa Booking', 'Fitness Center', 'Movie / Entertainment', 'Resort / Lounge Booking'];
    const supervisorServices = ['Facility Maintenance', 'Stationery Requests'];

    if (cateringServices.includes(booking.serviceType)) {
      assignedStaffId = headCookId;
    } else if (managerServices.includes(booking.serviceType)) {
      assignedStaffId = managerId;
    } else if (supervisorServices.includes(booking.serviceType)) {
      assignedStaffId = supervisorId;
    }

    // Update payment status, booking status, and assigned staff
    await bookingRef.update({
      paymentStatus: 'paid',
      status: 'approved',
      paymentMethod,
      paymentDate: new Date().toISOString(),
      assignedTo: assignedStaffId,
    });

    // For supervisor services, create maintenanceRequests document
    if (supervisorServices.includes(booking.serviceType)) {
      await db.collection('maintenanceRequests').add({
        type: booking.serviceType === 'Facility Maintenance' ? 'maintenance' : 'stationery',
        bookingId: bookingId,
        status: 'pending',
        assignedStaff: supervisorId,
        details: booking,
        facility: booking.facility || '',
        issue: booking.issue || '',
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ message: 'Payment successful and booking assigned', bookingId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:bookingId/summary', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingDoc.data();

    res.json({
      id: bookingId,
      serviceType: booking.serviceType,
      date: booking.date,
      price: booking.price || 0,
      paymentStatus: booking.paymentStatus || 'pending',
      status: booking.status,
      details: booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:bookingId/assignStaff', async (req, res) => {
  const { bookingId } = req.params;
  const { staffId } = req.body;
  if (!staffId) {
    return res.status(400).json({ error: 'staffId is required' });
  }
  try {
    await db.collection('bookings').doc(bookingId).update({ assignedStaff: staffId });
    res.json({ message: 'Staff assigned to booking' });
  } catch (error) {
    console.error('Error assigning staff to booking:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

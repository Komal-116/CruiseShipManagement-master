const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// Get maintenance or stationery requests by type
router.get('/', async (req, res) => {
  const { type } = req.query;
  if (!type || !['maintenance', 'stationery'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing type parameter' });
  }
  try {
    const requestsSnapshot = await db.collection('maintenanceRequests')
      .where('type', '==', type)
      .get();
    const requests = [];
    requestsSnapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    res.json(requests);
  } catch (error) {
    console.error('Error in maintenanceRequests route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request status
router.put('/:requestId/status', async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  try {
    const requestRef = db.collection('maintenanceRequests').doc(requestId);
    await requestRef.update({ status });

    // Map maintenance request statuses to booking statuses
    let bookingStatus = status;
    if (status === 'in progress') {
      bookingStatus = 'approved';
    } else if (status === 'resolved') {
      bookingStatus = 'completed';
    }

    // Also update the linked booking's status to keep in sync
    const requestDoc = await requestRef.get();
    if (requestDoc.exists) {
      const requestData = requestDoc.data();
      if (requestData.bookingId) {
        const bookingRef = db.collection('bookings').doc(requestData.bookingId);
        await bookingRef.update({ status: bookingStatus });
      }
    }

    res.json({ message: 'Request status updated' });
  } catch (error) {
    console.error('Error in maintenanceRequests route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign staff to request
router.put('/:requestId/assignStaff', async (req, res) => {
  const { requestId } = req.params;
  const { staffId } = req.body;
  if (!staffId) {
    return res.status(400).json({ error: 'staffId is required' });
  }
  try {
    await db.collection('maintenanceRequests').doc(requestId).update({ assignedStaff: staffId });
    res.json({ message: 'Staff assigned to request' });
  } catch (error) {
    console.error('Error in maintenanceRequests route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save note to request
router.put('/:requestId/notes', async (req, res) => {
  const { requestId } = req.params;
  const { note } = req.body;
  if (!note) {
    return res.status(400).json({ error: 'Note is required' });
  }
  try {
    await db.collection('maintenanceRequests').doc(requestId).update({ notes: note });
    res.json({ message: 'Note saved to request' });
  } catch (error) {
    console.error('Error in maintenanceRequests route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

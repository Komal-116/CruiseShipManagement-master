const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// Get service availability
router.get('/availability', async (req, res) => {
  try {
    const docRef = db.collection('serviceAvailability').doc('default');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Service availability not found' });
    }
    res.json(docSnap.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service availability
router.patch('/availability', async (req, res) => {
  const updateData = req.body;
  try {
    const docRef = db.collection('serviceAvailability').doc('default');
    await docRef.set(updateData, { merge: true });
    res.json({ message: 'Service availability updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

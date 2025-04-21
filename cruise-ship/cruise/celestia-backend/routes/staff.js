const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// Get staff list
router.get('/', async (req, res) => {
  try {
    const staffSnapshot = await db.collection('staff').get();
    const staffList = [];
    staffSnapshot.forEach(doc => {
      staffList.push({ id: doc.id, ...doc.data() });
    });
    res.json(staffList);
  } catch (error) {
    console.error('Error in staff route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

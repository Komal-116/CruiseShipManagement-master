const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const db = admin.firestore();

// Get all users with Firestore user data
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve user and assign role
router.post('/:userId/approve', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  try {
    await db.collection('users').doc(userId).update({
      approved: true,
      role: role,
    });
    res.json({ message: 'User approved and role assigned' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable user
router.post('/:userId/disable', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.collection('users').doc(userId).update({
      disabled: true,
    });
    res.json({ message: 'User disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.collection('users').doc(userId).delete();
    // Also delete from Firebase Authentication
    await admin.auth().deleteUser(userId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You need to provide this file with your Firebase service account credentials

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No authorization header or invalid format');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes placeholder
app.get('/', (req, res) => {
  res.send('Celestia Backend API is running');
});

// Import user routes
const userRoutes = require('./routes/users');
app.use('/api/users', authenticateToken, userRoutes);

// Import booking routes
const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', authenticateToken, bookingRoutes);

// Import service routes
const serviceRoutes = require('./routes/services');
app.use('/api/services', authenticateToken, serviceRoutes);

// Import maintenanceRequests routes
const maintenanceRequestsRoutes = require('./routes/maintenanceRequests');
app.use('/api/maintenanceRequests', authenticateToken, maintenanceRequestsRoutes);

// Import staff routes
const staffRoutes = require('./routes/staff');
app.use('/api/staff', authenticateToken, staffRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

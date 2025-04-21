const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createServiceAvailability() {
  const docRef = db.collection('serviceAvailability').doc('default');
  const data = {
    catering: true,
    roomBooking: true,
    entertainment: true,
    excursions: true,
    cook: true,
    medical: true,
    salonSpa: true,
    fitness: true,
    movie: true,
    resort: true,
    facilityMaintenance: true,
    stationeryRequests: true,
  };

  try {
    await docRef.set(data);
    console.log('Service availability document created successfully.');
  } catch (error) {
    console.error('Error creating service availability document:', error);
  }
}

createServiceAvailability();

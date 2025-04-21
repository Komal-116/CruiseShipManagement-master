const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const staffMembers = [
  { name: 'Arjun Kumar', role: 'Technician' },
  { name: 'Priya Sharma', role: 'Electrician' },
  { name: 'Ravi Patel', role: 'Plumber' },
  { name: 'Sneha Gupta', role: 'Carpenter' },
  { name: 'Amit Singh', role: 'Cleaner' },
  { name: 'Neha Joshi', role: 'Security' },
  { name: 'Vikram Rao', role: 'Receptionist' },
  { name: 'Anjali Mehta', role: 'IT Support' },
  { name: 'Suresh Nair', role: 'Maintenance' },
  { name: 'Kavita Desai', role: 'Supervisor Assistant' },
];

async function initStaff() {
  try {
    for (const staff of staffMembers) {
      const docRef = db.collection('staff').doc();
      await docRef.set(staff);
      console.log(`Added staff: ${staff.name}`);
    }
    console.log('Staff initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing staff:', error);
    process.exit(1);
  }
}

initStaff();

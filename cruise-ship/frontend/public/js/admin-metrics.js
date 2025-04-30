const metricsContainer = document.getElementById('metrics-container');

async function getCount(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.size;
  } catch (error) {
    console.error(`Error fetching ${collectionName} count:`, error);
    return 0;
  }
}

export async function loadMetrics() {
  if (!metricsContainer) return;
  metricsContainer.innerHTML = 'Loading metrics...';

  const [usersCount, staffCount, servicesCount, bookingsCount] = await Promise.all([
    getCount('users'),
    getCount('users'), // will filter staff separately below
    getCount('services'),
    getCount('bookings')
  ]);

  // Get staff count separately
  let staffCountFiltered = 0;
  try {
    const staffSnapshot = await db.collection('users').where('role', '==', 'staff').get();
    staffCountFiltered = staffSnapshot.size;
  } catch (error) {
    console.error('Error fetching staff count:', error);
  }

  const html = `
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card text-white bg-primary">
          <div class="card-body">
            <h5 class="card-title">Total Users</h5>
            <p class="card-text fs-3">${usersCount}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-white bg-success">
          <div class="card-body">
            <h5 class="card-title">Total Staff</h5>
            <p class="card-text fs-3">${staffCountFiltered}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-white bg-info">
          <div class="card-body">
            <h5 class="card-title">Total Services</h5>
            <p class="card-text fs-3">${servicesCount}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-white bg-warning">
          <div class="card-body">
            <h5 class="card-title">Total Bookings</h5>
            <p class="card-text fs-3">${bookingsCount}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  metricsContainer.innerHTML = html;
}

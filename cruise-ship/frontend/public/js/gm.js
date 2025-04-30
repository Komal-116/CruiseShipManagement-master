// gm.js - General Manager dashboard functionality: reports on bookings, services, and revenue

document.addEventListener('DOMContentLoaded', () => {
  const reportsContainer = document.getElementById('reports-container');

  async function loadReports() {
    reportsContainer.innerHTML = 'Loading reports...';
    try {
      // Total bookings count
      const bookingsSnapshot = await db.collection('bookings').get();
      const totalBookings = bookingsSnapshot.size;

      // Completed services count
      const completedBookings = bookingsSnapshot.docs.filter(doc => doc.data().status === 'completed').length;

      // Total revenue (sum of payments with status 'paid')
      const paymentsSnapshot = await db.collection('payments').where('paymentStatus', '==', 'paid').get();
      let totalRevenue = 0;
      paymentsSnapshot.forEach(doc => {
        totalRevenue += doc.data().amount || 0;
      });

      const html = `
        <ul class="list-group">
          <li class="list-group-item">Total Bookings: <strong>${totalBookings}</strong></li>
          <li class="list-group-item">Completed Services: <strong>${completedBookings}</strong></li>
          <li class="list-group-item">Total Revenue: <strong>$${totalRevenue.toFixed(2)}</strong></li>
        </ul>
      `;
      reportsContainer.innerHTML = html;
    } catch (error) {
      reportsContainer.innerHTML = `<p>Error loading reports: ${error.message}</p>`;
    }
  }

  loadReports();
});

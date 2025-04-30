// bookings.js - Fetch and display user bookings with cancel functionality

document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookings-list');

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '../login.html';
      return;
    }
    await loadBookings(user.uid);
  });

  async function loadBookings(userId) {
    bookingsList.innerHTML = 'Loading bookings...';
    try {
      const snapshot = await db.collection('bookings').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      if (snapshot.empty) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
      }
      let html = '<table class="table table-striped"><thead><tr><th>Service</th><th>Subcategory</th><th>Item</th><th>Price</th><th>Quantity</th><th>Status</th><th>Payment Status</th><th>Actions</th></tr></thead><tbody>';
      snapshot.forEach(doc => {
        const booking = doc.data();
        const bookingId = doc.id;
        const paymentStatus = booking.paymentId ? 'Paid' : 'Pending';
        const quantity = booking.quantity || 1;
        html += `<tr>
          <td>${booking.service}</td>
          <td>${booking.subcategory}</td>
          <td>${booking.item}</td>
          <td>${booking.price}</td>
          <td>${quantity}</td>
          <td>${booking.status}</td>
          <td>${paymentStatus}</td>
          <td>`;
        if (booking.status !== 'cancelled') {
          html += `<button class="btn btn-danger btn-sm cancel-booking-btn" data-id="${bookingId}">Cancel</button>`;
        } else {
          html += 'Cancelled';
        }
        html += `</td></tr>`;
      });
      html += '</tbody></table>';
      bookingsList.innerHTML = html;

      // Attach event listeners for cancel buttons
      document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const bookingId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to cancel this booking?')) {
            try {
              await db.collection('bookings').doc(bookingId).update({ status: 'cancelled' });
              alert('Booking cancelled.');
              loadBookings(userId);
            } catch (error) {
              alert('Error cancelling booking: ' + error.message);
            }
          }
        });
      });
    } catch (error) {
      bookingsList.innerHTML = `<p>Error loading bookings: ${error.message}</p>`;
    }
  }
});

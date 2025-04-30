const pendingBookingsList = document.getElementById('pending-bookings-list');

async function populateStaffOptions() {
  const snapshot = await db.collection('users').where('role', '==', 'staff').get();
  const staffOptions = [];
  snapshot.forEach(doc => {
    const user = doc.data();
    staffOptions.push(`<option value="${doc.id}">${user.name}</option>`);
  });
  return staffOptions.join('');
}

export async function loadBookings() {
  pendingBookingsList.innerHTML = 'Loading pending bookings...';
  try {
    const snapshot = await db.collection('bookings').where('status', 'in', ['pending', 'assigned']).get();
    if (snapshot.empty) {
      pendingBookingsList.innerHTML = '<p>No pending bookings found.</p>';
      return;
    }
    const pendingBookings = [];
    snapshot.forEach(doc => {
      const booking = doc.data();
      pendingBookings.push({ id: doc.id, ...booking });
    });

    const staffOptionsHtml = await populateStaffOptions();

    let html = '<table class="table table-striped table-sm"><thead><tr><th>User ID</th><th>Service Name</th><th>Status</th><th>Payment ID</th><th>Assign Staff</th></tr></thead><tbody>';
    const displayBookings = pendingBookings.slice(0, 5);
    for (const booking of displayBookings) {
      // Use service field from booking if available
      const serviceName = booking.service || 'N/A';

      const paymentIdDisplay = booking.paymentId && booking.paymentId.trim() !== '' ? booking.paymentId : 'N/A';
      html += `<tr>
        <td>${booking.userId || 'N/A'}</td>
        <td>${serviceName}</td>
        <td>${booking.status || 'N/A'}</td>
        <td>${paymentIdDisplay}</td>
        <td>`;
      if (booking.status === 'pending') {
        html += `<select class="form-select form-select-sm assign-staff-select" data-booking-id="${booking.id}">
            <option value="">Select Staff</option>
            ${staffOptionsHtml}
          </select>
          <button class="btn btn-sm btn-success assign-staff-btn" data-booking-id="${booking.id}">Assign</button>`;
      } else {
        html += 'Staff Assigned';
      }
      html += `</td></tr>`;
    }
    html += '</tbody></table>';
    pendingBookingsList.innerHTML = html;

    // Attach event listeners for assign buttons
    pendingBookingsList.querySelectorAll('.assign-staff-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const bookingId = button.getAttribute('data-booking-id');
        const select = pendingBookingsList.querySelector(`select.assign-staff-select[data-booking-id="${bookingId}"]`);
        const staffId = select.value;
        if (!staffId) {
          alert('Please select a staff member to assign.');
          return;
        }
        try {
          await db.collection('staffAssignments').add({
            serviceId: bookingId,
            staffId,
            taskStatus: 'assigned'
          });
          // Update booking status to assigned
          await db.collection('bookings').doc(bookingId).update({
            status: 'assigned'
          });
          alert('Staff assigned to booking successfully.');
          loadBookings();
        } catch (error) {
          alert('Error assigning staff: ' + error.message);
        }
      });
    });
  } catch (error) {
    pendingBookingsList.innerHTML = `<p>Error loading pending bookings: ${error.message}</p>`;
  }
}

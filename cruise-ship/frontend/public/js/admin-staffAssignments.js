const staffAssignmentsList = document.getElementById('staff-assignments-list');

export async function loadStaffAssignments() {
  staffAssignmentsList.innerHTML = 'Loading staff assignments...';
  try {
    const snapshot = await db.collection('staffAssignments').get();
    if (snapshot.empty) {
      staffAssignmentsList.innerHTML = '<p>No staff assignments found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>Staff Name</th><th>Service Name</th><th>Subcategory</th><th>Task Status</th></tr></thead><tbody>';
    for (const doc of snapshot.docs) {
      const assignment = doc.data();

      // Fetch staff user document
      const staffDoc = await db.collection('users').doc(assignment.staffId).get();
      const staffName = staffDoc.exists ? staffDoc.data().name : 'Unknown Staff';

      // Fetch booking document to get service name and subcategory
      const bookingDoc = await db.collection('bookings').doc(assignment.serviceId).get();
      let service = 'Unknown Service';
      let subcategory = 'Unknown Subcategory';
      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        service = bookingData.service || serviceName;
        subcategory = bookingData.subcategory || subcategory;
      }

      html += `<tr>
        <td>${staffName}</td>
        <td>${service}</td>
        <td>${subcategory}</td>
        <td>${assignment.taskStatus}</td>
      </tr>`;
    }
    html += '</tbody></table>';
    staffAssignmentsList.innerHTML = html;
  } catch (error) {
    staffAssignmentsList.innerHTML = `<p>Error loading staff assignments: ${error.message}</p>`;
  }
}
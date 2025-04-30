const servicesList = document.getElementById('services-list');
const bookingsList = document.getElementById('bookings-list');
const staffAssignmentsList = document.getElementById('staff-assignments-list');
const paymentsList = document.getElementById('payments-list');

const addServiceBtn = document.getElementById('add-service-btn');
const assignServiceBtn = document.getElementById('assign-service-btn');

const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
const assignServiceModal = new bootstrap.Modal(document.getElementById('assignServiceModal'));

const serviceForm = document.getElementById('service-form');
const assignServiceForm = document.getElementById('assign-service-form');

let editingServiceId = null;

// Load all services
async function loadServices() {
  servicesList.innerHTML = 'Loading services...';
  try {
    const snapshot = await db.collection('services').get();
    if (snapshot.empty) {
      servicesList.innerHTML = '<p>No services found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>Name</th><th>Category</th><th>Subcategory</th><th>Description</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    snapshot.forEach(docSnap => {
      const service = docSnap.data();
      const price = service.price !== undefined ? service.price.toFixed(2) : 'N/A';
      html += `<tr>
        <td>${service.name || 'N/A'}</td>
        <td>${service.category || 'N/A'}</td>
        <td>${service.subcategory || 'N/A'}</td>
        <td>${service.description || 'N/A'}</td>
        <td>${price}</td>
        <td>${service.status || 'N/A'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-service-btn" data-id="${docSnap.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-service-btn" data-id="${docSnap.id}">Delete</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    servicesList.innerHTML = html;

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll('.edit-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        editService(id);
      });
    });
    document.querySelectorAll('.delete-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteService(id);
      });
    });
  } catch (error) {
    servicesList.innerHTML = `<p>Error loading services: ${error.message}</p>`;
  }
}

// Load all bookings
async function loadBookings() {
  bookingsList.innerHTML = 'Loading bookings...';
  try {
    const snapshot = await db.collection('bookings').get();
    if (snapshot.empty) {
      bookingsList.innerHTML = '<p>No bookings found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>User ID</th><th>Service ID</th><th>Status</th><th>Payment ID</th></tr></thead><tbody>';
    snapshot.forEach(doc => {
      const booking = doc.data();
      const serviceId = booking.serviceId || 'N/A';
      html += `<tr>
        <td>${booking.userId || 'N/A'}</td>
        <td>${serviceId}</td>
        <td>${booking.status || 'N/A'}</td>
        <td>${booking.paymentId || ''}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    bookingsList.innerHTML = html;
  } catch (error) {
    bookingsList.innerHTML = `<p>Error loading bookings: ${error.message}</p>`;
  }
}

// Load all staff assignments
async function loadStaffAssignments() {
  staffAssignmentsList.innerHTML = 'Loading staff assignments...';
  try {
    const snapshot = await db.collection('staffAssignments').get();
    if (snapshot.empty) {
      staffAssignmentsList.innerHTML = '<p>No staff assignments found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>Staff ID</th><th>Service ID</th><th>Task Status</th></tr></thead><tbody>';
    snapshot.forEach(doc => {
      const assignment = doc.data();
      html += `<tr>
        <td>${assignment.staffId}</td>
        <td>${assignment.serviceId}</td>
        <td>${assignment.taskStatus}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    staffAssignmentsList.innerHTML = html;
  } catch (error) {
    staffAssignmentsList.innerHTML = `<p>Error loading staff assignments: ${error.message}</p>`;
  }
}

// Load all payments
async function loadPayments() {
  paymentsList.innerHTML = 'Loading payments...';
  try {
    const snapshot = await db.collection('payments').get();
    if (snapshot.empty) {
      paymentsList.innerHTML = '<p>No payments found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>User ID</th><th>Amount</th><th>Service ID</th><th>Payment Status</th></tr></thead><tbody>';
    snapshot.forEach(doc => {
      const payment = doc.data();
      html += `<tr>
        <td>${payment.userId}</td>
        <td>${payment.amount.toFixed(2)}</td>
        <td>${payment.serviceId}</td>
        <td>${payment.paymentStatus}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    paymentsList.innerHTML = html;
  } catch (error) {
    paymentsList.innerHTML = `<p>Error loading payments: ${error.message}</p>`;
  }
}

// Add new service button click
addServiceBtn.addEventListener('click', () => {
  editingServiceId = null;
  serviceForm.reset();
  // Clear subcategory options when category changes
  const subcategorySelect = document.getElementById('service-subcategory');
  subcategorySelect.innerHTML = '<option value="" disabled selected>Select subcategory</option>';
  serviceModal.show();
});

// Update subcategory options based on selected category
document.getElementById('service-category').addEventListener('change', (e) => {
  const category = e.target.value;
  const subcategorySelect = document.getElementById('service-subcategory');
  subcategorySelect.innerHTML = '<option value="" disabled selected>Select subcategory</option>';
  let subcategories = [];
  switch (category) {
    case 'food':
      subcategories = ['Lunch', 'Dinner', 'Snacks', 'Tiffin'];
      break;
    case 'gym':
      subcategories = ['Personal Training', 'Group Classes', 'Equipment Rental'];
      break;
    case 'salon':
      subcategories = ['Hair', 'Nails', 'Facial', 'Massage'];
      break;
    case 'maintenance':
      subcategories = ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning'];
      break;
    case 'stationary':
      subcategories = ['Office Supplies', 'Art Supplies', 'School Supplies'];
      break;
    default:
      subcategories = [];
  }
  subcategories.forEach(subcat => {
    const option = document.createElement('option');
    option.value = subcat.toLowerCase();
    option.textContent = subcat;
    subcategorySelect.appendChild(option);
  });
});

// Assign service button click
assignServiceBtn.addEventListener('click', async () => {
  await populateAssignServiceOptions();
  await populateAssignStaffOptions();
  assignServiceForm.reset();
  assignServiceModal.show();
});

// Populate service options for assignment
async function populateAssignServiceOptions() {
  const select = document.getElementById('assign-service-select');
  select.innerHTML = '<option value="" disabled selected>Loading services...</option>';
  try {
    const snapshot = await db.collection('services').get();
    if (snapshot.empty) {
      select.innerHTML = '<option value="" disabled>No services available</option>';
      return;
    }
    let options = '<option value="" disabled selected>Select service</option>';
    snapshot.forEach(doc => {
      const service = doc.data();
      options += `<option value="${doc.id}">${service.name} (${service.type})</option>`;
    });
    select.innerHTML = options;
  } catch (error) {
    select.innerHTML = `<option value="" disabled>Error loading services</option>`;
  }
}

// Populate staff options for assignment
async function populateAssignStaffOptions() {
  const select = document.getElementById('assign-staff-select');
  select.innerHTML = '<option value="" disabled selected>Loading staff...</option>';
  try {
    const snapshot = await db.collection('users').where('role', '==', 'staff').get();
    if (snapshot.empty) {
      select.innerHTML = '<option value="" disabled>No staff available</option>';
      return;
    }
    let options = '<option value="" disabled selected>Select staff</option>';
    snapshot.forEach(doc => {
      const user = doc.data();
      options += `<option value="${doc.id}">${user.name}</option>`;
    });
    select.innerHTML = options;
  } catch (error) {
    select.innerHTML = `<option value="" disabled>Error loading staff</option>`;
  }
}

// Edit service
async function editService(id) {
  try {
    const doc = await db.collection('services').doc(id).get();
    if (!doc.exists) {
      alert('Service not found');
      return;
    }
    const service = doc.data();
    editingServiceId = id;
    document.getElementById('service-id').value = id;
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-type').value = service.type;
    document.getElementById('service-description').value = service.description;
    document.getElementById('service-price').value = service.price;
    document.getElementById('service-status').value = service.status;
    serviceModal.show();
  } catch (error) {
    alert('Error fetching service: ' + error.message);
  }
}

// Delete service
async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    await db.collection('services').doc(id).delete();
    alert('Service deleted');
    loadServices();
  } catch (error) {
    alert('Error deleting service: ' + error.message);
  }
}

// Handle service form submit (add or update)
serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('service-name').value.trim();
  const category = document.getElementById('service-category').value;
  const subcategory = document.getElementById('service-subcategory').value;
  const description = document.getElementById('service-description').value.trim();
  const price = parseFloat(document.getElementById('service-price').value);
  const status = document.getElementById('service-status').value;

  try {
    if (editingServiceId) {
      await db.collection('services').doc(editingServiceId).update({
        name, category, subcategory, description, price, status
      });
      alert('Service updated');
    } else {
      await db.collection('services').add({
        name, category, subcategory, description, price, status
      });
      alert('Service added');
    }
    serviceModal.hide();
    loadServices();
  } catch (error) {
    alert('Error saving service: ' + error.message);
  }
});

// Handle assign service form submit
assignServiceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const serviceId = document.getElementById('assign-service-select').value;
  const staffId = document.getElementById('assign-staff-select').value;

  try {
    await db.collection('staffAssignments').add({
      serviceId,
      staffId,
      taskStatus: 'assigned'
    });
    alert('Service assigned to staff');
    assignServiceModal.hide();
    loadStaffAssignments();
  } catch (error) {
    alert('Error assigning service: ' + error.message);
  }
});

// Initial load
loadServices();
loadBookings();
loadStaffAssignments();
loadPayments();

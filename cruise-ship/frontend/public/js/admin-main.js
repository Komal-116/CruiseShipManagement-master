import { loadServices, editService, deleteService } from './admin-services.js';
import { loadBookings } from './admin-bookings.js';
import { loadStaffAssignments } from './admin-staffAssignments.js';
import { loadPayments } from './admin-payments.js';
import { loadMetrics } from './admin-metrics.js';

const addServiceBtn = document.getElementById('add-service-btn');
const assignServiceBtn = document.getElementById('assign-service-btn');
const assignServiceForm = document.getElementById('assign-service-form');
const assignServiceModal = new bootstrap.Modal(document.getElementById('assignServiceModal'));

addServiceBtn.addEventListener('click', () => {
  // Reset the service form fields
  document.getElementById('service-id').value = '';
  document.getElementById('service-name').value = '';
  document.getElementById('service-category').value = '';
  document.getElementById('service-status').value = 'active';
  // Clear subcategories list
  const subcategoriesList = document.getElementById('subcategories-list');
  subcategoriesList.innerHTML = '';
  // Show the service modal
  const serviceModalElement = document.getElementById('serviceModal');
  const serviceModal = bootstrap.Modal.getInstance(serviceModalElement) || new bootstrap.Modal(serviceModalElement);
  serviceModal.show();
});

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
      options += `<option value="${doc.id}">${service.name} (${service.type || ''})</option>`;
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

// Initial load calls
loadMetrics();
loadServices();
loadBookings();
loadStaffAssignments();
loadPayments();

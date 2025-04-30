// supervisor.js - Supervisor dashboard functionality: view assigned services, manage staff, update service status

document.addEventListener('DOMContentLoaded', () => {
  const assignedServicesList = document.getElementById('assigned-services-list');
  const staffList = document.getElementById('staff-list');
  const addStaffBtn = document.getElementById('add-staff-btn');
  const staffModal = new bootstrap.Modal(document.getElementById('staffModal'));
  const staffForm = document.getElementById('staff-form');

  let editingStaffId = null;

  // Load assigned services for supervisor
  async function loadAssignedServices() {
    assignedServicesList.innerHTML = 'Loading assigned services...';
    try {
      // Assuming supervisor can see all services for now
      const snapshot = await db.collection('staffAssignments').get();
      if (snapshot.empty) {
        assignedServicesList.innerHTML = '<p>No assigned services found.</p>';
        return;
      }
      let html = '<table class="table table-striped"><thead><tr><th>Staff ID</th><th>Service ID</th><th>Task Status</th><th>Actions</th></tr></thead><tbody>';
      snapshot.forEach(doc => {
        const assignment = doc.data();
        html += `<tr>
          <td>${assignment.staffId}</td>
          <td>${assignment.serviceId}</td>
          <td>${assignment.taskStatus}</td>
          <td>
            <button class="btn btn-sm btn-primary update-status-btn" data-id="${doc.id}">Update Status</button>
          </td>
        </tr>`;
      });
      html += '</tbody></table>';
      assignedServicesList.innerHTML = html;

      // Attach event listeners for update status buttons
      document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          updateTaskStatus(id);
        });
      });
    } catch (error) {
      assignedServicesList.innerHTML = `<p>Error loading assigned services: ${error.message}</p>`;
    }
  }

  // Load staff list
  async function loadStaff() {
    staffList.innerHTML = 'Loading staff...';
    try {
      const snapshot = await db.collection('users').where('role', 'in', ['staff', 'cook']).get();
      if (snapshot.empty) {
        staffList.innerHTML = '<p>No staff found.</p>';
        return;
      }
      let html = '<table class="table table-striped"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
      snapshot.forEach(doc => {
        const staff = doc.data();
        html += `<tr>
          <td>${staff.name}</td>
          <td>${staff.email}</td>
          <td>${staff.role}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-staff-btn" data-id="${doc.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-staff-btn" data-id="${doc.id}">Delete</button>
          </td>
        </tr>`;
      });
      html += '</tbody></table>';
      staffList.innerHTML = html;

      // Attach event listeners for edit and delete buttons
      document.querySelectorAll('.edit-staff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          editStaff(id);
        });
      });
      document.querySelectorAll('.delete-staff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          deleteStaff(id);
        });
      });
    } catch (error) {
      staffList.innerHTML = `<p>Error loading staff: ${error.message}</p>`;
    }
  }

  // Add new staff button click
  addStaffBtn.addEventListener('click', () => {
    editingStaffId = null;
    staffForm.reset();
    staffModal.show();
  });

  // Edit staff
  async function editStaff(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      if (!doc.exists) {
        alert('Staff not found');
        return;
      }
      const staff = doc.data();
      editingStaffId = id;
      document.getElementById('staff-id').value = id;
      document.getElementById('staff-name').value = staff.name;
      document.getElementById('staff-email').value = staff.email;
      document.getElementById('staff-role').value = staff.role;
      document.getElementById('staff-status').value = staff.status || 'active';
      staffModal.show();
    } catch (error) {
      alert('Error fetching staff: ' + error.message);
    }
  }

  // Delete staff
  async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await db.collection('users').doc(id).delete();
      alert('Staff deleted');
      loadStaff();
    } catch (error) {
      alert('Error deleting staff: ' + error.message);
    }
  }

  // Handle staff form submit (add or update)
  staffForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('staff-name').value.trim();
    const email = document.getElementById('staff-email').value.trim();
    const role = document.getElementById('staff-role').value;
    const status = document.getElementById('staff-status').value;

    try {
      if (editingStaffId) {
        await db.collection('users').doc(editingStaffId).update({
          name, email, role, status
        });
        alert('Staff updated');
      } else {
        // Create new user with default password (should be reset by user)
        const password = 'defaultPassword123'; // In real app, handle securely
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await db.collection('users').doc(user.uid).set({
          name, email, role, status
        });
        alert('Staff added');
      }
      staffModal.hide();
      loadStaff();
    } catch (error) {
      alert('Error saving staff: ' + error.message);
    }
  });

  // Update task status for staff assignment
  async function updateTaskStatus(assignmentId) {
    const newStatus = prompt('Enter new task status (e.g., assigned, in progress, completed):');
    if (!newStatus) return;
    try {
      await db.collection('staffAssignments').doc(assignmentId).update({
        taskStatus: newStatus
      });
      alert('Task status updated');
      loadAssignedServices();
    } catch (error) {
      alert('Error updating task status: ' + error.message);
    }
  }

  // Initial load
  loadAssignedServices();
  loadStaff();
});

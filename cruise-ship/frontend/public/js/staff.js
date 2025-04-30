// staff.js - Staff dashboard functionality: view assigned services and update task status

document.addEventListener('DOMContentLoaded', () => {
  const assignedServicesList = document.getElementById('assigned-services-list');

  // Check user role and redirect if not 'staff'
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '../login.html';
      return;
    }
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      alert('User data not found.');
      await auth.signOut();
      window.location.href = '../login.html';
      return;
    }
    const userData = userDoc.data();
    if (userData.role !== 'staff') {
      alert('Access denied. Redirecting to your dashboard.');
      switch (userData.role) {
        case 'admin':
          window.location.href = '../dashboards/admin-dashboard.html';
          break;
        case 'supervisor':
          window.location.href = '../dashboards/supervisor-dashboard.html';
          break;
        case 'cook':
          window.location.href = '../dashboards/cook-dashboard.html';
          break;
        case 'user':
          window.location.href = '../dashboards/user-dashboard.html';
          break;
        case 'gm':
          window.location.href = '../dashboards/gm-dashboard.html';
          break;
        default:
          await auth.signOut();
          window.location.href = '../login.html';
      }
      return;
    }
    loadAssignedServices();
  });

  // Load assigned services for current staff user
  async function loadAssignedServices() {
    assignedServicesList.innerHTML = 'Loading assigned services...';
    try {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '../login.html';
        return;
      }
      const snapshot = await db.collection('staffAssignments')
        .where('staffId', '==', user.uid)
        .get();

      if (snapshot.empty) {
        assignedServicesList.innerHTML = '<p>No assigned services found.</p>';
        return;
      }

      let html = '<table class="table table-striped"><thead><tr><th>Service ID</th><th>Task Status</th><th>Update Status</th></tr></thead><tbody>';
      snapshot.forEach(doc => {
        const assignment = doc.data();
        html += `<tr>
          <td>${assignment.serviceId}</td>
          <td>${assignment.taskStatus}</td>
          <td><button class="btn btn-sm btn-primary update-status-btn" data-id="${doc.id}">Update Status</button></td>
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

  // Update task status
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
});

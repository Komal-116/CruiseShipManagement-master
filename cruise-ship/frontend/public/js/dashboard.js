// dashboard.js - common dashboard functionality including logout and auth state check

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');

  // Logout button handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        window.location.href = '../login.html';
      } catch (error) {
        alert('Error during logout: ' + error.message);
      }
    });
  }

  // Check auth state and redirect to login if not authenticated
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '../login.html';
      return;
    }
    // Optionally, you can fetch user role here and verify access to the current dashboard
  });
});

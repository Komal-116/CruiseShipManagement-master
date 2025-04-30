// auth.js - handles signup, login, logout, and password reset

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save additional user info in Firestore
        await db.collection('users').doc(user.uid).set({
          name,
          email,
          role
        });

        alert('Signup successful! Please login.');
        window.location.href = 'login.html';
      } catch (error) {
        alert('Error during signup: ' + error.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          alert('User data not found.');
          await auth.signOut();
          return;
        }
        const userData = userDoc.data();
        const role = userData.role;

        // Redirect based on role
        switch (role) {
          case 'admin':
            window.location.href = 'dashboards/admin-dashboard.html';
            break;
          case 'supervisor':
            window.location.href = 'dashboards/supervisor-dashboard.html';
            break;
          case 'cook':
            window.location.href = 'dashboards/cook-dashboard.html';
            break;
          case 'staff':
            window.location.href = 'dashboards/staff-dashboard.html';
            break;
          case 'gm':
            window.location.href = 'dashboards/gm-dashboard.html';
            break;
        case 'user':
            window.location.href = 'dashboards/user-dashboard.html';
            break;
          default:
            alert('Unknown user role.');
            await auth.signOut();
        }
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();

      try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent. Please check your inbox.');
        window.location.href = 'login.html';
      } catch (error) {
        alert('Error sending password reset email: ' + error.message);
      }
    });
  }
});

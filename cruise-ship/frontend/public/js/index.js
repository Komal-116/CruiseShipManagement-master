// index.js - Handles dynamic form submissions, user authentication, and welcome message display

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const reviewFormContainer = document.getElementById('review-form-container');
  const reviewsCards = document.getElementById('reviews-cards');
  const servicesCards = document.getElementById('services-cards');
  const contactForm = document.getElementById('contact-form');

  // Show welcome message if user is logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      showWelcomeMessage(user);
      loadReviewForm();
    } else {
      clearWelcomeMessage();
      reviewFormContainer.innerHTML = '';
    }
  });

  // Load services dynamically
  async function loadServices() {
    try {
      const snapshot = await db.collection('services').get();
      if (snapshot.empty) {
        servicesCards.innerHTML = '<p class="text-center">No services available.</p>';
        return;
      }
      let html = '';
      snapshot.forEach(doc => {
        const service = doc.data();
        html += `
          <div class="col-md-4">
            <div class="service-card" tabindex="0" role="button" aria-pressed="false" onclick="redirectToDashboard()">
              <img src="${service.image || 'images/service-placeholder.jpg'}" alt="${service.name}" />
              <div class="service-card-body">
                <h5>${service.name}</h5>
                <p>${service.category || ''}</p>
              </div>
            </div>
          </div>
        `;
      });
      servicesCards.innerHTML = html;
    } catch (error) {
      servicesCards.innerHTML = `<p class="text-danger text-center">Error loading services: ${error.message}</p>`;
    }
  }

  // Redirect to dashboard (placeholder)
  window.redirectToDashboard = function() {
    // Redirect logic based on user role or default dashboard
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            const role = doc.data().role;
            switch(role) {
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
                window.location.href = 'login.html';
            }
          } else {
            window.location.href = 'login.html';
          }
        });
      } else {
        window.location.href = 'login.html';
      }
    });
  };

  // Load reviews dynamically
  async function loadReviews() {
    try {
      const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
      if (snapshot.empty) {
        reviewsCards.innerHTML = '<p class="text-center">No reviews yet.</p>';
        return;
      }
      let html = '';
      snapshot.forEach(doc => {
        const review = doc.data();
        html += `
          <div class="col-md-4">
            <div class="review-card">
              <p>"${review.text}"</p>
              <small>- ${review.userName || 'Anonymous'}</small>
            </div>
          </div>
        `;
      });
      reviewsCards.innerHTML = html;
    } catch (error) {
      reviewsCards.innerHTML = `<p class="text-danger text-center">Error loading reviews: ${error.message}</p>`;
    }
  }

  // Show review submission form if user logged in
  function loadReviewForm() {
    reviewFormContainer.innerHTML = `
      <form id="review-form" class="mb-4">
        <div class="mb-3">
          <label for="review-text" class="form-label">Submit Your Review</label>
          <textarea class="form-control" id="review-text" rows="3" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </form>
    `;
    const reviewForm = document.getElementById('review-form');
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = document.getElementById('review-text').value.trim();
      if (!text) return;
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to submit a review.');
        return;
      }
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userName = userDoc.exists ? userDoc.data().name : 'Anonymous';
        await db.collection('reviews').add({
          text,
          userId: user.uid,
          userName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Review submitted successfully.');
        reviewForm.reset();
        loadReviews();
      } catch (error) {
        alert('Error submitting review: ' + error.message);
      }
    });
  }

  // Show welcome message
  function showWelcomeMessage(user) {
    let welcomeDiv = document.getElementById('welcome-message');
    if (!welcomeDiv) {
      welcomeDiv = document.createElement('div');
      welcomeDiv.id = 'welcome-message';
      welcomeDiv.className = 'text-center my-3 text-white bg-primary p-2 rounded';
      document.body.insertBefore(welcomeDiv, document.body.firstChild);
    }
    welcomeDiv.textContent = `Welcome, ${user.email}!`;
  }

  // Clear welcome message
  function clearWelcomeMessage() {
    const welcomeDiv = document.getElementById('welcome-message');
    if (welcomeDiv) {
      welcomeDiv.remove();
    }
  }

  // Handle contact form submission
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }
      try {
        await db.collection('contacts').add({
          name,
          email,
          message,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Your message has been sent. We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        alert('Error sending message: ' + error.message);
      }
    });
  }

  // Initial load
  loadServices();
  loadReviews();
});

document.addEventListener('DOMContentLoaded', () => {
  const servicesList = document.getElementById('services-list');
  const bookingsList = document.getElementById('bookings-list');
  const categorySelect = document.getElementById('category-select');
  const subcategorySelect = document.getElementById('subcategory-select');

  let allServices = [];

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
    if (userData.role !== 'user') {
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
        case 'staff':
          window.location.href = '../dashboards/staff-dashboard.html';
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
    await loadServices();
    loadBookings();
  });

  async function loadServices() {
    servicesList.innerHTML = 'Loading services...';
    try {
      const snapshot = await db.collection('services').get();
      if (snapshot.empty) {
        servicesList.innerHTML = '<p>No services available.</p>';
        return;
      }
      allServices = [];
      snapshot.forEach(doc => {
        const service = doc.data();
        service.id = doc.id;
        allServices.push(service);
      });
      populateCategoryFilter();
      renderServices();
    } catch (error) {
      servicesList.innerHTML = `<p>Error loading services: ${error.message}</p>`;
    }
  }

  async function bookItem(serviceId, subcategory, item, price) {
    const user = auth.currentUser;
    if (!user) {
      alert('Please login to book a service.');
      window.location.href = '../login.html';
      return;
    }

    try {
      // Find service name from allServices by serviceId
      const serviceObj = allServices.find(s => s.id === serviceId);
      const serviceName = serviceObj ? serviceObj.name : '';

      const bookingRef = await db.collection('bookings').add({
        userId: user.uid,
        serviceId,
        service: serviceName, // Store service name along with serviceId
        subcategory,
        item,
        price,
        status: 'pending',
        paymentId: null,
        createdAt: new Date()
      });
      const bookingId = bookingRef.id;

      // Check service category for food and assign to head cook
      if (serviceObj && serviceObj.category && serviceObj.category.toLowerCase() === 'food') {
        const headCookSnapshot = await db.collection('users').where('role', '==', 'headcook').limit(1).get();
        if (!headCookSnapshot.empty) {
          const headCookDoc = headCookSnapshot.docs[0];
          const headCookId = headCookDoc.id;
          await db.collection('staffAssignments').add({
            serviceId: bookingId,
            staffId: headCookId,
            taskStatus: 'assigned'
          });
        }
      }

      const url = new URL('../pages/payment.html', window.location.origin);
      url.searchParams.append('bookingId', bookingId);
      url.searchParams.append('item', item);
      url.searchParams.append('price', price);
      window.location.href = url.toString();
    } catch (error) {
      alert('Error creating booking: ' + error.message);
    }
  }

  function populateCategoryFilter() {
    const categories = [...new Set(allServices.map(s => s.category))].filter(Boolean);
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      categorySelect.innerHTML += `<option value="${cat}">${capitalize(cat)}</option>`;
    });
    subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
    subcategorySelect.disabled = true;
  }

  function populateSubcategoryFilter(category) {
    if (!category) {
      subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
      subcategorySelect.disabled = true;
      return;
    }
    const servicesInCategory = allServices.filter(s => s.category === category);
    const subcategoriesSet = new Set();
    servicesInCategory.forEach(service => {
      if (service.subcategories && service.subcategories.length > 0) {
        service.subcategories.forEach(subcat => {
          if (subcat.name) subcategoriesSet.add(subcat.name);
        });
      }
    });
    const subcategories = Array.from(subcategoriesSet);
    subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
    subcategories.forEach(subcat => {
      subcategorySelect.innerHTML += `<option value="${subcat}">${capitalize(subcat)}</option>`;
    });
    subcategorySelect.disabled = false;
  }

  function renderServices() {
    const selectedCategory = categorySelect.value;
    const selectedSubcategory = subcategorySelect.value;
    let filteredServices = allServices;

    if (selectedCategory) {
      filteredServices = filteredServices.filter(s => s.category === selectedCategory);
    }

    servicesList.innerHTML = '';
    if (filteredServices.length === 0) {
      servicesList.innerHTML = '<p>No services match the selected filters.</p>';
      return;
    }

    filteredServices.forEach(service => {
      let serviceHtml = `<h3>${service.name}</h3>`;
      if (service.subcategories && service.subcategories.length > 0) {
        let subcatsToShow = service.subcategories;
        if (selectedSubcategory) {
          subcatsToShow = subcatsToShow.filter(sc => sc.name === selectedSubcategory);
        }
        if (subcatsToShow.length === 0) {
          serviceHtml += '<p>No subcategories available for selected filter.</p>';
        } else {
          subcatsToShow.forEach(subcat => {
            serviceHtml += `<h5>${subcat.name}</h5>`;
            if (subcat.items && subcat.items.length > 0) {
              serviceHtml += '<div class="row">';
              subcat.items.forEach(item => {
                serviceHtml += `
                  <div class="col-md-4 mb-3">
                    <div class="card h-100">
                      <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${item.name}</h6>
                        <p class="card-text">Price: ${item.price}</p>
                        <button class="btn btn-primary mt-auto book-item-btn" 
                          data-service="${service.id}" 
                          data-subcategory="${subcat.name}" 
                          data-item="${item.name}" 
                          data-price="${item.price}">
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              });
              serviceHtml += '</div>';
            } else {
              serviceHtml += '<p>No items available.</p>';
            }
          });
        }
      } else {
        serviceHtml += '<p>No subcategories available.</p>';
      }
      servicesList.innerHTML += serviceHtml;
    });

    document.querySelectorAll('.book-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const serviceId = btn.getAttribute('data-service');
        const subcategory = btn.getAttribute('data-subcategory');
        const item = btn.getAttribute('data-item');
        const price = btn.getAttribute('data-price');
        bookItem(serviceId, subcategory, item, price);
      });
    });
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    populateSubcategoryFilter(selectedCategory);
    renderServices();
  });

  subcategorySelect.addEventListener('change', () => {
    renderServices();
  });

  async function loadBookings() {
    bookingsList.innerHTML = 'Loading bookings...';
    try {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '../login.html';
        return;
      }
      const snapshot = await db.collection('bookings').where('userId', '==', user.uid).orderBy('createdAt', 'desc').get();
      if (snapshot.empty) {
        bookingsList.innerHTML = '<p>No bookings found.</p>';
        return;
      }
      let html = '<table class="table table-striped"><thead><tr><th>Service</th><th>Subcategory</th><th>Item</th><th>Price</th><th>Status</th><th>Payment Status</th><th>Actions</th></tr></thead><tbody>';
      snapshot.forEach(doc => {
        const booking = doc.data();
        const bookingId = doc.id;
        const paymentStatus = booking.paymentId ? 'Paid' : 'Pending';
        html += `<tr>
          <td>${booking.service}</td>
          <td>${booking.subcategory}</td>
          <td>${booking.item}</td>
          <td>${booking.price}</td>
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

      document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const bookingId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to cancel this booking?')) {
            try {
              await db.collection('bookings').doc(bookingId).update({ status: 'cancelled' });
              alert('Booking cancelled.');
              loadBookings();
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

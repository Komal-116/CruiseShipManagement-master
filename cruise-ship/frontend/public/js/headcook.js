// headcook.js - Head Cook dashboard functionality: view food-related bookings and update kitchen order status

document.addEventListener('DOMContentLoaded', () => {
  const foodOrdersList = document.getElementById('food-orders-list');
  const foodItemsList = document.getElementById('food-items-list');
  const addFoodItemBtn = document.getElementById('add-food-item-btn');
  const foodItemModal = new bootstrap.Modal(document.getElementById('foodItemModal'));
  const foodItemForm = document.getElementById('food-item-form');

  let editingFoodItemIndex = null;
  let foodServiceDocId = null;
  let foodServiceData = null;

  // Load food-related bookings for head cook
  async function loadFoodOrders() {
    foodOrdersList.innerHTML = 'Loading food orders...';
    try {
      const user = auth.currentUser;
      if (!user) {
        foodOrdersList.innerHTML = '<p>Please login to view orders.</p>';
        return;
      }

      const bookingsSnapshot = await db.collection('bookings')
        .where('service', '==', 'Food')
        .where('status', '!=', 'cancelled')
        .orderBy('status')
        .get();

      if (bookingsSnapshot.empty) {
        foodOrdersList.innerHTML = '<p>No food orders found.</p>';
        return;
      }

      let html = '<table class="table table-striped"><thead><tr><th>User ID</th><th>Service ID</th><th>Service Name</th><th>Item</th><th>Price</th><th>Status</th><th>Update Status</th></tr></thead><tbody>';
      bookingsSnapshot.forEach(doc => {
        const booking = doc.data();
        html += `<tr>
          <td>${booking.userId}</td>
          <td>${booking.serviceId}</td>
          <td>${booking.service || ''}</td>
          <td>${booking.item}</td>
          <td>${booking.price}</td>
          <td>${booking.status}</td>
          <td><button class="btn btn-sm btn-primary update-status-btn" data-id="${doc.id}">Update Status</button></td>
        </tr>`;
      });
      html += '</tbody></table>';
      foodOrdersList.innerHTML = html;

      document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          updateOrderStatus(id);
        });
      });
    } catch (error) {
      foodOrdersList.innerHTML = `<p>Error loading food orders: ${error.message}</p>`;
    }
  }

  // Update kitchen order status
  async function updateOrderStatus(bookingId) {
    const newStatus = prompt('Enter new order status (e.g., preparing, ready, served):');
    if (!newStatus) return;
    try {
      await db.collection('bookings').doc(bookingId).update({
        status: newStatus
      });
      alert('Order status updated');
      loadFoodOrders();
    } catch (error) {
      alert('Error updating order status: ' + error.message);
    }
  }

  // Load food items from services collection
  async function loadFoodItems() {
    foodItemsList.innerHTML = 'Loading food items...';
    try {
      const servicesSnapshot = await db.collection('services').where('name', '==', 'Food').get();
      if (servicesSnapshot.empty) {
        foodItemsList.innerHTML = '<p>No food service found.</p>';
        return;
      }
      const serviceDoc = servicesSnapshot.docs[0];
      foodServiceDocId = serviceDoc.id;
      foodServiceData = serviceDoc.data();

      const allItems = [];
      if (foodServiceData.subcategories && Array.isArray(foodServiceData.subcategories)) {
        foodServiceData.subcategories.forEach(subcat => {
          if (subcat.items && Array.isArray(subcat.items)) {
            subcat.items.forEach(item => {
              allItems.push({
                subcategory: subcat.name,
                name: item.name,
                price: item.price
              });
            });
          }
        });
      }

      if (allItems.length === 0) {
        foodItemsList.innerHTML = '<p>No food items found.</p>';
        return;
      }

      let html = '<table class="table table-striped"><thead><tr><th>Name</th><th>Subcategory</th><th>Price</th><th>Actions</th></tr></thead><tbody>';
      allItems.forEach((item, index) => {
        html += `<tr>
          <td>${item.name}</td>
          <td>${item.subcategory}</td>
          <td>${item.price}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-food-item-btn" data-index="${index}">Edit</button>
            <button class="btn btn-sm btn-danger delete-food-item-btn" data-index="${index}">Delete</button>
          </td>
        </tr>`;
      });
      html += '</tbody></table>';
      foodItemsList.innerHTML = html;

      document.querySelectorAll('.edit-food-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          editFoodItem(index);
        });
      });
      document.querySelectorAll('.delete-food-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          deleteFoodItem(index);
        });
      });
    } catch (error) {
      foodItemsList.innerHTML = `<p>Error loading food items: ${error.message}</p>`;
    }
  }

  // Add new food item button click
  addFoodItemBtn.addEventListener('click', () => {
    editingFoodItemIndex = null;
    foodItemForm.reset();
    foodItemModal.show();
  });

  // Edit food item
  function editFoodItem(index) {
    const item = getItemByIndex(index);
    if (!item) {
      alert('Food item not found');
      return;
    }
    editingFoodItemIndex = index;
    document.getElementById('food-item-name').value = item.name;
    document.getElementById('food-item-subcategory').value = item.subcategory;
    document.getElementById('food-item-price').value = item.price;
    foodItemModal.show();
  }

  // Delete food item
  async function deleteFoodItem(index) {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      const item = getItemByIndex(index);
      if (!item) {
        alert('Food item not found');
        return;
      }
      const subcatIndex = foodServiceData.subcategories.findIndex(sc => sc.name === item.subcategory);
      if (subcatIndex === -1) {
        alert('Subcategory not found');
        return;
      }
      const itemIndex = foodServiceData.subcategories[subcatIndex].items.findIndex(i => i.name === item.name);
      if (itemIndex === -1) {
        alert('Item not found in subcategory');
        return;
      }
      foodServiceData.subcategories[subcatIndex].items.splice(itemIndex, 1);

      await db.collection('services').doc(foodServiceDocId).update({
        subcategories: foodServiceData.subcategories
      });
      alert('Food item deleted');
      loadFoodItems();
    } catch (error) {
      alert('Error deleting food item: ' + error.message);
    }
  }

  // Save food item (add or update)
  async function saveFoodItem() {
    const name = document.getElementById('food-item-name').value.trim();
    const subcategory = document.getElementById('food-item-subcategory').value.trim();
    const price = document.getElementById('food-item-price').value.trim();

    if (!name || !subcategory || !price) {
      alert('Please fill all fields');
      return;
    }

    try {
      let subcatIndex = foodServiceData.subcategories.findIndex(sc => sc.name === subcategory);
      if (subcatIndex === -1) {
        foodServiceData.subcategories.push({
          name: subcategory,
          items: []
        });
        subcatIndex = foodServiceData.subcategories.length - 1;
      }

      if (editingFoodItemIndex !== null) {
        const item = getItemByIndex(editingFoodItemIndex);
        if (!item) {
          alert('Food item not found');
          return;
        }
        const oldSubcatIndex = foodServiceData.subcategories.findIndex(sc => sc.name === item.subcategory);
        if (oldSubcatIndex !== -1) {
          const oldItemIndex = foodServiceData.subcategories[oldSubcatIndex].items.findIndex(i => i.name === item.name);
          if (oldItemIndex !== -1) {
            foodServiceData.subcategories[oldSubcatIndex].items.splice(oldItemIndex, 1);
          }
        }
        foodServiceData.subcategories[subcatIndex].items.push({ name, price });
      } else {
        foodServiceData.subcategories[subcatIndex].items.push({ name, price });
      }

      await db.collection('services').doc(foodServiceDocId).update({
        subcategories: foodServiceData.subcategories
      });
      alert('Food item saved');
      foodItemModal.hide();
      loadFoodItems();
    } catch (error) {
      alert('Error saving food item: ' + error.message);
    }
  }

  // Helper to get item by flattened index
  function getItemByIndex(index) {
    let count = 0;
    for (const subcat of foodServiceData.subcategories) {
      for (const item of subcat.items) {
        if (count === Number(index)) {
          return { ...item, subcategory: subcat.name };
        }
        count++;
      }
    }
    return null;
  }

  // Form submit handler
  foodItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFoodItem();
  });

  // Wait for auth state to be ready before loading data
  auth.onAuthStateChanged(user => {
    if (user) {
      loadFoodOrders();
      loadFoodItems();
    } else {
      foodOrdersList.innerHTML = '<p>Please login to view orders.</p>';
      foodItemsList.innerHTML = '<p>Please login to view food items.</p>';
    }
  });
});


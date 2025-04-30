// admin-services.js - Manage services in admin dashboard

const servicesList = document.getElementById('services-list');
const addServiceBtn = document.getElementById('add-service-btn');
const serviceModal = new bootstrap.Modal(document.getElementById('serviceModal'));
const serviceForm = document.getElementById('service-form');
const subcategoriesList = document.getElementById('subcategories-list');
const addSubcategoryBtn = document.getElementById('add-subcategory-btn');

let editingServiceId = null;

function createItemElement(item = { name: '', price: '' }) {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('input-group', 'mb-2');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Item Name';
  nameInput.classList.add('form-control', 'item-name');
  nameInput.value = item.name;
  nameInput.required = true;

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.placeholder = 'Price';
  priceInput.classList.add('form-control', 'item-price');
  priceInput.min = 0;
  priceInput.step = 0.01;
  priceInput.value = item.price;
  priceInput.required = true;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.classList.add('btn', 'btn-danger');
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    itemDiv.remove();
  });

  itemDiv.appendChild(nameInput);
  itemDiv.appendChild(priceInput);
  itemDiv.appendChild(removeBtn);

  return itemDiv;
}

function createSubcategoryElement(subcategory = { name: '', items: [] }) {
  const subcatDiv = document.createElement('div');
  subcatDiv.classList.add('border', 'p-3', 'mb-3');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Subcategory Name';
  nameInput.classList.add('form-control', 'subcategory-name');
  nameInput.value = subcategory.name;
  nameInput.required = true;

  const removeSubcatBtn = document.createElement('button');
  removeSubcatBtn.type = 'button';
  removeSubcatBtn.classList.add('btn', 'btn-danger');
  removeSubcatBtn.textContent = 'Remove Subcategory';
  removeSubcatBtn.addEventListener('click', () => {
    subcatDiv.remove();
  });

  headerDiv.appendChild(nameInput);
  headerDiv.appendChild(removeSubcatBtn);

  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('items-container');

  subcategory.items.forEach(item => {
    const itemElem = createItemElement(item);
    itemsContainer.appendChild(itemElem);
  });

  const addItemBtn = document.createElement('button');
  addItemBtn.type = 'button';
  addItemBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'mt-2');
  addItemBtn.textContent = 'Add Item';
  addItemBtn.addEventListener('click', () => {
    const newItem = createItemElement();
    itemsContainer.appendChild(newItem);
  });

  subcatDiv.appendChild(headerDiv);
  subcatDiv.appendChild(itemsContainer);
  subcatDiv.appendChild(addItemBtn);

  return subcatDiv;
}

function resetSubcategories() {
  subcategoriesList.innerHTML = '';
}

function populateSubcategories(subcategories) {
  resetSubcategories();
  subcategories.forEach(subcat => {
    const subcatElem = createSubcategoryElement(subcat);
    subcategoriesList.appendChild(subcatElem);
  });
}

function gatherSubcategoriesData() {
  const subcategories = [];
  const subcatDivs = subcategoriesList.querySelectorAll('div.border.p-3.mb-3');
  subcatDivs.forEach(subcatDiv => {
    const nameInput = subcatDiv.querySelector('input.subcategory-name');
    if (!nameInput.value.trim()) return;
    const items = [];
    const itemDivs = subcatDiv.querySelectorAll('div.input-group.mb-2');
    itemDivs.forEach(itemDiv => {
      const itemNameInput = itemDiv.querySelector('input.item-name');
      const itemPriceInput = itemDiv.querySelector('input.item-price');
      if (!itemNameInput.value.trim() || !itemPriceInput.value) return;
      items.push({
        name: itemNameInput.value.trim(),
        price: parseFloat(itemPriceInput.value)
      });
    });
    subcategories.push({
      name: nameInput.value.trim(),
      items
    });
  });
  return subcategories;
}

let serviceCategorySelect = null;
let newCategoryInput = null;

function setupCategoryElements() {
  serviceCategorySelect = document.getElementById('service-category');
  newCategoryInput = document.getElementById('new-category-input');

  if (!serviceCategorySelect || !newCategoryInput) {
    console.warn('Category select or new category input element not found in DOM.');
    return;
  }

  loadCategories();

  serviceCategorySelect.addEventListener('change', () => {
    if (serviceCategorySelect.value === '__new__') {
      newCategoryInput.style.display = 'block';
      newCategoryInput.required = true;
      newCategoryInput.focus();
    } else {
      newCategoryInput.style.display = 'none';
      newCategoryInput.required = false;
      newCategoryInput.value = '';
    }
  });
}

async function loadCategories() {
  if (!serviceCategorySelect) return;
  try {
    const snapshot = await db.collection('services').get();
    const categoriesSet = new Set();
    snapshot.forEach(doc => {
      const service = doc.data();
      if (service.category) {
        categoriesSet.add(service.category);
      }
    });
    serviceCategorySelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Category';
    serviceCategorySelect.appendChild(defaultOption);
    categoriesSet.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      serviceCategorySelect.appendChild(option);
    });
    const newCatOption = document.createElement('option');
    newCatOption.value = '__new__';
    newCatOption.textContent = 'Add New Category';
    serviceCategorySelect.appendChild(newCatOption);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

export async function loadServices() {
  servicesList.innerHTML = 'Loading services...';
  try {
    const snapshot = await db.collection('services').get();
    if (snapshot.empty) {
      servicesList.innerHTML = '<p>No services found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>Name</th><th>Category</th><th>Subcategories</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    snapshot.forEach(docSnap => {
      const service = docSnap.data();
      const subcatCount = service.subcategories ? service.subcategories.length : 0;
      html += `<tr>
        <td>${service.name || 'N/A'}</td>
        <td>${service.category || 'N/A'}</td>
        <td>${subcatCount}</td>
        <td>${service.status || 'N/A'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-service-btn" data-id="${docSnap.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-service-btn" data-id="${docSnap.id}">Delete</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    servicesList.innerHTML = html;

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

export async function editService(id) {
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
    if (serviceCategorySelect) {
      serviceCategorySelect.value = service.category;
      if (serviceCategorySelect.value === '__new__' && newCategoryInput) {
        newCategoryInput.style.display = 'block';
        newCategoryInput.value = service.category;
      } else if (newCategoryInput) {
        newCategoryInput.style.display = 'none';
        newCategoryInput.value = '';
      }
    }
    document.getElementById('service-status').value = service.status;
    populateSubcategories(service.subcategories || []);
    serviceModal.show();
  } catch (error) {
    alert('Error fetching service: ' + error.message);
  }
}

export async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    await db.collection('services').doc(id).delete();
    alert('Service deleted');
    loadServices();
  } catch (error) {
    alert('Error deleting service: ' + error.message);
  }
}

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('service-name').value.trim();
  let category = serviceCategorySelect ? serviceCategorySelect.value : '';
  const status = document.getElementById('service-status').value;
  const subcategories = gatherSubcategoriesData();

  if (category === '__new__') {
    category = newCategoryInput ? newCategoryInput.value.trim() : '';
    if (!category) {
      alert('Please enter a new category name.');
      return;
    }
  }

  try {
    if (editingServiceId) {
      await db.collection('services').doc(editingServiceId).update({
        name,
        category,
        status,
        subcategories
      });
      alert('Service updated');
    } else {
      await db.collection('services').add({
        name,
        category,
        status,
        subcategories
      });
      alert('Service added');
    }
    serviceModal.hide();
    loadServices();
  } catch (error) {
    alert('Error saving service: ' + error.message);
  }
});

addSubcategoryBtn.addEventListener('click', () => {
  const newSubcat = createSubcategoryElement();
  subcategoriesList.appendChild(newSubcat);
});

document.addEventListener('DOMContentLoaded', () => {
  setupCategoryElements();
  loadServices();
});


const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

// Helper to get auth headers with Firebase ID token
function getAuthHeaders() {
  const idToken = localStorage.getItem('idToken');
  console.log('getAuthHeaders token:', idToken);
  return idToken ? { Authorization: `Bearer ${idToken}` } : {};
}

// Users API
export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function approveUser(userId, role) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
}

export async function disableUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/disable`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
}

export async function fetchUserProfile(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function updateUserProfile(userId, profileData) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
}

// Bookings API
export async function fetchBookings(userId) {
  const url = userId ? `${API_BASE_URL}/bookings?userId=${userId}` : `${API_BASE_URL}/bookings`;
  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function createBooking(bookingData) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(bookingData),
  });
  return handleResponse(response);
}

export async function payForBooking(bookingId, paymentData) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(paymentData),
  });
  return handleResponse(response);
}

export async function fetchBookingSummary(bookingId) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/summary`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function cancelBooking(bookingId) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function submitFeedback(bookingId, feedback) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  return handleResponse(response);
}

// Services API
export async function fetchServices() {
  const response = await fetch(`${API_BASE_URL}/services`);
  return handleResponse(response);
}

// Booking status update
export async function updateBookingStatus(bookingId, status) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

// Service availability
export async function fetchServiceAvailability() {
  const response = await fetch(`${API_BASE_URL}/services/availability`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function updateServiceAvailability(availability) {
  const response = await fetch(`${API_BASE_URL}/services/availability`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(availability),
  });
  return handleResponse(response);
}

// Maintenance and stationery requests
export async function fetchMaintenanceRequests() {
  const response = await fetch(`${API_BASE_URL}/maintenanceRequests?type=maintenance`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

export async function fetchStationeryRequests() {
  const response = await fetch(`${API_BASE_URL}/maintenanceRequests?type=stationery`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

// Staff list
export async function fetchStaffList() {
  const response = await fetch(`${API_BASE_URL}/staff`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response);
}

// Maintenance request updates
export async function updateRequestStatus(requestId, status) {
  const response = await fetch(`${API_BASE_URL}/maintenanceRequests/${requestId}/status`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function assignStaffToRequest(requestId, staffId) {
  const response = await fetch(`${API_BASE_URL}/maintenanceRequests/${requestId}/assignStaff`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ staffId }),
  });
  return handleResponse(response);
}

export async function saveRequestNote(requestId, note) {
  const response = await fetch(`${API_BASE_URL}/maintenanceRequests/${requestId}/notes`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ note }),
  });
  return handleResponse(response);
}

export async function updateBookingAssignedStaff(bookingId, staffId) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/assignStaff`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffId }),
  });
  return handleResponse(response);
}

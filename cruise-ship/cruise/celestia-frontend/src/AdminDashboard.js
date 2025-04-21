import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchUsers,
  approveUser,
  disableUser,
  deleteUser,
  updateUserRole,
  fetchBookings,
} from './api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filterRole, setFilterRole] = useState('All');
  const [filterApproval, setFilterApproval] = useState('All');
  const [pendingUserRoles, setPendingUserRoles] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const usersPerPage = 10;
  const bookingsPerPage = 10;
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch users and bookings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
        const roles = {};
        usersData.forEach(user => {
          if (!user.approved) {
            roles[user.id] = user.role || 'Voyager';
          }
        });
        setPendingUserRoles(roles);

        const bookingsData = await fetchBookings();
        setBookings(bookingsData);
      } catch (error) {
        alert('Error loading data: ' + error.message);
      }
    }
    loadData();
  }, []);

  // Summary counts
  const totalUsers = users.length;
  const pendingApprovals = users.filter(u => !u.approved).length;
  const totalBookings = bookings.length;

  // Filtering and searching users
  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'All' || user.role === filterRole;
    const approvalMatch =
      filterApproval === 'All' ||
      (filterApproval === 'Approved' && user.approved) ||
      (filterApproval === 'Pending' && !user.approved);
    const searchMatch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    return roleMatch && approvalMatch && searchMatch;
  });

  // Sorting function
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Pagination for users
  const userStartIndex = (userPage - 1) * usersPerPage;
  const userPaginated = sortedUsers.slice(userStartIndex, userStartIndex + usersPerPage);
  const userPageCount = Math.ceil(sortedUsers.length / usersPerPage);

  // Filtering and searching bookings
  const filteredBookings = bookings.filter(booking => {
    const searchMatch =
      booking.serviceType.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.status.toLowerCase().includes(bookingSearch.toLowerCase());
    return searchMatch;
  });

  // Pagination for bookings
  const bookingStartIndex = (bookingPage - 1) * bookingsPerPage;
  const bookingPaginated = filteredBookings.slice(bookingStartIndex, bookingStartIndex + bookingsPerPage);
  const bookingPageCount = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Bulk selection handlers
  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllUsers = () => {
    setSelectedUserIds(new Set(userPaginated.map(user => user.id)));
  };

  const deselectAllUsers = () => {
    setSelectedUserIds(new Set());
  };

  // Bulk actions
  const bulkApprove = async () => {
    try {
      for (const userId of selectedUserIds) {
        const role = pendingUserRoles[userId] || 'Voyager';
        await approveUser(userId, role);
      }
      alert('Selected users approved');
      setSelectedUserIds(new Set());
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error approving users: ' + error.message);
    }
  };

  const bulkDisable = async () => {
    try {
      for (const userId of selectedUserIds) {
        await disableUser(userId);
      }
      alert('Selected users disabled');
      setSelectedUserIds(new Set());
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error disabling users: ' + error.message);
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete selected users?')) return;
    try {
      for (const userId of selectedUserIds) {
        await deleteUser(userId);
      }
      alert('Selected users deleted');
      setSelectedUserIds(new Set());
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error deleting users: ' + error.message);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const role = pendingUserRoles[userId] || 'Voyager';
      await approveUser(userId, role);
      alert('User approved and role assigned');
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error approving user: ' + error.message);
    }
  };

  const handlePendingRoleChange = (userId, role) => {
    setPendingUserRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      alert('User role updated');
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error updating user role: ' + error.message);
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await disableUser(userId);
      alert('User disabled');
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error disabling user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      alert('User deleted');
      // Refresh users
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  // Sorting handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Export CSV helper
  const exportCSV = (data, filename) => {
    const csvRows = [];
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Celestia Cruises</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
              <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="btn btn-outline-light" onClick={() => window.location.href = '/login'}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        <h1 className="text-center mb-4">Admin Dashboard</h1>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <p className="card-text fs-4">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-warning mb-3">
              <div className="card-body">
                <h5 className="card-title">Pending Approvals</h5>
                <p className="card-text fs-4">{pendingApprovals}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Bookings</h5>
                <p className="card-text fs-4">{totalBookings}</p>
              </div>
            </div>
          </div>
        </div>

      {/* User Management Section */}
      <h2>User Management</h2>
      <div className="d-flex mb-3 align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search users by name or email"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <button className="btn btn-secondary me-2" onClick={selectAllUsers}>Select All</button>
        <button className="btn btn-secondary me-2" onClick={deselectAllUsers}>Deselect All</button>
        <button className="btn btn-success me-2" onClick={bulkApprove} disabled={selectedUserIds.size === 0}>Bulk Approve</button>
        <button className="btn btn-warning me-2" onClick={bulkDisable} disabled={selectedUserIds.size === 0}>Bulk Disable</button>
        <button className="btn btn-danger" onClick={bulkDelete} disabled={selectedUserIds.size === 0}>Bulk Delete</button>
        <button className="btn btn-outline-primary ms-auto" onClick={() => exportCSV(sortedUsers, 'users.csv')}>Export Users CSV</button>
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedUserIds.size === userPaginated.length && userPaginated.length > 0}
                onChange={(e) => e.target.checked ? selectAllUsers() : deselectAllUsers()}
              />
            </th>
            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
              Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => requestSort('email')} style={{ cursor: 'pointer' }}>
              Email {sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Phone</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Disabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userPaginated.map(user => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                {user.approved ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="Voyager">Voyager</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Head Cook">Head Cook</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                ) : (
                  <>
                    <select
                      value={pendingUserRoles[user.id] || 'Voyager'}
                      onChange={(e) => handlePendingRoleChange(user.id, e.target.value)}
                    >
                      <option value="Voyager">Voyager</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Head Cook">Head Cook</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                    <button
                      className="btn btn-success btn-sm ms-2"
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </button>
                  </>
                )}
              </td>
              <td>{user.approved ? 'Yes' : 'No'}</td>
              <td>{user.disabled ? 'Yes' : 'No'}</td>
              <td>
                {!user.disabled && (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleDisableUser(user.id)}>Disable</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls for users */}
      <nav aria-label="User pagination" className="my-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${userPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setUserPage(userPage - 1)} disabled={userPage === 1}>Previous</button>
          </li>
          {[...Array(userPageCount)].map((_, i) => (
            <li key={i} className={`page-item ${userPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setUserPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${userPage === userPageCount ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setUserPage(userPage + 1)} disabled={userPage === userPageCount}>Next</button>
          </li>
        </ul>
      </nav>

      {/* Bookings Section */}
      <h2>Global Bookings</h2>
      <div className="d-flex mb-3 align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search bookings by service type or status"
          value={bookingSearch}
          onChange={(e) => setBookingSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <button className="btn btn-outline-primary ms-auto" onClick={() => exportCSV(filteredBookings, 'bookings.csv')}>Export Bookings CSV</button>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>User</th>
            <th>Service Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Additional Info</th>
          </tr>
        </thead>
        <tbody>
          {bookingPaginated.map(booking => (
            <tr key={booking.id}>
              <td>{users.find(u => u.id === booking.userId)?.name || 'Unknown'}</td>
              <td>{booking.serviceType}</td>
              <td>{booking.date}</td>
              <td>{booking.time}</td>
              <td>
                {booking.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
                {booking.status === 'approved' && <span className="badge bg-info text-dark">Approved</span>}
                {booking.status === 'completed' && <span className="badge bg-success">Completed</span>}
                {booking.status === 'cancelled' && <span className="badge bg-danger">Cancelled</span>}
                {booking.status === 'Preparing' && <span className="badge bg-primary text-white">Preparing</span>}
                {booking.status === 'Ready' && <span className="badge bg-secondary text-white">Ready</span>}
                {booking.status === 'Delivered' && <span className="badge bg-success">Delivered</span>}
                {!['pending', 'approved', 'completed', 'cancelled', 'Preparing', 'Ready', 'Delivered'].includes(booking.status) && booking.status}
              </td>
              <td>{booking.additionalInfo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls for bookings */}
      <nav aria-label="Booking pagination" className="my-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${bookingPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setBookingPage(bookingPage - 1)} disabled={bookingPage === 1}>Previous</button>
          </li>
          {[...Array(bookingPageCount)].map((_, i) => (
            <li key={i} className={`page-item ${bookingPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setBookingPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${bookingPage === bookingPageCount ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setBookingPage(bookingPage + 1)} disabled={bookingPage === bookingPageCount}>Next</button>
          </li>
        </ul>
      </nav>

      {/* Report generation UI placeholder */}
      <section className="my-5 p-4 border rounded bg-light">
        <h2>Report Generation</h2>
        <p>Report generation features can be implemented here.</p>
      </section>
    </div>
    </>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import {
  fetchMaintenanceRequests,
  fetchStationeryRequests,
  fetchStaffList,
  updateRequestStatus,
  assignStaffToRequest,
  saveRequestNote,
} from './api';
import { Tab, Tabs, Form, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const SupervisorDashboard = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [stationeryRequests, setStationeryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [notes, setNotes] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [maintenance, stationery, staff] = await Promise.all([
        fetchMaintenanceRequests(),
        fetchStationeryRequests(),
        fetchStaffList(),
      ]);
      setMaintenanceRequests(maintenance);
      setStationeryRequests(stationery);
      setStaffList(staff);
    } catch (error) {
      alert('Error loading data: ' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      alert(`Request status updated to ${status}`);
      await loadData();
    } catch (error) {
      alert('Error updating request status: ' + error.message);
    }
  };

  const handleAssignStaff = async (requestId, staffId) => {
    try {
      await assignStaffToRequest(requestId, staffId);
      alert('Staff assigned');
      await loadData();
    } catch (error) {
      alert('Error assigning staff: ' + error.message);
    }
  };

  const handleNoteChange = (requestId, value) => {
    setNotes(prev => ({ ...prev, [requestId]: value }));
  };

  const handleSaveNote = async (requestId) => {
    if (!notes[requestId]) return;
    try {
      await saveRequestNote(requestId, notes[requestId]);
      alert('Note saved');
      await loadData();
    } catch (error) {
      alert('Error saving note: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('idToken');
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <nav className="navbar navbar-dark bg-dark mb-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Supervisor Dashboard</span>
          <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="maintenance" title="Maintenance Requests">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Facility</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.issue}</td>
                    <td>{request.facility}</td>
                    <td>
                      {request.status === 'in progress' && <span className="badge bg-primary text-white">In Progress</span>}
                      {request.status === 'resolved' && <span className="badge bg-success">Resolved</span>}
                      {!['in progress', 'resolved'].includes(request.status) && request.status}
                    </td>
                    <td>
                      <Form.Select
                        value={request.assignedStaff || ''}
                        onChange={(e) => handleAssignStaff(request.id, e.target.value)}
                      >
                        <option value="" disabled>Select Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={notes[request.id] || request.notes || ''}
                        onChange={(e) => handleNoteChange(request.id, e.target.value)}
                      />
                      <Button size="sm" className="mt-1" onClick={() => handleSaveNote(request.id)}>Save Note</Button>
                    </td>
                    <td>
                      {request.status !== 'resolved' && (
                        <>
                          {request.status !== 'in progress' && (
                            <Button size="sm" variant="primary" className="me-1" onClick={() => handleUpdateStatus(request.id, 'in progress')}>Mark In Progress</Button>
                          )}
                          <Button size="sm" variant="success" onClick={() => handleUpdateStatus(request.id, 'resolved')}>Mark Resolved</Button>
                        </>
                      )}
                      {request.status === 'resolved' && <span>Resolved</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="stationery" title="Stationery Requests">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Requested By</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stationeryRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.requestedBy}</td>
                    <td>{request.item}</td>
                    <td>{request.quantity}</td>
                    <td>{request.status}</td>
                    <td>
                      <Form.Select
                        value={request.assignedStaff || ''}
                        onChange={(e) => handleAssignStaff(request.id, e.target.value)}
                      >
                        <option value="" disabled>Select Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={notes[request.id] || request.notes || ''}
                        onChange={(e) => handleNoteChange(request.id, e.target.value)}
                      />
                      <Button size="sm" className="mt-1" onClick={() => handleSaveNote(request.id)}>Save Note</Button>
                    </td>
                    <td>
                      {request.status !== 'resolved' && (
                        <>
                          {request.status !== 'in progress' && (
                            <Button size="sm" variant="primary" className="me-1" onClick={() => handleUpdateStatus(request.id, 'in progress')}>Mark In Progress</Button>
                          )}
                          <Button size="sm" variant="success" onClick={() => handleUpdateStatus(request.id, 'resolved')}>Mark Resolved</Button>
                        </>
                      )}
                      {request.status === 'resolved' && <span>Resolved</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default SupervisorDashboard;

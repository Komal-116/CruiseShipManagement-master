import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { payForBooking } from './api';
import { Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    paypalEmail: '',
    bankAccountNumber: '',
    bankIFSC: '',
    bankAccountName: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!booking) {
      setError('No booking information found. Please start your booking again.');
    }
  }, [booking]);

  const calculateAmount = (booking) => {
    const priceMap = {
      'Catering / Meal Booking': 50,
      'Salon / Spa Booking': 70,
      'Fitness Center': 40,
      'Movie / Entertainment': 30,
      'Resort / Lounge Booking': 60,
      'Facility Maintenance': 80,
      'Stationery Requests': 20,
    };
    return priceMap[booking?.serviceType] || 0;
  };

  const handleDetailChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const validatePayment = () => {
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return false;
    }
    if (paymentMethod === 'Credit Card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.nameOnCard) {
        setError('Please fill all credit card details.');
        return false;
      }
    } else if (paymentMethod === 'PayPal') {
      if (!paymentDetails.paypalEmail) {
        setError('Please enter your PayPal email.');
        return false;
      }
    } else if (paymentMethod === 'Bank Transfer') {
      if (!paymentDetails.bankAccountNumber || !paymentDetails.bankIFSC || !paymentDetails.bankAccountName) {
        setError('Please fill all bank transfer details.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setProcessing(true);
    setError(null);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        paymentMethod,
        amount: calculateAmount(booking),
        timestamp: new Date().toISOString(),
        status: 'completed',
        paymentDetails,
      };

      await payForBooking(booking.id, paymentData);

      setSuccess('Payment successful! Thank you.');
      setTimeout(() => {
        navigate('/voyager', { replace: true });
      }, 1500);
    } catch (err) {
      setError('Payment failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!window.confirm('Are you sure you want to cancel the payment? This will cancel your booking.')) {
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }
      setSuccess('Payment cancelled and booking has been cancelled.');
      setTimeout(() => {
        navigate('/voyager', { replace: true });
      }, 1500);
    } catch (err) {
      setError('Cancellation failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!booking) {
    return (
      <Card className="m-4 p-4" style={{ maxWidth: '400px', margin: '20px auto' }}>
        <Alert variant="danger">No booking information found. Please start your booking again.</Alert>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card className="m-4 p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h3 className="mb-3">Payment for Booking</h3>
        <p>Booking for service: <strong>{booking.serviceType}</strong></p>
        <p>Amount to pay: <strong>₹{calculateAmount(booking)}</strong></p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

        <Form>
          <Form.Group className="mb-3" controlId="paymentMethod">
            <Form.Label>Select Payment Method</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={processing}
            >
              <option value="">-- Select Payment Method --</option>
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </Form.Select>
          </Form.Group>

        {paymentMethod === 'Credit Card' && (
          <>
            <Form.Group className="mb-3" controlId="cardNumber">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleDetailChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={processing}
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="expiryDate">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handleDetailChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={processing}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="cvv">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    type="password"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handleDetailChange}
                    placeholder="123"
                    maxLength={4}
                    disabled={processing}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="nameOnCard">
              <Form.Label>Name on Card</Form.Label>
              <Form.Control
                type="text"
                name="nameOnCard"
                value={paymentDetails.nameOnCard}
                onChange={handleDetailChange}
                placeholder="John Doe"
                disabled={processing}
              />
            </Form.Group>
          </>
        )}

        {paymentMethod === 'PayPal' && (
          <Form.Group className="mb-3" controlId="paypalEmail">
            <Form.Label>PayPal Email</Form.Label>
            <Form.Control
              type="email"
              name="paypalEmail"
              value={paymentDetails.paypalEmail}
              onChange={handleDetailChange}
              placeholder="email@example.com"
              disabled={processing}
            />
          </Form.Group>
        )}

        {paymentMethod === 'Bank Transfer' && (
          <>
            <Form.Group className="mb-3" controlId="bankAccountNumber">
              <Form.Label>Account Number</Form.Label>
              <Form.Control
                type="text"
                name="bankAccountNumber"
                value={paymentDetails.bankAccountNumber}
                onChange={handleDetailChange}
                placeholder="1234567890"
                disabled={processing}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="bankIFSC">
              <Form.Label>IFSC Code</Form.Label>
              <Form.Control
                type="text"
                name="bankIFSC"
                value={paymentDetails.bankIFSC}
                onChange={handleDetailChange}
                placeholder="ABCD0123456"
                disabled={processing}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="bankAccountName">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control
                type="text"
                name="bankAccountName"
                value={paymentDetails.bankAccountName}
                onChange={handleDetailChange}
                placeholder="John Doe"
                disabled={processing}
              />
            </Form.Group>
          </>
        )}

      <Button variant="primary" onClick={handlePayment} disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
      {' '}
      <Button variant="danger" onClick={handleCancelPayment} disabled={processing}>
        Cancel Payment
      </Button>
      </Form>
    </Card>
    </div>
  );
};

export default Payment;

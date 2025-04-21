import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter new password
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const verifyEmail = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('Email not found. Please check and try again.');
        return;
      }
      setEmailVerified(true);
      setStep(2);
    } catch (err) {
      setError('Error verifying email: ' + err.message);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      // Use Firebase Auth to send password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
      // Optionally, navigate to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError('Error sending password reset email: ' + err.message);
    }
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Forgot Password</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {step === 1 && (
        <>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Enter your registered email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={verifyEmail}>
            Verify Email
          </Button>
        </>
      )}

      {step === 2 && emailVerified && (
        <>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handlePasswordReset}>
            Reset Password
          </Button>
        </>
      )}
    </Container>
  );
};

export default ForgotPassword;

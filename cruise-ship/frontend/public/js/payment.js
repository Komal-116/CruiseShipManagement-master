// payment.js - Updated Razorpay payment integration with quantity, total calculation, and order summary

document.addEventListener('DOMContentLoaded', () => {
  const itemNameSpan = document.getElementById('item-name');
  const itemPriceSpan = document.getElementById('item-price');
  const quantityInput = document.getElementById('quantity');
  const decrementBtn = document.getElementById('decrement-qty');
  const incrementBtn = document.getElementById('increment-qty');
  const totalAmountSpan = document.getElementById('total-amount');
  const payButton = document.getElementById('pay-button');

  // Parse query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');
  const itemName = urlParams.get('item');
  const priceStr = urlParams.get('price'); // price string like "₹200"

  if (!bookingId || !itemName || !priceStr) {
    alert('Missing payment details. Please try booking again.');
    window.location.href = '../pages/bookings.html';
    return;
  }

  // Extract numeric price from price string
  const price = parseInt(priceStr.replace(/[^\d]/g, ''));
  if (isNaN(price) || price <= 0) {
    alert('Invalid price. Please try booking again.');
    window.location.href = '../pages/bookings.html';
    return;
  }

  // Initialize UI
  itemNameSpan.textContent = itemName;
  itemPriceSpan.textContent = priceStr;
  quantityInput.value = 1;
  totalAmountSpan.textContent = price;

  // Update total amount
  function updateTotal() {
    const qty = parseInt(quantityInput.value);
    totalAmountSpan.textContent = (price * qty).toString();
  }

  decrementBtn.addEventListener('click', () => {
    let qty = parseInt(quantityInput.value);
    if (qty > 1) {
      qty--;
      quantityInput.value = qty;
      updateTotal();
    }
  });

  incrementBtn.addEventListener('click', () => {
    let qty = parseInt(quantityInput.value);
    qty++;
    quantityInput.value = qty;
    updateTotal();
  });

  payButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please login to make a payment.');
      window.location.href = '../login.html';
      return;
    }

    const qty = parseInt(quantityInput.value);
    const amount = price * qty;

    const options = {
      key: 'rzp_test_aInlr2JkOeUewn',
      amount: amount * 100, // amount in paise
      currency: 'INR',
      name: 'Cruise Ship Management System',
      description: `Payment for ${itemName} x${qty}`,
      handler: async function (response) {
        try {
          // Store payment record in Firestore
          await db.collection('payments').add({
            userId: user.uid,
            amount: amount,
            serviceId: null,
            paymentStatus: 'paid',
            razorpayPaymentId: response.razorpay_payment_id,
            bookingId: bookingId,
            quantity: qty,
            itemName: itemName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          // Update booking paymentId, status, and quantity
          await db.collection('bookings').doc(bookingId).update({
            paymentId: response.razorpay_payment_id,
            status: 'paid',
            quantity: qty
          });

          alert('Payment successful!');
          window.location.href = '../pages/bookings.html';
        } catch (error) {
          alert('Error updating payment info: ' + error.message);
        }
      },
      prefill: {
        email: user.email
      },
      theme: {
        color: '#0d6efd'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });
});

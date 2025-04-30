const paymentsList = document.getElementById('payments-list');

export async function loadPayments() {
  paymentsList.innerHTML = 'Loading payments...';
  try {
    const snapshot = await db.collection('payments').get();
    if (snapshot.empty) {
      paymentsList.innerHTML = '<p>No payments found.</p>';
      return;
    }
    let html = '<table class="table table-striped"><thead><tr><th>User ID</th><th>Amount</th><th>Service ID</th><th>Payment Status</th></tr></thead><tbody>';
    snapshot.forEach(doc => {
      const payment = doc.data();
      const amount = payment.amount !== undefined ? payment.amount.toFixed(2) : 'N/A';
      html += `<tr>
        <td>${payment.userId || 'N/A'}</td>
        <td>${amount}</td>
        <td>${payment.serviceId || 'N/A'}</td>
        <td>${payment.paymentStatus || 'N/A'}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    paymentsList.innerHTML = html;
  } catch (error) {
    paymentsList.innerHTML = `<p>Error loading payments: ${error.message}</p>`;
  }
}

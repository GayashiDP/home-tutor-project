import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import { getPaymentHistory } from '../../services/paymentService';

const formatCurrency = (amount) => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
}).format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) {
    return 'Not paid yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatSessionDate = (value) => {
  if (!value) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
};

const formatSession = (transaction) => {
  const date = transaction.sessionDate
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(`${transaction.sessionDate}T00:00:00`))
    : 'Date unavailable';
  const time = transaction.startTime && transaction.endTime
    ? `${transaction.startTime}-${transaction.endTime}`
    : 'Time unavailable';

  return `${transaction.subject} with ${transaction.tutorName} · ${date} · ${time}`;
};

const receiptLines = (transaction) => [
  'HOME TUTOR PAYMENT RECEIPT',
  `Receipt ID: ${transaction.receiptId || transaction.receiptNo}`,
  `Receipt No: ${transaction.receiptNo}`,
  `Student: ${transaction.studentName}`,
  `Tutor: ${transaction.tutorName}`,
  `Subject: ${transaction.subject}`,
  `Date: ${transaction.sessionDate}`,
  `Time: ${transaction.startTime}-${transaction.endTime}`,
  `Amount Paid: ${formatCurrency(transaction.amount)}`,
  `Payment Status: ${transaction.displayStatus}`,
  `Issued At: ${formatDate(transaction.issuedAt || transaction.paidAt)}`,
];

const escapePdfText = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');

const downloadReceiptPdf = (transaction) => {
  const lines = receiptLines(transaction);
  const textCommands = lines.map((line, index) => {
    const y = 760 - (index * 24);
    return `BT /F1 12 Tf 72 ${y} Td (${escapePdfText(line)}) Tj ET`;
  }).join('\n');
  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${textCommands.length} >> stream
${textCommands}
endstream endobj
xref
0 6
0000000000 65535 f 
trailer << /Root 1 0 R /Size 6 >>
startxref
0
%%EOF`;
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${transaction.receiptNo || transaction.id}-receipt.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

const printReceipt = (transaction) => {
  const printable = window.open('', '_blank', 'width=720,height=900');
  if (!printable) {
    return;
  }

  printable.document.write(`
    <html>
      <head>
        <title>${transaction.receiptNo} Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
          .receipt { border: 1px solid #d9e2ec; border-radius: 12px; padding: 24px; }
          h1 { margin: 0 0 8px; }
          p { color: #667085; }
          dl { display: grid; grid-template-columns: 160px 1fr; gap: 12px; }
          dt { color: #667085; font-weight: 700; }
          dd { margin: 0; font-weight: 700; }
        </style>
      </head>
      <body>
        <section class="receipt">
          <h1>Home Tutor Payment Receipt</h1>
          <p>Receipt No: ${transaction.receiptNo}</p>
          <dl>
            <dt>Receipt ID</dt><dd>${transaction.receiptId || transaction.receiptNo}</dd>
            <dt>Student</dt><dd>${transaction.studentName}</dd>
            <dt>Tutor</dt><dd>${transaction.tutorName}</dd>
            <dt>Subject</dt><dd>${transaction.subject}</dd>
            <dt>Session</dt><dd>${formatSession(transaction)}</dd>
            <dt>Amount Paid</dt><dd>${formatCurrency(transaction.amount)}</dd>
            <dt>Status</dt><dd>${transaction.displayStatus}</dd>
            <dt>Issued At</dt><dd>${formatDate(transaction.issuedAt || transaction.paidAt)}</dd>
          </dl>
        </section>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
};

export default function TransactionHistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPaymentHistory();
      setTransactions(response.data.transactions || []);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Unable to load transactions'
        : 'Unable to load transactions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      queueMicrotask(loadTransactions);
    }
  }, [loadTransactions, user]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const left = new Date(a.paidAt || a.createdAt || 0).getTime();
      const right = new Date(b.paidAt || b.createdAt || 0).getTime();
      return sortDirection === 'asc' ? left - right : right - left;
    });
  }, [sortDirection, transactions]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'Student') {
    return <Navigate to="/sessions" replace />;
  }

  const paidCount = transactions.filter((transaction) => transaction.displayStatus === 'Paid').length;
  const totalPaid = transactions
    .filter((transaction) => transaction.displayStatus === 'Paid')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  return (
    <main className="transactions-page">
      <Navbar />

      <section className="transactions-shell" aria-labelledby="transactions-heading">
        <div className="profile-topbar">
          <Link to="/student/dashboard">Back to Dashboard</Link>
          <Link to="/sessions">My Sessions</Link>
        </div>

        <header className="subject-manager-header">
          <p className="eyebrow">Billing</p>
          <h1 id="transactions-heading">Transaction History</h1>
          <p>Track completed and pending payment records for your tutoring sessions.</p>
        </header>

        <section className="sessions-summary" aria-label="Payment summary">
          <article>
            <span>Transactions</span>
            <strong>{transactions.length}</strong>
          </article>
          <article>
            <span>Paid</span>
            <strong>{paidCount}</strong>
          </article>
          <article>
            <span>Total Spent</span>
            <strong>{formatCurrency(totalPaid)}</strong>
          </article>
        </section>

        <div className="transactions-toolbar">
          <p>{sortedTransactions.length} transaction{sortedTransactions.length === 1 ? '' : 's'} shown</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
          >
            Sort {sortDirection === 'asc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {loading ? (
          <div className="soft-empty-state">
            <span className="mini-spinner" />
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="sessions-error">
            <p>{error}</p>
            <button type="button" className="secondary-button" onClick={loadTransactions}>
              Retry
            </button>
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="soft-empty-state">
            <strong>No transactions yet</strong>
            <p>Paid tutoring sessions and digital receipts will appear here.</p>
          </div>
        ) : (
          <div className="sessions-table-wrap">
            <table className="sessions-table transactions-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                    >
                      Date {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th>Session</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => {
                  const paid = transaction.displayStatus === 'Paid';
                  return (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.paidAt || transaction.createdAt)}</td>
                      <td>
                        <strong>{transaction.subject}</strong>
                        <span>{formatSession(transaction)}</span>
                      </td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>
                        <span className={`payment-status ${paid ? 'payment-status-paid' : 'payment-status-pending'}`}>
                          {paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button receipt-button"
                          onClick={() => setSelectedReceipt(transaction)}
                          disabled={!paid}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedReceipt && (
        <div className="session-detail-backdrop" role="presentation">
          <section className="receipt-modal" aria-labelledby="receipt-title">
            <header>
              <p className="eyebrow">Digital Receipt</p>
              <h2 id="receipt-title">Receipt {selectedReceipt.receiptNo}</h2>
              <span className="payment-status payment-status-paid">Paid</span>
            </header>

            <div className="receipt-document">
              <div>
                <span>Receipt ID</span>
                <strong>{selectedReceipt.receiptId || selectedReceipt.receiptNo}</strong>
              </div>
              <div>
                <span>Student</span>
                <strong>{selectedReceipt.studentName}</strong>
              </div>
              <div>
                <span>Tutor</span>
                <strong>{selectedReceipt.tutorName}</strong>
              </div>
              <div>
                <span>Subject</span>
                <strong>{selectedReceipt.subject}</strong>
              </div>
              <div>
                <span>Session Date</span>
                <strong>{formatSessionDate(selectedReceipt.sessionDate)}</strong>
              </div>
              <div>
                <span>Session Time</span>
                <strong>{selectedReceipt.startTime}-{selectedReceipt.endTime}</strong>
              </div>
              <div>
                <span>Amount Paid</span>
                <strong>{formatCurrency(selectedReceipt.amount)}</strong>
              </div>
              <div>
                <span>Issued At</span>
                <strong>{formatDate(selectedReceipt.issuedAt || selectedReceipt.paidAt)}</strong>
              </div>
            </div>

            <div className="session-detail-actions">
              <button type="button" className="secondary-button" onClick={() => printReceipt(selectedReceipt)}>
                Print
              </button>
              <button type="button" className="secondary-button" onClick={() => downloadReceiptPdf(selectedReceipt)}>
                Download PDF
              </button>
              <button type="button" className="primary-button" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-yellow', Confirmed: 'badge-green', Completed: 'badge-green',
    Cancelled: 'badge-red', Paid: 'badge-green', Unpaid: 'badge-orange',
    PendingApproval: 'badge-yellow', Rejected: 'badge-red',
    Available: 'badge-green', Booked: 'badge-blue', Active: 'badge-green',
    Suspended: 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

import React from 'react';

export function StatusBadge({ status }) {
  const normStatus = (status || 'PENDING').toLowerCase();

  const labels = {
    pending: 'Pending Approval',
    in_progress: 'Automating...',
    completed: 'Fulfilled / Ready',
    failed: 'Failed',
  };

  return (
    <span className={`badge badge-${normStatus}`}>
      <span className={`status-dot dot-${normStatus}`}></span>
      {labels[normStatus] || status}
    </span>
  );
}

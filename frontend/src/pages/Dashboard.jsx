import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { AutomationTerminal } from '../components/AutomationTerminal';
import { NewRequestModal } from '../components/NewRequestModal';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Shield,
  Search,
  RefreshCw,
  Play,
  Terminal,
  Trash2,
  Server,
  HardDrive,
  Database,
  KeyRound,
  AlertCircle
} from 'lucide-react';

const SERVICE_ICONS = {
  VM_PROVISION: { icon: Server, color: '#4f46e5', label: 'Amazon EC2 Compute' },
  S3_ACCESS: { icon: HardDrive, color: '#0284c7', label: 'Amazon S3 Storage' },
  DB_ACCOUNT: { icon: Database, color: '#059669', label: 'Amazon RDS Database' },
  PASSWORD_RESET: { icon: KeyRound, color: '#d97706', label: 'Security & Access Reset' },
};

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeLogRequest, setActiveLogRequest] = useState(null);
  const [executingId, setExecutingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/requests');
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleExecute = async (requestId) => {
    setExecutingId(requestId);
    try {
      const updated = await api.post(`/requests/${requestId}/execute`);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      // Automatically open the terminal window so user sees the generated logs!
      setActiveLogRequest(updated);
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setExecutingId(null);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm(`Are you sure you want to cancel Ticket #${requestId}?`)) return;
    try {
      await api.delete(`/requests/${requestId}`);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  // Filter calculations
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.service_type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Welcome back, {user?.full_name} 👋
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {isAdmin ? (
            <span>
              <strong>Administrator Access:</strong> You can review organization-wide requests and trigger simulated cloud provisioning workflows.
            </span>
          ) : (
            <span>
              <strong>Employee Portal:</strong> Track your infrastructure tickets and view live automated provisioning logs.
            </span>
          )}
        </p>
      </div>

      {/* Metric Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <StatCard
          title="Total Service Requests"
          value={totalCount}
          icon={Inbox}
          color="#4f46e5"
          subtitle={isAdmin ? 'All company tickets' : 'Submitted by you'}
        />
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          icon={Clock}
          color="#f59e0b"
          subtitle="Awaiting fulfillment"
        />
        <StatCard
          title="Fulfilled / Completed"
          value={completedCount}
          icon={CheckCircle2}
          color="#10b981"
          subtitle="Automated workflows"
        />
        <StatCard
          title="Access Level"
          value={user?.role}
          icon={Shield}
          color="#8b5cf6"
          subtitle={isAdmin ? 'Full Execution Rights' : 'Standard Submitter'}
        />
      </div>

      {/* Toolbar: Search, Filters, Refresh */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px'
        }}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === st ? 'var(--primary-light)' : 'transparent',
                color: statusFilter === st ? 'var(--primary-text)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search title or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                outline: 'none',
                width: '240px'
              }}
            />
          </div>
          <button
            onClick={fetchRequests}
            className="btn btn-secondary btn-sm"
            title="Refresh tickets"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'var(--status-failed-bg)',
          color: 'var(--status-failed-text)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket List / Table */}
      {filteredRequests.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Inbox size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            No service requests found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '20px' }}>
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Submit your first automated cloud request using the button below.'}
          </p>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="btn btn-primary"
          >
            + Create New IT Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredRequests.map((req) => {
            const srvConfig = SERVICE_ICONS[req.service_type] || {
              icon: Server,
              color: '#4f46e5',
              label: req.service_type,
            };
            const Icon = srvConfig.icon;

            return (
              <div key={req.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  {/* Left: Icon & Details */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: `${srvConfig.color}15`,
                      color: srvConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: srvConfig.color }}>
                          #{req.id} • {srvConfig.label}
                        </span>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: req.priority === 'HIGH' ? '#fee2e2' : req.priority === 'MEDIUM' ? '#fef3c7' : '#f1f5f9',
                          color: req.priority === 'HIGH' ? '#b91c1c' : req.priority === 'MEDIUM' ? '#92400e' : '#475569'
                        }}>
                          {req.priority} PRIORITY
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {new Date(req.created_at).toLocaleString()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                        {req.title}
                      </h3>

                      {req.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <StatusBadge status={req.status} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Execute Automation (Admin only & Pending) */}
                      {isAdmin && req.status === 'PENDING' && (
                        <button
                          onClick={() => handleExecute(req.id)}
                          disabled={executingId === req.id}
                          className="btn btn-primary btn-sm"
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
                          }}
                          title="Trigger simulated cloud fulfillment"
                        >
                          <Play size={14} />
                          <span>{executingId === req.id ? 'Running...' : 'Execute Automation'}</span>
                        </button>
                      )}

                      {/* View Cloud Logs (If has logs or completed) */}
                      {req.automation_log && (
                        <button
                          onClick={() => setActiveLogRequest(req)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: '#cbd5e1' }}
                          title="Inspect simulated cloud transcript"
                        >
                          <Terminal size={14} color="#0284c7" />
                          <span>View Cloud Logs</span>
                        </button>
                      )}

                      {/* Cancel / Delete */}
                      {(isAdmin || req.status === 'PENDING') && (
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid transparent',
                            padding: '6px'
                          }}
                          title={isAdmin ? 'Delete request' : 'Cancel pending request'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isNewModalOpen && (
        <NewRequestModal
          onClose={() => setIsNewModalOpen(false)}
          onRequestCreated={(newReq) => {
            setRequests((prev) => [newReq, ...prev]);
          }}
        />
      )}

      {activeLogRequest && (
        <AutomationTerminal
          request={activeLogRequest}
          onClose={() => setActiveLogRequest(null)}
        />
      )}
    </div>
  );
}

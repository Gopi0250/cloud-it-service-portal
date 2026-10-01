import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Server, Database, HardDrive, KeyRound, AlertCircle, Loader2 } from 'lucide-react';

const SERVICES = [
  {
    id: 'VM_PROVISION',
    title: 'Virtual Compute Server (Amazon EC2)',
    description: 'Provisions a Linux/Ubuntu 22.04 compute instance with private VPC subnet and security group.',
    icon: Server,
    color: '#4f46e5'
  },
  {
    id: 'S3_ACCESS',
    title: 'Cloud Object Storage (Amazon S3)',
    description: 'Configures IAM permissions and generates access policies for departmental cloud data buckets.',
    icon: HardDrive,
    color: '#0284c7'
  },
  {
    id: 'DB_ACCOUNT',
    title: 'Database Account (Amazon RDS)',
    description: 'Creates a dedicated MySQL database credential with enforced TLS 1.3 encryption.',
    icon: Database,
    color: '#059669'
  },
  {
    id: 'PASSWORD_RESET',
    title: 'Password & Token Reset',
    description: 'Revokes active JWT sessions and generates a secure one-time temporary activation token.',
    icon: KeyRound,
    color: '#d97706'
  },
];

export function NewRequestModal({ onClose, onRequestCreated }) {
  const [serviceType, setServiceType] = useState('VM_PROVISION');
  const [priority, setPriority] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a brief title for your request.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newReq = await api.post('/requests', {
        title,
        service_type: serviceType,
        priority,
        description: description || undefined,
      });
      onRequestCreated(newReq);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              New IT Service Request
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select a service workflow to submit an automated infrastructure request.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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

          {/* Service Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Select Infrastructure Service:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = serviceType === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setServiceType(srv.id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? srv.color : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? `${srv.color}08` : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Icon size={18} color={srv.color} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? srv.color : 'var(--text-main)' }}>
                        {srv.title.split('(')[0]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {srv.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Summary / Title:
            </label>
            <input
              type="text"
              placeholder="e.g. Provisioning staging server for payment API"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
              required
            />
          </div>

          {/* Priority */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Urgency / Priority:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    backgroundColor: priority === p ? 'var(--primary-light)' : '#ffffff',
                    borderColor: priority === p ? 'var(--primary)' : 'var(--border-color)',
                    color: priority === p ? 'var(--primary-text)' : 'var(--text-main)',
                    fontWeight: priority === p ? 700 : 500
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Specifications / Notes (Optional):
            </label>
            <textarea
              rows={3}
              placeholder="Add details such as required software, environment name, or access scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '130px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

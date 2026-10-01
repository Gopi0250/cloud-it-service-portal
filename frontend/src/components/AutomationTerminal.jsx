import React, { useState } from 'react';
import { Terminal, Copy, Check, X, ShieldAlert } from 'lucide-react';

export function AutomationTerminal({ request, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!request) return null;

  const handleCopy = () => {
    if (request.automation_log) {
      navigator.clipboard.writeText(request.automation_log);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const logs = request.automation_log
    ? request.automation_log.split('\n')
    : ['[SYSTEM] No execution transcript generated yet. Ticket is awaiting administrative execution.'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px', backgroundColor: 'var(--term-bg)', border: '1px solid var(--term-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="terminal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="terminal-dots">
              <span className="terminal-dot dot-red"></span>
              <span className="terminal-dot dot-yellow"></span>
              <span className="terminal-dot dot-green"></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8125rem' }}>
              <Terminal size={16} color="#38bdf8" />
              <span>cloud-automation-engine.log — Ticket #{request.id}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                borderColor: '#334155',
                padding: '4px 10px',
                fontSize: '0.75rem'
              }}
              title="Copy execution transcript"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Log'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#fbbf24'
        }}>
          <ShieldAlert size={14} />
          <span>SIMULATED AWS ENVIRONMENT: Generates mock AWS EC2 & S3 identifiers with $0 cloud cost.</span>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body" style={{ maxHeight: '420px' }}>
          {logs.map((line, idx) => {
            let textColor = '#cbd5e1';
            if (line.includes('[INIT]')) textColor = '#38bdf8';
            if (line.includes('[SUCCESS]')) textColor = '#4ade80';
            if (line.includes('[ERROR]')) textColor = '#f87171';
            if (line.includes('[PROVISIONING]') || line.includes('[POLICY_GEN]')) textColor = '#fbbf24';

            return (
              <div key={idx} style={{ color: textColor, padding: '2px 0', fontFamily: 'var(--font-mono)' }}>
                {line}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--term-header)',
          borderTop: '1px solid var(--term-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <div>
            Service: <strong style={{ color: '#e2e8f0' }}>{request.service_type}</strong> | Status: <strong style={{ color: '#4ade80' }}>{request.status}</strong>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
}

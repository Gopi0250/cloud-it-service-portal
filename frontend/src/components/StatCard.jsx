import React from 'react';

export function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card" style={{ padding: '20px', flex: 1, minWidth: '220px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

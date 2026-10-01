import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Cloud, LogOut, PlusCircle, ShieldCheck, User } from 'lucide-react';

export function Navbar({ onOpenNewRequest }) {
  const { user, logout, isAdmin } = useAuth();
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.get('/health');
        if (res.status === 'healthy') {
          setServerOnline(true);
        }
      } catch {
        setServerOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            padding: '8px',
            borderRadius: '10px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
          }}>
            <Cloud size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              Cloud IT Portal
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Simulated AWS Automation</span>
              <span>•</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: serverOnline ? '#16a34a' : '#dc2626',
                fontWeight: 500
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: serverOnline ? '#16a34a' : '#dc2626'
                }}></span>
                {serverOnline ? 'FastAPI Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* New Request Button */}
          <button
            onClick={onOpenNewRequest}
            className="btn btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <PlusCircle size={18} />
            <span>New IT Request</span>
          </button>

          {/* User Details */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isAdmin ? '#ede9fe' : '#e0e7ff',
              color: isAdmin ? '#6d28d9' : '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {user?.full_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span className="badge badge-role" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                  {user?.role}
                </span>
                {user?.department && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign out of portal"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}

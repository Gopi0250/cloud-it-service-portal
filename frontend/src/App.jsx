import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { NewRequestModal } from './components/NewRequestModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-muted)'
      }}>
        <Loader2 size={32} color="#4f46e5" className="spin" />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Connecting to Cloud IT Portal...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenNewRequest={() => setIsNewModalOpen(true)} />
      <main style={{ flex: 1 }}>
        <Dashboard />
      </main>

      {/* Global New Request Modal triggered from Navbar */}
      {isNewModalOpen && (
        <NewRequestModal
          onClose={() => setIsNewModalOpen(false)}
          onRequestCreated={() => {
            // Trigger refresh
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

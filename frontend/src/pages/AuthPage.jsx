import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Lock, Mail, User, Building, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('EMPLOYEE');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          full_name: fullName,
          email,
          password,
          department,
          role,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill helper for review/testing
  const handleQuickFill = (targetRole) => {
    if (targetRole === 'EMPLOYEE') {
      setEmail('employee@company.com');
      setPassword('Password123!');
      setFullName('Jane Employee');
      setDepartment('Engineering');
      setRole('EMPLOYEE');
    } else {
      setEmail('admin@company.com');
      setPassword('AdminPassword123!');
      setFullName('Alex Administrator');
      setDepartment('IT Operations');
      setRole('ADMIN');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px auto',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
          }}>
            <Cloud size={30} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Cloud IT Service Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Request infrastructure & trigger simulated cloud fulfillment
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: isLogin ? '#ffffff' : 'transparent',
                color: isLogin ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: isLogin ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: !isLogin ? '#ffffff' : 'transparent',
                color: !isLogin ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'var(--status-failed-bg)',
              color: 'var(--status-failed-text)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.8125rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Full Name:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Department:
                    </label>
                    <input
                      type="text"
                      placeholder="Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Account Role:
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Email Address:
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Password:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-light)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '10px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Portal' : 'Register Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Helpers */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Quick Demo Fill:
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('EMPLOYEE')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <User size={14} />
                <span>Fill Employee</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <Shield size={14} />
                <span>Fill Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

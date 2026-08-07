import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'rgba(0, 230, 204, 0.1)' : 'rgba(255, 77, 77, 0.1)';
  const borderColor = type === 'success' ? 'var(--primary-cyan)' : 'var(--error-red)';
  const icon = type === 'success' ? <CheckCircle size={20} color="var(--primary-cyan)" /> : <AlertCircle size={20} color="var(--error-red)" />;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out forwards'
    }}>
      {icon}
      <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: '8px' }}>
        <X size={16} color="var(--text-secondary)" />
      </button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

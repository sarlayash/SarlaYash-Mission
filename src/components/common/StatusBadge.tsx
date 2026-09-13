import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case 'verified':
      case 'completed':
      case 'issued':
      case 'reviewed':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending_verification':
      case 'submitted':
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rejected':
      case 'needs_revision':
      case 'revoked':
      case 'suspended':
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'started':
      case 'enrolled':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'pending_verification':
        return 'Pending Verification';
      case 'needs_revision':
        return 'Needs Revision';
      case 'not_configured':
        return 'Not Configured';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()} ${className}`}>
      {getLabel()}
    </span>
  );
};

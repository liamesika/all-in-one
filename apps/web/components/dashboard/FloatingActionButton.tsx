'use client';

import { useState } from 'react';
import { Plus, X, UserPlus, Home, Briefcase } from 'lucide-react';

interface FloatingActionButtonProps {
  onAddLead?: () => void;
  onAddProperty?: () => void;
  onAddCampaign?: () => void;
}

export function FloatingActionButton({
  onAddLead,
  onAddProperty,
  onAddCampaign,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'lead',
      label: 'Add Lead',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: onAddLead,
      color: '#2979FF',
    },
    {
      id: 'property',
      label: 'Add Property',
      icon: <Home className="w-5 h-5" />,
      onClick: onAddProperty,
      color: '#6EA8FE',
    },
    {
      id: 'campaign',
      label: 'Create Campaign',
      icon: <Briefcase className="w-5 h-5" />,
      onClick: onAddCampaign,
      color: '#10B981',
    },
  ];

  const handleAction = (action: typeof actions[0]) => {
    action.onClick?.();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Menu */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2">
            {actions.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 group"
                style={{
                  background: action.color,
                  animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <span className="text-white font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                  <div className="text-white">{action.icon}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(135deg, #2979FF 0%, #1d4ed8 100%)',
            boxShadow: isOpen
              ? '0 10px 40px rgba(239, 68, 68, 0.5)'
              : '0 10px 40px rgba(41, 121, 255, 0.5)',
          }}
          aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
        >
          <div
            className="transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

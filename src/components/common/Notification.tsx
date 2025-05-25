import React from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${bgColor} shadow-lg max-w-md`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification; 
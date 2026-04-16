import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast = ({ message, isVisible, onClose, type = 'success' }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 right-8 z-[200] animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#c5a059]/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-w-[300px]">
        <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
          <CheckCircle size={20} />
        </div>
        <div className="flex-1">
          <p className="text-slate-900 dark:text-white font-bold text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

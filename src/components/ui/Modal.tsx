import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-[2.5rem] border border-[#c5a059]/20 p-10 relative shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

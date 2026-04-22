import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'default' | 'sm';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'default' }: ModalProps) => {
  if (!isOpen) return null;

  const isSmall = size === 'sm';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`bg-white dark:bg-[#0a0a0a] w-full rounded-t-[2rem] sm:rounded-[2.5rem] border border-[#c5a059]/20 p-4 sm:p-6 md:p-8 relative shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 flex flex-col ${
          isSmall ? 'max-w-xl max-h-[82dvh] sm:max-h-[70vh]' : 'max-w-3xl h-[90dvh] sm:h-[82vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 mb-4 sm:mb-6 shrink-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </header>

        <div className={`min-h-0 pr-1 ${isSmall ? 'overflow-y-visible' : 'flex-1 overflow-y-auto'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

let confirmResolve = null;
let alertResolve = null;

export const showConfirm = (message) => {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    window.__modalData = { type: 'confirm', message };
    window.dispatchEvent(new CustomEvent('show-modal'));
  });
};

export const showAlert = (message) => {
  return new Promise((resolve) => {
    alertResolve = resolve;
    window.__modalData = { type: 'alert', message };
    window.dispatchEvent(new CustomEvent('show-modal'));
  });
};

const Modal = () => {
  const [data, setData] = useState(null);
  const modalRef = useRef(null);

  const handleEvent = useCallback(() => {
    setData(window.__modalData);
    window.__modalData = null;
  }, []);

  useEffect(() => {
    window.addEventListener('show-modal', handleEvent);
    return () => window.removeEventListener('show-modal', handleEvent);
  }, [handleEvent]);

  useEffect(() => {
    if (data) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [data]);

  const close = () => {
    setData(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (data.type === 'alert') handleAlert();
      else handleConfirm(false);
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll('button:not([disabled])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const handleConfirm = (value) => {
    if (confirmResolve) {
      confirmResolve(value);
      confirmResolve = null;
    }
    close();
  };

  const handleAlert = () => {
    if (alertResolve) {
      alertResolve();
      alertResolve = null;
    }
    close();
  };

  const isConfirm = data?.type === 'confirm';

  if (!data) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isConfirm) close(); }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm mx-4 p-6 animate-in outline-none"
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">{isConfirm ? '⚠️' : 'ℹ️'}</div>
          <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{data.message}</p>
        </div>
        <div className={`mt-5 flex gap-3 ${isConfirm ? 'justify-between' : 'justify-center'}`}>
          {isConfirm ? (
            <>
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >Отмена</button>
              <button
                onClick={() => handleConfirm(true)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >Удалить</button>
            </>
          ) : (
            <button
              onClick={handleAlert}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >OK</button>
          )}
        </div>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

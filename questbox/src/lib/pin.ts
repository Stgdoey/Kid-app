import React, { useState, useCallback } from 'react';

interface PinVerificationProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const PinModal: React.FC<PinVerificationProps> = ({ isVisible, onClose, onSuccess, correctPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleInput = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleVerify = useCallback(() => {
    if (pin === correctPin) {
      onSuccess();
      setPin('');
      setError('');
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  }, [pin, correctPin, onSuccess]);
  
  React.useEffect(() => {
      if(pin.length === 4) {
          handleVerify();
      }
  }, [pin, handleVerify]);

  if (!isVisible) return null;

  return React.createElement('div', { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" },
    React.createElement('div', { className: "bg-slate-800 text-white rounded-lg shadow-xl p-6 w-80 flex flex-col items-center" },
      React.createElement('h2', { className: "text-xl font-bold mb-2" }, "Enter Admin PIN"),
      React.createElement('p', { className: "text-slate-400 mb-4" }, "This action requires permission."),
      React.createElement('div', { className: "flex items-center justify-center space-x-3 h-12 mb-2" },
        Array(4).fill(0).map((_, i) => 
          React.createElement('div', { key: i, className: `w-6 h-6 rounded-full border-2 ${pin.length > i ? 'bg-sky-400 border-sky-400' : 'border-slate-500'}` })
        )
      ),
      error 
        ? React.createElement('p', { className: "text-red-400 text-sm h-5 mb-2" }, error) 
        : React.createElement('div', { className: "h-5 mb-2" }),
      React.createElement('div', { className: "grid grid-cols-3 gap-3 w-full" },
        [
          ...[...Array(9)].map((_, i) =>
            React.createElement('button', { key: i + 1, onClick: () => handleInput(String(i + 1)), className: "text-2xl font-semibold rounded-full bg-slate-700 h-16 hover:bg-slate-600 transition-colors" }, i + 1)
          ),
          React.createElement('button', { key: 'cancel', onClick: onClose, className: "text-lg font-semibold rounded-full bg-slate-700 h-16 hover:bg-slate-600 transition-colors" }, "Cancel"),
          React.createElement('button', { key: '0', onClick: () => handleInput('0'), className: "text-2xl font-semibold rounded-full bg-slate-700 h-16 hover:bg-slate-600 transition-colors" }, "0"),
          React.createElement('button', { key: 'delete', onClick: handleDelete, className: "text-lg font-semibold rounded-full bg-slate-700 h-16 hover:bg-slate-600 transition-colors" }, "Delete")
        ]
      )
    )
  );
};

export function usePinVerification(correctPin: string) {
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [actionOnClose, setActionOnClose] = useState<(() => void) | null>(null);

  const requestPin = useCallback((action: () => void, onCancel?: () => void) => {
    setActionToConfirm(() => action);
    setActionOnClose(() => onCancel);
    setPinModalVisible(true);
  }, []);

  const handlePinSuccess = () => {
    if (actionToConfirm) {
      actionToConfirm();
    }
    setPinModalVisible(false);
    setActionToConfirm(null);
    setActionOnClose(null);
  };

  const handlePinClose = () => {
    if (actionOnClose) {
      actionOnClose();
    }
    setPinModalVisible(false);
    setActionToConfirm(null);
    setActionOnClose(null);
  };
  
  const PinVerificationComponent = () => (
      React.createElement(PinModal, { 
        isVisible: isPinModalVisible,
        onClose: handlePinClose,
        onSuccess: handlePinSuccess,
        correctPin: correctPin
      })
  );

  return { requestPin, PinVerificationComponent };
}
import React, { useEffect } from 'react';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  // Generate random positions for sparkles
  const sparkles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.5}s`,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-level-up-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      <div
        className="relative w-full max-w-md text-center text-white transform opacity-0 animate-level-up-content"
        // Prevent click inside modal from closing it
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="level-up-title" className="text-6xl font-black tracking-tighter text-yellow-300 drop-shadow-[0_5px_10px_rgba(252,211,77,0.5)]" style={{ WebkitTextStroke: '2px black' }}>
          LEVEL UP!
        </h2>

        <div className="mt-4 inline-block relative">
           <div className="w-40 h-40 rounded-full bg-sky-500 flex flex-col items-center justify-center border-8 border-sky-300 shadow-2xl">
              <span className="text-xl font-bold text-sky-100 -mb-2">LEVEL</span>
              <span className="text-7xl font-bold">{newLevel}</span>
           </div>
           {sparkles.map(s => (
             <div key={s.id} className="sparkle" style={{ top: s.top, left: s.left, animationDelay: s.animationDelay }}></div>
           ))}
        </div>
        
        <p className="mt-6 text-slate-300">You're getting stronger!</p>
      </div>
    </div>
  );
};

export default LevelUpModal;

'use client';

import React, { useEffect, useState } from 'react';

export default function CyberCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      const isClickable = window.getComputedStyle(target).cursor === 'pointer' || 
                         target.tagName === 'A' || 
                         target.tagName === 'BUTTON' ||
                         target.closest('a') ||
                         target.closest('button');
      setIsPointer(!!isClickable);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div 
        className="fixed top-0 left-0 w-3 h-3 bg-primary-container rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${isClicking ? 0.8 : 1})`,
          boxShadow: '0 0 15px var(--color-primary-container)'
        }}
      />
      
      {/* Outer ring */}
      <div 
        className="fixed top-0 left-0 w-10 h-10 border border-primary-container/30 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center justify-center"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${isPointer ? 1.5 : 1})`,
          opacity: isPointer ? 0.8 : 0.4
        }}
      >
        {/* Cyber crosshair lines inside the ring */}
        <div className={`absolute w-[1px] h-2 bg-primary-container/40 top-0 transition-opacity ${isPointer ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute w-[1px] h-2 bg-primary-container/40 bottom-0 transition-opacity ${isPointer ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute h-[1px] w-2 bg-primary-container/40 left-0 transition-opacity ${isPointer ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`absolute h-[1px] w-2 bg-primary-container/40 right-0 transition-opacity ${isPointer ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>

      {/* Trailing effect */}
      <div 
        className="fixed top-0 left-0 w-20 h-20 bg-primary-container/5 rounded-full pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 blur-2xl transition-all duration-500 ease-out"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </>
  );
}

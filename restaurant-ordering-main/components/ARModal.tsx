'use client';

import React, { useRef, useEffect } from 'react';
import '@google/model-viewer';

interface ARModalProps {
  isOpen: boolean;
  onClose: () => void;
  glbUrl: string;
  productName?: string;
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua);
}

function isAndroid() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android/.test(ua);
}

export default function ARModal({ isOpen, onClose, glbUrl, productName }: ARModalProps) {
  const arModelRef = useRef<
    HTMLElement & {
      activateAR?: () => void;
      enterAR?: () => void;
    }
  >(null);

  // Android: open Scene Viewer directly and close modal
  useEffect(() => {
    if (isOpen && isAndroid() && glbUrl) {
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(glbUrl)};end;`;
      window.location.href = intentUrl;
      onClose();
    }
  }, [isOpen, glbUrl, onClose]);

  // iOS: show modal and auto-trigger AR after a delay
  useEffect(() => {
    if (isOpen && isIOS() && glbUrl) {
      setTimeout(() => {
        if (arModelRef.current?.activateAR) {
          arModelRef.current.activateAR();
        } else if (arModelRef.current?.enterAR) {
          arModelRef.current.enterAR();
        }
      }, 200);
    }
  }, [isOpen, glbUrl]);

  // Only show modal on desktop or iOS
  if (!isOpen || (isAndroid() && glbUrl)) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative flex items-center justify-center w-full h-full">
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-white/60 hover:text-white z-10"
          aria-label="Close"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {productName && (
          <h2 className="text-2xl font-semibold text-white mb-4 text-center absolute top-8 left-1/2 -translate-x-1/2 z-10">
            {productName}
          </h2>
        )}
        <div className="flex items-center justify-center">
          {/* @ts-expect-error - model-viewer element type not fully typed */}
          <model-viewer
            ref={arModelRef}
            src={glbUrl}
            alt="3D Model"
            camera-controls
            auto-rotate
            ar
            style={{
              width: '40vw',
              height: '40vh',
              maxWidth: '340px',
              maxHeight: '45vh',
              background: '#23242A',
            }}
            className="rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}

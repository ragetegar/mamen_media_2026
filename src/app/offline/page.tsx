"use client";

import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center select-none">
      {/* Brutalist Warning Card */}
      <div className="card-frame p-8 md:p-12 max-w-2xl w-full border-4 border-mamen-white bg-mamen-black shadow-hard-magenta relative overflow-hidden">
        
        {/* Neon Warning Badge */}
        <div className="absolute top-4 right-4">
          <span className="badge-magenta text-xs font-mono tracking-widest flex items-center gap-1.5 animate-pulse">
            <WifiOff size={12} /> SIGNAL LOST
          </span>
        </div>

        {/* Big Brutalist Heading */}
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6 mt-4 uppercase leading-none text-mamen-white">
          THE AMPLIFIERS ARE <br />
          <span className="text-mamen-lime">UNPLUGGED!</span>
        </h1>

        {/* Description */}
        <p className="text-mamen-gray-200 font-body text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
          You are currently browsing offline. The crowd is roaring, but we need your connection active to load the latest news drops, concert schedules, and reviews.
        </p>

        {/* Retry Button with brutalist theme */}
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-4 font-headline text-lg md:text-xl font-bold bg-mamen-purple text-mamen-white border-2 border-mamen-white cursor-pointer hover:bg-mamen-magenta hover:text-mamen-white transition-all duration-200 active:translate-x-1 active:translate-y-1 shadow-hard-sm hover:shadow-hard-hover"
        >
          <RefreshCw size={18} className="animate-spin-slow" />
          PLUG BACK IN
        </button>

        {/* Decorative Grid Details */}
        <div className="mt-8 pt-6 border-t border-mamen-gray-800 text-xs font-mono text-mamen-gray-200 flex justify-between items-center">
          <span>CODE: 503_OFFLINE_MODE</span>
          <span>MAMEN.ID V1.0</span>
        </div>
      </div>
    </div>
  );
}

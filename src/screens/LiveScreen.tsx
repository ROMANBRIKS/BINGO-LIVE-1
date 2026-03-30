import React, { useState, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export const LiveScreen = () => {
  const { profile } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [title, setTitle] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startStream = async () => {
    if (!title) return alert('Please enter a title');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      const streamId = profile.uid;
      await setDoc(doc(db, 'streams', streamId), {
        streamId,
        streamerId: profile.uid,
        title,
        viewerCount: 0,
        startTime: new Date().toISOString(),
        status: 'active'
      });
      
      setIsStreaming(true);
    } catch (err) {
      console.error('Error starting stream:', err);
      alert('Could not access camera/microphone');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 tracking-tight">Broadcaster Studio</h2>
      
      <div className="bg-[#151619] border border-white/10 rounded-[40px] overflow-hidden relative shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full aspect-video bg-black object-cover"
        />
        
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
            <input 
              type="text" 
              placeholder="Enter stream title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 w-full max-w-md mb-6 focus:outline-none focus:border-[#ff4e00] transition-colors text-center text-xl font-bold"
            />
            <button 
              onClick={startStream}
              className="bg-[#ff4e00] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,78,0,0.4)]"
            >
              Go Live
            </button>
          </div>
        )}

        {isStreaming && (
          <div className="absolute top-6 left-6 flex gap-3">
            <div className="bg-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              On Air
            </div>
          </div>
        )}
      </div>
      
      {isStreaming && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 px-8 py-3 rounded-2xl font-bold transition-all"
          >
            End Stream
          </button>
        </div>
      )}
    </div>
  );
};

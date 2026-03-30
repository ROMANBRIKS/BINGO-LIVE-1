import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Link } from 'react-router-dom';
import { Video, User } from 'lucide-react';

export const HomeScreen = () => {
  const [streams, setStreams] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'streams'), where('status', '==', 'active'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setStreams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'streams'));
    return unsub;
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Live Now</h2>
        <div className="flex gap-2">
          {['All', 'Music', 'Gaming', 'Talk'].map(cat => (
            <button key={cat} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-[#ff4e00] transition-colors">{cat}</button>
          ))}
        </div>
      </div>

      {streams.length === 0 ? (
        <div className="bg-[#151619] border border-white/10 rounded-[32px] p-12 text-center">
          <Video className="mx-auto mb-4 text-white/20" size={48} />
          <p className="text-white/40">No active streams right now. Be the first to go live!</p>
          <Link to="/live" className="mt-6 inline-block bg-[#ff4e00] px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform">Start Streaming</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.map(stream => (
            <Link key={stream.id} to={`/watch/${stream.id}`} className="group">
              <div className="relative aspect-[9/16] bg-[#151619] rounded-[32px] overflow-hidden border border-white/10 transition-all duration-500 group-hover:border-[#ff4e00]/50 group-hover:shadow-[0_0_30px_rgba(255,78,0,0.2)]">
                <img 
                  src={`https://picsum.photos/seed/${stream.id}/400/700`} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
                  alt={stream.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Live
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <User size={10} /> {stream.viewerCount}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{stream.title}</h3>
                  <p className="text-white/40 text-xs">@{stream.streamerId.slice(0, 8)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

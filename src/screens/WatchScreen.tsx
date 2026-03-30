import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WatchScreen = () => {
  const { streamId } = useParams();
  const { profile } = useAuth();
  const [stream, setStream] = useState<any>(null);
  const [gifts, setGifts] = useState<any[]>([]);
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  useEffect(() => {
    if (!streamId) return;
    const unsub = onSnapshot(doc(db, 'streams', streamId), (docSnap) => {
      if (docSnap.exists()) setStream(docSnap.data());
    });
    
    const unsubGifts = onSnapshot(collection(db, 'gifts'), (snap) => {
      setGifts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub(); unsubGifts(); };
  }, [streamId]);

  const sendGift = async (gift: any) => {
    if (!profile || profile.diamonds < gift.price) return alert('Not enough diamonds!');
    
    try {
      const response = await fetch('/api/send-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: profile.uid,
          streamerId: stream.streamerId,
          giftId: gift.id,
          diamondsSpent: gift.price,
          signature: 'simulated_signature'
        })
      });
      if (response.ok) {
        setShowGiftPicker(false);
        alert(`Sent ${gift.name}!`);
      }
    } catch (err) {
      console.error('Error sending gift:', err);
    }
  };

  if (!stream) return <div className="text-center p-20">Loading stream...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <div className="bg-[#151619] border border-white/10 rounded-[40px] overflow-hidden relative shadow-2xl aspect-video">
          <img 
            src={`https://picsum.photos/seed/${streamId}/1280/720`} 
            className="w-full h-full object-cover opacity-80" 
            alt={stream.title}
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-6 left-6 flex gap-3">
            <div className="bg-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent">
            <h2 className="text-3xl font-bold mb-2">{stream.title}</h2>
            <p className="text-white/40">Streaming by @{stream.streamerId.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-[#151619] border border-white/10 rounded-[32px] p-6 flex-1 flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-[#ff4e00]" /> 
            Live Chat
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 text-sm text-white/60">
            <p><span className="text-[#ff4e00] font-bold">System:</span> Welcome to the stream!</p>
            <p><span className="text-blue-400 font-bold">User123:</span> Great stream!</p>
            <p><span className="text-purple-400 font-bold">VIP_King:</span> Sending some love 💎</p>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Say something..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 text-sm focus:outline-none focus:border-[#ff4e00]" />
            <button onClick={() => setShowGiftPicker(true)} className="p-2 bg-[#ff4e00] rounded-xl hover:scale-110 transition-transform">
              <Wallet size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGiftPicker && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowGiftPicker(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }}
              className="bg-[#151619] border-t border-white/10 w-full max-w-2xl rounded-t-[40px] p-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Send a Gift</h3>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-[#ff4e00] font-bold">💎 {profile.diamonds}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {gifts.map(gift => (
                  <button 
                    key={gift.id} 
                    onClick={() => sendGift(gift)}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-[#ff4e00]/10 hover:border-[#ff4e00] transition-all flex flex-col items-center gap-2 group"
                  >
                    <span className="text-4xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                    <span className="text-xs font-bold">{gift.name}</span>
                    <span className="text-[10px] text-[#ff4e00]">💎 {gift.price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

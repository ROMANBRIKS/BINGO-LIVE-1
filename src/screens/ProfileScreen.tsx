import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Star } from 'lucide-react';

export const ProfileScreen = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#151619] border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00]/10 blur-[80px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-[#ff4e00] p-1 mb-6">
            <img src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/200`} className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <h2 className="text-3xl font-bold mb-1">{profile.displayName}</h2>
          <p className="text-white/40 text-sm mb-8">UID: {profile.uid.slice(0, 12)}...</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-12">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="text-[#ff4e00] mb-2"><Wallet size={24} className="mx-auto" /></div>
              <div className="text-2xl font-black">💎 {profile.diamonds}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Diamonds</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="text-yellow-500 mb-2"><Star size={24} className="mx-auto" /></div>
              <div className="text-2xl font-black">🌰 {profile.beans}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Beans</div>
            </div>
          </div>

          <div className="w-full space-y-4">
            <button className="w-full bg-[#ff4e00] py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <Wallet size={20} /> Top Up Diamonds
            </button>
            <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
              Withdraw Beans (≈ ${(profile.beans / 210).toFixed(2)})
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-[#151619] border border-white/10 rounded-[32px] p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Star size={20} className="text-yellow-500" /> VIP Status
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-2xl font-black text-black italic shadow-lg">
            {profile.vipLevel}
          </div>
          <div className="flex-1">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-yellow-500" style={{ width: `${(profile.totalSpent / 10000) * 100}%` }} />
            </div>
            <p className="text-xs text-white/40">Spend {10000 - profile.totalSpent} more diamonds to reach next VIP level</p>
          </div>
        </div>
      </div>
    </div>
  );
};

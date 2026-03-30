import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthScreen = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff4e00]/20 blur-[120px] rounded-full" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-[#151619] border border-white/10 p-12 rounded-[48px] max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(255,78,0,0.3)] rotate-12">
          <Zap size={48} fill="white" />
        </div>
        
        <h1 className="text-5xl font-black mb-4 tracking-tighter italic uppercase">Bingo Live</h1>
        <p className="text-white/40 mb-12 text-lg font-medium">The world's most premium live streaming experience.</p>
        
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="bg-[#ff4e00]/20 p-2 rounded-xl text-[#ff4e00]"><ShieldCheck size={20} /></div>
            <div>
              <div className="text-sm font-bold">Secure Login</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Google Authentication</div>
            </div>
          </div>
        </div>

        <button 
          onClick={signIn}
          className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
        >
          <LogIn size={20} /> Continue with Google
        </button>
        
        <p className="mt-8 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

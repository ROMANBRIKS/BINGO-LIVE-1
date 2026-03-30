import React, { useEffect, useState } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const AdminScreen = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reports'));
    return unsub;
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
          <Shield size={40} className="text-[#ff4e00]" />
          Moderation Panel
        </h2>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Active Reports</div>
            <div className="text-2xl font-black text-[#ff4e00]">{reports.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.length === 0 ? (
          <div className="bg-[#151619] border border-white/10 rounded-[40px] p-20 text-center">
            <CheckCircle size={64} className="mx-auto mb-6 text-green-500/20" />
            <h3 className="text-2xl font-bold mb-2">No Reports Found</h3>
            <p className="text-white/40">Everything is clean. Great job!</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-[#151619] border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:border-[#ff4e00]/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold uppercase tracking-tight">{report.reason}</span>
                    <span className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Reported by @{report.reporterId.slice(0, 8)}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm">Target: <span className="text-white font-medium">@{report.targetId.slice(0, 8)}</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-white/5 border border-white/10 hover:bg-green-600 hover:border-green-600 px-6 py-3 rounded-xl font-bold transition-all">Dismiss</button>
                <button className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Take Action</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

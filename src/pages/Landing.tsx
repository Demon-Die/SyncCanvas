import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const { user, loading, signIn, signInGuest } = useAuth();
  const [joiningWifi, setJoiningWifi] = useState(false);

  const handleJoinWifi = async () => {
     setJoiningWifi(true);
     try {
        const res = await fetch('/api/network-room');
        const data = await res.json();
        if (data.roomId) {
           sessionStorage.setItem('pendingRoom', data.roomId);
           if (!user) {
              await signInGuest();
           }
        }
     } catch (e) {
        console.error(e);
     } finally {
        setJoiningWifi(false);
     }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">Loading...</div>;
  if (user) return <Navigate to="/dash" />;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md fixed w-full top-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 text-transparent bg-clip-text">SyncCanvas</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button onClick={signInGuest} variant="ghost" className="text-zinc-400 hover:text-white mr-2">
            Try as Guest
          </Button>
          <Button onClick={signIn} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 transition-all rounded-full px-6">
            Sign In
          </Button>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI-Powered Real-time Whiteboarding
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-5xl mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-600 text-transparent bg-clip-text"
        >
          Think, diagram, and build <br className="hidden md:block"/> at the speed of thought.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
        >
          SyncCanvas combines infinite canvas collaboration with Gemini AI to generate architectures, mind maps, and flows instantly.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <Button onClick={signIn} size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 h-14 text-lg font-medium transition-all hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            Start building for free
          </Button>
          <Button onClick={handleJoinWifi} disabled={joiningWifi} size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 h-14 text-lg font-medium transition-all hover:scale-105 border border-white/10">
            {joiningWifi ? 'Joining...' : 'Join WiFi Room'}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-24 relative w-full max-w-5xl aspect-video rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-2xl overflow-hidden group ring-1 ring-white/5"
        >
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
           
           {/* Decorative elements */}
           <div className="absolute top-4 left-4 flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
           </div>

           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <motion.div 
               whileHover={{ scale: 1.05, rotate: 0 }}
               className="w-64 h-32 bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-xl flex items-center justify-center shadow-2xl transform -rotate-6 transition-all duration-300 cursor-pointer"
             >
                <span className="font-medium text-zinc-300">User Flow</span>
             </motion.div>
             <div className="w-1 h-12 bg-gradient-to-b from-zinc-700 to-indigo-500 my-2"></div>
             <motion.div 
               whileHover={{ scale: 1.05, rotate: 0 }}
               className="w-64 h-32 bg-indigo-900/40 backdrop-blur-md border border-indigo-500/50 rounded-xl flex items-center justify-center shadow-2xl transform rotate-3 transition-all duration-300 cursor-pointer"
             >
                <span className="font-medium text-indigo-300">Checkout Process</span>
             </motion.div>
           </div>
        </motion.div>
      </main>
    </div>
  );
}


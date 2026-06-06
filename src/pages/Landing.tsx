import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export default function Landing() {
  const { user, loading, signIn } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">Loading...</div>;
  if (user) return <Navigate to="/dash" />;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-zinc-100 selection:bg-zinc-800">
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-800/50 backdrop-blur-sm fixed w-full top-0 z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          <span className="font-semibold text-lg tracking-tight">SyncCanvas</span>
        </div>
        <Button onClick={signIn} variant="secondary" className="bg-white text-black hover:bg-zinc-200">
          Sign In
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-400 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          AI-Powered Real-time Whiteboarding
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 bg-gradient-to-br from-white via-white to-zinc-500 text-transparent bg-clip-text">
          Think, diagram, and build <br className="hidden md:block"/> at the speed of thought.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          SyncCanvas combines infinite canvas collaboration with Gemini AI to generate architectures, mind maps, and flows instantly.
        </p>
        
        <Button onClick={signIn} size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 h-12 text-base font-medium transition-all hover:scale-105">
          Start building for free
        </Button>

        <div className="mt-24 relative w-full max-w-5xl aspect-video rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl overflow-hidden group">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-64 h-32 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <span className="text-zinc-400">User Flow</span>
             </div>
             <div className="w-1 h-12 bg-indigo-500 my-2"></div>
             <div className="w-64 h-32 bg-indigo-950/40 border border-indigo-500/50 rounded-lg flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <span className="text-indigo-300">Checkout Process</span>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}

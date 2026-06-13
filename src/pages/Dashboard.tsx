import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserWorkspaces, createWorkspace } from '../lib/db';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Plus, LayoutDashboard, LogOut, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserWorkspaces(user.uid).then(ws => {
        setWorkspaces(ws);
        setLoading(false);
      });
    }
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    const id = await createWorkspace(user.uid, 'Untitled Board');
    navigate(`/board/${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-zinc-900/30 backdrop-blur-xl p-4 flex flex-col z-10">
        <div className="flex items-center gap-2 mb-8 px-2 mt-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
             <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold tracking-tight">SyncCanvas</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200">
            <LayoutDashboard className="w-4 h-4 mr-3" />
            All Boards
          </Button>
        </nav>
        
        <div className="mt-auto px-3 py-4 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={user?.photoURL || ''} alt="" className="w-9 h-9 rounded-full bg-zinc-800 object-cover ring-2 ring-zinc-800" />
            <span className="text-sm font-medium truncate text-zinc-300">{user?.displayName || 'User'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="hover:bg-red-500/10 hover:text-red-400 rounded-full">
            <LogOut className="w-4 h-4 text-zinc-500" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12 z-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Your Boards</h1>
               <p className="text-zinc-500 mt-1">Create and manage your collaborative workspaces.</p>
            </div>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all hover:scale-105 rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {[1,2,3].map(i => (
                  <div key={i} className="h-48 rounded-2xl bg-zinc-900/50 animate-pulse border border-white/5"></div>
               ))}
            </div>
          ) : workspaces.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20 backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <LayoutDashboard className="w-8 h-8 text-zinc-500" />
              </div>
              <p className="text-zinc-400 mb-6 text-lg">No boards yet. Start creating!</p>
              <Button onClick={handleCreate} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6">
                 Create your first board
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {workspaces.map((ws, i) => (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                   <Link to={`/board/${ws.id}`}>
                     <Card className="group relative p-0 bg-zinc-900/40 border-white/10 hover:border-indigo-500/50 transition-all duration-300 h-56 flex flex-col cursor-pointer hover:bg-zinc-900/80 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(79,70,229,0.1)] rounded-2xl overflow-hidden">
                       
                       {/* Mock Canvas Preview area */}
                       <div className="h-32 w-full bg-zinc-950/50 border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 shadow-sm transform -rotate-12 group-hover:rotate-0 transition-transform duration-500"></div>
                          <div className="w-16 h-8 rounded-full bg-indigo-900/40 border border-indigo-500/30 ml-4 transform rotate-12 group-hover:rotate-0 transition-transform duration-500"></div>
                       </div>
                       
                       <div className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start">
                             <h3 className="font-semibold text-zinc-200 group-hover:text-white transition-colors truncate pr-2">{ws.name}</h3>
                             <button className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
                          <p className="text-xs text-zinc-500 mt-auto flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                            Edited {new Date(ws.updatedAt).toLocaleDateString()}
                          </p>
                       </div>
                     </Card>
                   </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

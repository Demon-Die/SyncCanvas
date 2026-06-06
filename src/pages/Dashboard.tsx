import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserWorkspaces, createWorkspace } from '../lib/db';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Plus, LayoutDashboard, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-zinc-800/50 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          <span className="font-semibold">SyncCanvas</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start bg-zinc-900/50">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            All Boards
          </Button>
        </nav>
        
        <div className="mt-auto px-2 py-4 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <img src={user?.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-zinc-800" />
            <span className="text-sm truncate">{user?.displayName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Your Boards</h1>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-500">
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </div>

          {loading ? (
            <div className="text-zinc-500">Loading boards...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-400 mb-4">No boards yet.</p>
              <Button onClick={handleCreate} variant="secondary">Create your first board</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workspaces.map(ws => (
                <Link key={ws.id} to={`/board/${ws.id}`}>
                  <Card className="p-4 bg-zinc-900/40 border-zinc-800/50 hover:border-indigo-500/50 transition-colors h-40 flex flex-col cursor-pointer hover:bg-zinc-900/80">
                    <h3 className="font-medium text-lg mb-1">{ws.name}</h3>
                    <p className="text-xs text-zinc-500 mt-auto">
                      Updated {new Date(ws.updatedAt).toLocaleDateString()}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

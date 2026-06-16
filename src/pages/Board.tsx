import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useYjsStore } from '../hooks/useYjs';
import { WhiteboardCanvas } from '../components/WhiteboardCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MousePointer2, Square, Circle, Type, Sparkles, Home, Hand, Trash2, Pen, Eraser, Undo2, Redo2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shapes, updateShape, removeShape, synced, yMap, undo, redo, awareness, awarenessUsers } = useYjsStore(id!, user);
  const [tool, setTool] = useState('select');
  const [selectedId, selectShape] = useState<string | null>(null);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
         removeShape(selectedId);
         selectShape(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeShape]);

  useEffect(() => {
    if (synced && yMap && Object.keys(shapes).length === 0 && user) {
       // Only try loaded if empty
       import('firebase/firestore').then(({ doc, getDoc }) => {
          import('../firebase').then(({ db }) => {
             getDoc(doc(db, 'workspaces', id!)).then(d => {
                if (d.exists() && d.data().state) {
                   try {
                     const loaded = JSON.parse(d.data().state);
                     // Set local yMap
                     Object.keys(loaded).forEach(k => {
                        if (!yMap.has(k)) yMap.set(k, loaded[k]);
                     });
                   } catch(e) {}
                }
             });
          });
       });
    }
  }, [synced, yMap, user, id]); // Intentionally run only on sync connect

  useEffect(() => {
    if (!synced || !user || Object.keys(shapes).length === 0) return;
    const timeout = setTimeout(() => {
      import('firebase/firestore').then(({ doc, updateDoc }) => {
        import('../firebase').then(({ db }) => {
           updateDoc(doc(db, 'workspaces', id!), {
              state: JSON.stringify(shapes),
              updatedAt: Date.now()
           }).catch(err => console.error(err));
        });
      });
    }, 5000);
    return () => clearTimeout(timeout);
  }, [shapes, synced, user, id]);

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      
      if (data.shapes) {
        // AI returns arrays of shapes, we need to add them
        data.shapes.forEach((shape: any) => {
          const shapeId = uuidv4();
          updateShape(shapeId, {
            ...shape,
            id: shapeId,
            x: shape.x + window.innerWidth / 2 - 200, // Center approx
            y: shape.y + window.innerHeight / 2 - 200,
          });
        });
      }
      setPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div 
      className="h-screen w-screen bg-zinc-950 overflow-hidden relative"
      onPointerMove={(e) => {
        if (awareness) {
           awareness.setLocalStateField('cursor', { x: e.clientX, y: e.clientY });
        }
      }}
      onPointerLeave={() => {
        if (awareness) {
           awareness.setLocalStateField('cursor', null);
        }
      }}
    >
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="secondary" size="icon" onClick={() => navigate('/dash')} className="bg-zinc-900/60 backdrop-blur-xl border-white/10 text-zinc-300 hover:bg-zinc-800/80 hover:text-white rounded-xl shadow-lg">
            <Home className="w-4 h-4" />
          </Button>
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-zinc-200 shadow-lg flex items-center gap-2">
            Board {synced ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> : <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />}
          </div>
        </div>
        
        {/* AI Prompt Input */}
        <form onSubmit={handleAiGenerate} className="pointer-events-auto flex items-center gap-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-lg w-[450px] ring-1 ring-white/5 transition-all focus-within:ring-indigo-500/50 focus-within:bg-zinc-900/80">
          <Input 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="E.g., Generate a mind map for machine learning..."
            className="border-0 bg-transparent focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-500 rounded-full"
            disabled={aiLoading}
          />
          <Button disabled={aiLoading} type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-500 shrink-0">
            <Sparkles className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="pointer-events-auto">
           <div className="flex -space-x-2">
              {Array.from(awarenessUsers.entries()).map(([clientId, state]) => {
                 if (!state.user) return null;
                 return (
                   <div key={clientId} className="relative group">
                     {state.user.photoURL ? (
                        <img src={state.user.photoURL} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 object-cover" alt={state.user.name} />
                     ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 text-xs flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: state.user.color }}>
                           {state.user.name.charAt(0).toUpperCase()}
                        </div>
                     )}
                     <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-800 text-zinc-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {state.user.name}
                     </span>
                   </div>
                 )
              })}
           </div>
        </div>
      </div>

      {/* Tools Left Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0, y: '-50%' }}
        animate={{ x: 0, opacity: 1, y: '-50%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute left-6 top-1/2 flex flex-col gap-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl z-10 pointer-events-auto shadow-2xl ring-1 ring-white/5"
      >
        <ToolButton icon={<MousePointer2 />} active={tool === 'select'} onClick={() => setTool('select')} label="Select (V)" />
        <ToolButton icon={<Hand />} active={tool === 'pan'} onClick={() => setTool('pan')} label="Pan (H)" />
        <div className="h-px w-full bg-zinc-800 my-1" />
        <ToolButton icon={<Square />} active={tool === 'rect'} onClick={() => setTool('rect')} label="Rectangle (R)" />
        <ToolButton icon={<Circle />} active={tool === 'circle'} onClick={() => setTool('circle')} label="Circle (C)" />
        <ToolButton icon={<Type />} active={tool === 'text'} onClick={() => setTool('text')} label="Text (T)" />
        <ToolButton icon={<Pen />} active={tool === 'pen'} onClick={() => setTool('pen')} label="Pen (P)" />
        <ToolButton icon={<Eraser />} active={tool === 'eraser'} onClick={() => setTool('eraser')} label="Eraser (E)" />
        <div className="h-px w-full bg-zinc-800 my-1" />
        <ToolButton icon={<Undo2 />} active={false} onClick={undo} label="Undo" disabled={!undo} />
        <ToolButton icon={<Redo2 />} active={false} onClick={redo} label="Redo" disabled={!redo} />
      </motion.div>

      {/* Remote Cursors Overlay */}
      {Array.from(awarenessUsers.entries()).map(([clientId, state]) => {
         // Don't render our own cursor
         if (awareness && clientId === awareness.clientID) return null;
         if (!state.cursor || !state.user) return null;
         
         return (
            <motion.div
               key={clientId}
               initial={{ x: state.cursor.x, y: state.cursor.y }}
               animate={{ x: state.cursor.x, y: state.cursor.y }}
               transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
               className="absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-start"
               style={{ originX: 0, originY: 0 }}
            >
               <MousePointer2 className="w-5 h-5 drop-shadow-md" fill={state.user.color} color="white" />
               <div 
                 className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-md whitespace-nowrap mt-1 ml-3"
                 style={{ backgroundColor: state.user.color }}
               >
                 {state.user.name}
               </div>
            </motion.div>
         );
      })}

      {/* Canvas Area */}
      <WhiteboardCanvas shapes={shapes} updateShape={updateShape} tool={tool} setTool={setTool} selectedId={selectedId} selectShape={selectShape} brushColor={brushColor} />

      {/* Properties Toolbar */}
      {((selectedId && shapes[selectedId]) || tool === 'pen') && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl z-10 shadow-2xl transition-all animate-in slide-in-from-bottom-5 ring-1 ring-white/5">
          {selectedId && shapes[selectedId] && shapes[selectedId].type === 'text' && (
            <>
              <Input 
                 value={shapes[selectedId].text || ''}
                 onChange={(e) => updateShape(selectedId, { text: e.target.value })}
                 placeholder="Add text..."
                 className="w-48 bg-zinc-950/50 border-zinc-800 focus-visible:ring-indigo-500 text-sm text-zinc-100 rounded-xl"
              />
              <div className="w-px h-6 bg-zinc-800" />
            </>
          )}
          <div className="flex gap-1.5 items-center">
             {['#3f3f46', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'].map(c => {
                const isActive = tool === 'pen' ? brushColor === c : (shapes[selectedId!]?.type === 'path' ? shapes[selectedId!].stroke === c : shapes[selectedId!].fill === c);
                return (
                  <button 
                    key={c} 
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${isActive ? 'border-zinc-300 scale-110 shadow-sm' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                       if (tool === 'pen') {
                          setBrushColor(c);
                       } else if (selectedId) {
                          if (shapes[selectedId].type === 'path') {
                             updateShape(selectedId, { stroke: c });
                          } else {
                             updateShape(selectedId, { fill: c });
                          }
                       }
                    }}
                  />
                );
             })}
          </div>
          {selectedId && shapes[selectedId] && (
            <>
              <div className="w-px h-6 bg-zinc-800" />
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 rounded-full" onClick={() => { removeShape(selectedId); selectShape(null); }}>
                 <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ToolButton({ icon, active, onClick, label, disabled }: { icon: any, active: boolean, onClick: () => void, label?: string, disabled?: boolean }) {
  return (
    <motion.button 
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative group
        ${disabled ? 'opacity-50 cursor-not-allowed text-zinc-600' : 
          active ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] text-white ring-1 ring-indigo-400/50' : 
          'text-zinc-400 hover:text-zinc-100 hover:bg-white/10'}`}
    >
      {icon}
      {label && (
         <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
           {label}
         </span>
      )}
    </motion.button>
  );
}

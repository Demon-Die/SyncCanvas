import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjsStore(roomId: string, user: any) {
  const [synced, setSynced] = useState(false);
  const [shapes, setShapes] = useState<Record<string, any>>({});
  const [yMap, setYMap] = useState<Y.Map<any> | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
  const [awareness, setAwareness] = useState<any>(null);
  const [awarenessUsers, setAwarenessUsers] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    const doc = new Y.Doc();
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/ws/${roomId}`
      : `ws://${window.location.host}/ws/${roomId}`;

    const wsProvider = new WebsocketProvider(wsUrl, roomId, doc);
    setProvider(wsProvider);
    setAwareness(wsProvider.awareness);
    
    // Set initial awareness state for this user
    if (user) {
       wsProvider.awareness.setLocalStateField('user', {
          name: user.displayName || 'Anonymous',
          color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
          photoURL: user.photoURL
       });
    }

    const handleAwarenessChange = () => {
       setAwarenessUsers(new Map(wsProvider.awareness.getStates()));
    };
    wsProvider.awareness.on('change', handleAwarenessChange);
    
    const map = doc.getMap('shapes');
    setYMap(map);

    const manager = new Y.UndoManager(map);
    setUndoManager(manager);

    wsProvider.on('status', (event: { status: string }) => {
      setSynced(event.status === 'connected');
    });

    const observer = () => {
      setShapes(map.toJSON());
    };

    map.observe(observer);
    setShapes(map.toJSON());

    return () => {
      wsProvider.awareness.off('change', handleAwarenessChange);
      map.unobserve(observer);
      manager.destroy();
      wsProvider.disconnect();
      doc.destroy();
    };
  }, [roomId, user]);

  const updateShape = useCallback((id: string, newProps: any) => {
    if (!yMap) return;
    const current = yMap.get(id) || {};
    yMap.set(id, { ...current, ...newProps });
  }, [yMap]);

  const removeShape = useCallback((id: string) => {
    if (!yMap) return;
    yMap.delete(id);
  }, [yMap]);

  const undo = useCallback(() => undoManager?.undo(), [undoManager]);
  const redo = useCallback(() => undoManager?.redo(), [undoManager]);

  return { yMap, shapes, synced, updateShape, removeShape, provider, undo, redo, awareness, awarenessUsers };
}

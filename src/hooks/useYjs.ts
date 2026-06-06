import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjsStore(roomId: string) {
  const [synced, setSynced] = useState(false);
  const [shapes, setShapes] = useState<Record<string, any>>({});
  const [yMap, setYMap] = useState<Y.Map<any> | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/ws/${roomId}`
      : `ws://${window.location.host}/ws/${roomId}`;

    const wsProvider = new WebsocketProvider(wsUrl, roomId, doc);
    setProvider(wsProvider);
    
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
      map.unobserve(observer);
      manager.destroy();
      wsProvider.disconnect();
      doc.destroy();
    };
  }, [roomId]);

  const updateShape = (id: string, newProps: any) => {
    if (!yMap) return;
    const current = yMap.get(id) || {};
    yMap.set(id, { ...current, ...newProps });
  };

  const removeShape = (id: string) => {
    if (!yMap) return;
    yMap.delete(id);
  };

  const undo = () => undoManager?.undo();
  const redo = () => undoManager?.redo();

  return { yMap, shapes, synced, updateShape, removeShape, provider, undo, redo };
}

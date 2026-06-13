import * as fabric from 'fabric';
import { useEffect, useRef } from 'react';

export function WhiteboardCanvas({ shapes, updateShape, removeShape, tool, setTool, selectedId, selectShape }: any) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current || !canvasContainerRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    // handling selection
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0] as any;
      if (selected && selected.id) {
         selectShape(selected.id);
      }
    });
    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0] as any;
      if (selected && selected.id) {
         selectShape(selected.id);
      }
    });
    canvas.on('selection:cleared', () => {
      selectShape(null);
    });

    // Handle modification: moving, scaling, rotating
    const onModified = (e: any) => {
      const target = e.target;
      if (!target || !target.id) return;
      if (target.isRemoteUpdate) return;
      
      const { id, type } = target;
      
      // Calculate scaling to update base width/height
      const scaleX = target.scaleX || 1;
      const scaleY = target.scaleY || 1;
      target.set({ scaleX: 1, scaleY: 1 });
      
      let width = target.width * scaleX;
      let height = target.height * scaleY;
      let radius = target.radius ? target.radius * scaleX : undefined;
      
      if (type === 'rect') target.set({ width, height });
      if (type === 'circle') target.set({ radius });
      
      updateShape(id, {
        x: target.left,
        y: target.top,
        width,
        height,
        radius,
        fill: target.fill,
        text: target.text, // for Textbox
        fontSize: target.fontSize, // for Textbox
      });
    };

    canvas.on('object:modified', onModified);

    // Textbox edit handling
    canvas.on('text:changed', (e: any) => {
       const target = e.target;
       if (!target || !target.id) return;
       if (target.isRemoteUpdate) return;
       updateShape(target.id, { text: target.text });
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // Only run once on mount

  // Effect to sync shapes from props (Y.js) to Fabric Canvas
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    const currentObjectIds = new Set();
    Object.values(shapes).forEach((shapeData: any) => {
        currentObjectIds.add(shapeData.id);
        const existingObj = canvas.getObjects().find((o: any) => o.id === shapeData.id) as any;
        
        if (existingObj) {
            existingObj.isRemoteUpdate = true;
            existingObj.set({
               left: shapeData.x,
               top: shapeData.y,
               fill: shapeData.fill,
            });
            if (shapeData.type === 'rect' || shapeData.type === 'sticky') {
               existingObj.set({ width: shapeData.width, height: shapeData.height });
            } else if (shapeData.type === 'circle') {
               existingObj.set({ radius: shapeData.radius });
            } else if (shapeData.type === 'text') {
               existingObj.set({ text: shapeData.text, fill: shapeData.fill, fontSize: shapeData.fontSize, width: shapeData.width });
            } else if (shapeData.type === 'path') {
               // Update path coordinates
               existingObj.set({ path: shapeData.path });
            }
            existingObj.setCoords();
            existingObj.isRemoteUpdate = false;
        } else {
            let obj: any;
            if (shapeData.type === 'rect' || shapeData.type === 'sticky') {
                obj = new fabric.Rect({
                    id: shapeData.id,
                    left: shapeData.x,
                    top: shapeData.y,
                    width: shapeData.width || 120,
                    height: shapeData.height || 120,
                    fill: shapeData.fill || '#3f3f46',
                    rx: shapeData.type === 'sticky' ? 8 : 16,
                    ry: shapeData.type === 'sticky' ? 8 : 16,
                } as any);
            } else if (shapeData.type === 'circle') {
                obj = new fabric.Circle({
                    id: shapeData.id,
                    left: shapeData.x,
                    top: shapeData.y,
                    radius: shapeData.radius || 60,
                    fill: shapeData.fill || '#3f3f46',
                } as any);
            } else if (shapeData.type === 'text') {
                obj = new fabric.Textbox(shapeData.text || 'Text', {
                    id: shapeData.id,
                    left: shapeData.x,
                    top: shapeData.y,
                    fill: shapeData.fill || '#fff',
                    fontSize: shapeData.fontSize || 24,
                    width: shapeData.width || 200,
                } as any);
            } else if (shapeData.type === 'path' && shapeData.path) {
                obj = new fabric.Path(shapeData.path, {
                    id: shapeData.id,
                    left: shapeData.x,
                    top: shapeData.y,
                    stroke: shapeData.stroke || '#fff',
                    strokeWidth: shapeData.strokeWidth || 3,
                    fill: '',
                    originX: 'center',
                    originY: 'center'
                } as any);
            }
            if (obj) {
                obj.isRemoteUpdate = true;
                canvas.add(obj);
                obj.isRemoteUpdate = false;
            }
        }
    });
    
    // Remove shapes deleted from Y.js
    canvas.getObjects().forEach((obj: any) => {
        if (!currentObjectIds.has(obj.id)) {
            canvas.remove(obj);
        }
    });

    // Handle selection sync if changed outside
    const selectedObj = canvas.getObjects().find((o: any) => o.id === selectedId);
    if (selectedId && selectedObj && canvas.getActiveObject() !== selectedObj) {
        canvas.setActiveObject(selectedObj);
    } else if (!selectedId && canvas.getActiveObject()) {
        canvas.discardActiveObject();
    }
    
    canvas.requestRenderAll();
  }, [shapes, selectedId]);

  // Effect to handle tools
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    canvas.isDrawingMode = (tool === 'pen');
    if (tool === 'pen') {
       const brush = new fabric.PencilBrush(canvas);
       brush.color = '#ffffff';
       brush.width = 3;
       canvas.freeDrawingBrush = brush;
    }

    if (tool !== 'select') {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        canvas.getObjects().forEach(o => o.set('selectable', false));
        canvas.selection = false;
        
        if (tool === 'eraser') {
            canvas.hoverCursor = 'crosshair';
        } else {
            canvas.hoverCursor = 'move'; // default
        }
    } else {
        canvas.getObjects().forEach(o => o.set('selectable', true));
        canvas.selection = true;
        canvas.hoverCursor = 'move';
    }

    const onMouseDown = (opt: any) => {
        if (tool === 'select' || tool === 'pan' || tool === 'pen') return;
        
        if (tool === 'eraser') {
            if (opt.target && opt.target.id) {
                removeShape(opt.target.id);
            }
            return;
        }
        
        const pointer = canvas.getScenePoint(opt.e);
        const { x, y } = pointer;
        const id = Date.now().toString();

        if (tool === 'rect') {
            updateShape(id, { id, type: 'rect', x, y, width: 120, height: 120, fill: '#6366f1' });
            setTool('select');
        } else if (tool === 'circle') {
            updateShape(id, { id, type: 'circle', x, y, radius: 60, fill: '#6366f1' });
            setTool('select');
        } else if (tool === 'text') {
            updateShape(id, { id, type: 'text', x, y, text: 'New Text', fill: '#ffffff', fontSize: 24, width: 200 });
            setTool('select');
        }
    };
    
    // For panning logic
    let isDragging = false;
    let lastPosX: number, lastPosY: number;

    const startPan = (opt: any) => {
        if (tool === 'pan') {
            // Check if user holds alt to pan or if tool is pan
            isDragging = true;
            canvas.defaultCursor = 'grabbing';
            const e = opt.e as MouseEvent | TouchEvent;
            const touch = (e as TouchEvent).touches?.[0];
            lastPosX = touch ? touch.clientX : (e as MouseEvent).clientX;
            lastPosY = touch ? touch.clientY : (e as MouseEvent).clientY;
        } else {
            onMouseDown(opt);
        }
    };
    
    const onMouseMove = (opt: any) => {
        if (isDragging && tool === 'pan') {
            const vpt = canvas.viewportTransform;
            const e = opt.e as MouseEvent | TouchEvent;
            const touch = (e as TouchEvent).touches?.[0];
            const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
            const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
            
            if (vpt) {
              vpt[4] += clientX - lastPosX;
              vpt[5] += clientY - lastPosY;
              canvas.requestRenderAll();
            }
            lastPosX = clientX;
            lastPosY = clientY;
        }
    };
    
    const stopPan = () => {
        isDragging = false;
        if (tool === 'pan') {
             canvas.defaultCursor = 'grab';
        }
    };
    
    const onWheel = (opt: any) => {
        opt.e.preventDefault();
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.max(0.1, Math.min(zoom, 20));
        const zoomPoint = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
        canvas.zoomToPoint(zoomPoint, zoom);
    };
    
    // Listen for path created when in pen mode
    const onPathCreated = (opt: any) => {
        if (opt.path) {
           const pathObj = opt.path;
           const id = Date.now().toString();
           // Get path data
           const pathData = pathObj.path;
           updateShape(id, {
               id,
               type: 'path',
               path: pathData,
               stroke: pathObj.stroke,
               strokeWidth: pathObj.strokeWidth,
               x: pathObj.left,
               y: pathObj.top,
           });
           canvas.remove(pathObj); // the Y.js sync will add it back
           setTool('select');
        }
    };

    canvas.on('mouse:down', startPan);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', stopPan);
    canvas.on('mouse:wheel', onWheel);
    canvas.on('path:created', onPathCreated);

    return () => {
        canvas.off('mouse:down', startPan);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', stopPan);
        canvas.off('mouse:wheel', onWheel);
        canvas.off('path:created', onPathCreated);
    };
  }, [tool, updateShape, setTool]);

  useEffect(() => {
     if (fabricRef.current && tool === 'pan') {
         fabricRef.current.defaultCursor = 'grab';
     } else if (fabricRef.current && tool === 'eraser') {
         fabricRef.current.defaultCursor = 'crosshair';
     } else if (fabricRef.current) {
         fabricRef.current.defaultCursor = 'default';
     }
  }, [tool])

  return (
    <div ref={canvasContainerRef} className="w-full h-full overflow-hidden focus:outline-none">
      <canvas ref={canvasElRef} className="focus:outline-none" />
    </div>
  );
}

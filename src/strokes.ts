// strokes.ts: Stroke object management with layers and z-ordering

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  tool: 'pen' | 'eraser' | 'rectangle';
  color: string;
  brushSize: number;
  layer: number;
  zIndex: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  // Rectangle-specific properties
  rectangle?: Rectangle;
}

export class StrokeManager {
  private strokes: Stroke[] = [];
  private nextZIndex = 0;
  private currentLayer = 0;
  private layers: Set<number> = new Set([0]);

  constructor() {
    // Initialize with default layer
    this.layers.add(0);
  }

  createStroke(tool: 'pen' | 'eraser' | 'rectangle', color: string, brushSize: number): Stroke {
    const stroke: Stroke = {
      id: this.generateId(),
      points: [],
      tool,
      color,
      brushSize,
      layer: this.currentLayer,
      zIndex: this.nextZIndex++,
      bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    };
    this.strokes.push(stroke);
    return stroke;
  }

  createRectangle(x: number, y: number, width: number, height: number, color: string, brushSize: number): Stroke {
    const stroke: Stroke = {
      id: this.generateId(),
      points: [],
      tool: 'rectangle',
      color,
      brushSize,
      layer: this.currentLayer,
      zIndex: this.nextZIndex++,
      bounds: { 
        minX: Math.min(x, x + width), 
        minY: Math.min(y, y + height), 
        maxX: Math.max(x, x + width), 
        maxY: Math.max(y, y + height) 
      },
      rectangle: { x, y, width, height }
    };
    this.strokes.push(stroke);
    return stroke;
  }

  addPointToStroke(strokeId: string, x: number, y: number, pressure: number): void {
    const stroke = this.strokes.find(s => s.id === strokeId);
    if (!stroke) return;

    const point: StrokePoint = {
      x,
      y,
      pressure,
      timestamp: Date.now()
    };

    stroke.points.push(point);
    this.updateStrokeBounds(stroke, x, y);
  }

  private updateStrokeBounds(stroke: Stroke, x: number, y: number): void {
    stroke.bounds.minX = Math.min(stroke.bounds.minX, x);
    stroke.bounds.minY = Math.min(stroke.bounds.minY, y);
    stroke.bounds.maxX = Math.max(stroke.bounds.maxX, x);
    stroke.bounds.maxY = Math.max(stroke.bounds.maxY, y);
  }

  getStrokesInViewport(viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number): Stroke[] {
    const viewportBounds = {
      minX: viewportX,
      minY: viewportY,
      maxX: viewportX + viewportWidth,
      maxY: viewportY + viewportHeight
    };

    return this.strokes
      .filter(stroke => this.strokesIntersect(stroke.bounds, viewportBounds))
      .sort((a, b) => {
        // Sort by layer first, then by z-index within layer
        if (a.layer !== b.layer) {
          return a.layer - b.layer;
        }
        return a.zIndex - b.zIndex;
      });
  }

  private strokesIntersect(bounds1: Stroke['bounds'], bounds2: Stroke['bounds']): boolean {
    return !(bounds1.maxX < bounds2.minX || 
             bounds1.minX > bounds2.maxX || 
             bounds1.maxY < bounds2.minY || 
             bounds1.minY > bounds2.maxY);
  }

  renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, offsetX: number, offsetY: number): void {
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      this.renderRectangle(ctx, stroke, offsetX, offsetY);
    } else if (stroke.points.length >= 2) {
      this.renderPath(ctx, stroke, offsetX, offsetY);
    }
  }

  private renderPath(ctx: CanvasRenderingContext2D, stroke: Stroke, offsetX: number, offsetY: number): void {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }

    ctx.beginPath();
    
    // Draw the stroke path
    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const x = point.x - offsetX;
      const y = point.y - offsetY;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Calculate line width based on pressure
        const lineWidth = stroke.brushSize * point.pressure;
        ctx.lineWidth = Math.max(1, lineWidth);
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    ctx.restore();
  }

  private renderRectangle(ctx: CanvasRenderingContext2D, stroke: Stroke, offsetX: number, offsetY: number): void {
    if (!stroke.rectangle) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    
    const rect = stroke.rectangle;
    const x = rect.x - offsetX;
    const y = rect.y - offsetY;
    
    // Set stroke style only (no fill)
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.brushSize;
    
    // Draw rounded rectangle outline
    ctx.beginPath();
    const radius = Math.min(rect.width, rect.height) * 0.1; // 10% of smaller dimension
    ctx.roundRect(x, y, rect.width, rect.height, radius);
    ctx.stroke();
    
    ctx.restore();
  }

  renderViewport(ctx: CanvasRenderingContext2D, viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number): void {
    const strokesInView = this.getStrokesInViewport(viewportX, viewportY, viewportWidth, viewportHeight);
    
    for (const stroke of strokesInView) {
      this.renderStroke(ctx, stroke, viewportX, viewportY);
    }
  }

  deleteStroke(strokeId: string): void {
    const index = this.strokes.findIndex(s => s.id === strokeId);
    if (index !== -1) {
      this.strokes.splice(index, 1);
    }
  }

  clearCanvas(): void {
    this.strokes = [];
    this.nextZIndex = 0;
  }

  setCurrentLayer(layer: number): void {
    this.currentLayer = layer;
    this.layers.add(layer);
  }

  getCurrentLayer(): number {
    return this.currentLayer;
  }

  getLayers(): number[] {
    return Array.from(this.layers).sort((a, b) => a - b);
  }

  deleteLayer(layer: number): void {
    this.strokes = this.strokes.filter(stroke => stroke.layer !== layer);
    this.layers.delete(layer);
    
    // If we deleted the current layer, switch to layer 0
    if (this.currentLayer === layer) {
      this.currentLayer = 0;
    }
  }

  moveStrokeToLayer(strokeId: string, newLayer: number): void {
    const stroke = this.strokes.find(s => s.id === strokeId);
    if (stroke) {
      stroke.layer = newLayer;
      this.layers.add(newLayer);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getStrokeCount(): number {
    return this.strokes.length;
  }

  getLayerStrokeCount(layer: number): number {
    return this.strokes.filter(s => s.layer === layer).length;
  }
} 
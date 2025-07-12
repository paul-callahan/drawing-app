// eraser.ts: Eraser tool implementation

import { EraserStroke, StrokePoint, RenderContext } from '../types';

export class EraserTool {
  static createStroke(id: string, color: string, brushSize: number, layer: number, zIndex: number): EraserStroke {
    return {
      id,
      tool: 'eraser',
      color,
      brushSize,
      layer,
      zIndex,
      bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      points: []
    };
  }

  static addPoint(stroke: EraserStroke, x: number, y: number, pressure: number): void {
    const point: StrokePoint = {
      x,
      y,
      pressure,
      timestamp: Date.now()
    };

    stroke.points.push(point);
    EraserTool.updateBounds(stroke, x, y);
  }

  static updateBounds(stroke: EraserStroke, x: number, y: number): void {
    stroke.bounds.minX = Math.min(stroke.bounds.minX, x);
    stroke.bounds.minY = Math.min(stroke.bounds.minY, y);
    stroke.bounds.maxX = Math.max(stroke.bounds.maxX, x);
    stroke.bounds.maxY = Math.max(stroke.bounds.maxY, y);
  }

  static render(stroke: EraserStroke, context: RenderContext): void {
    if (stroke.points.length < 2) return;

    const { ctx, offsetX, offsetY } = context;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';

    ctx.beginPath();
    
    // Draw the eraser path
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

  static isPointInStroke(stroke: EraserStroke, x: number, y: number): boolean {
    // Check if point is near any stroke point
    for (const point of stroke.points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance <= stroke.brushSize) {
        return true;
      }
    }
    return false;
  }
} 
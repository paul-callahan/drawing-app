// pen.ts: Pen tool implementation

import { PenStroke, StrokePoint, RenderContext } from '../types';

export class PenTool {
  static createStroke(id: string, color: string, brushSize: number, layer: number, zIndex: number): PenStroke {
    return {
      id,
      tool: 'pen',
      color,
      brushSize,
      layer,
      zIndex,
      bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      points: []
    };
  }

  static addPoint(stroke: PenStroke, x: number, y: number, pressure: number): void {
    const point: StrokePoint = {
      x,
      y,
      pressure,
      timestamp: Date.now()
    };

    stroke.points.push(point);
    PenTool.updateBounds(stroke, x, y);
  }

  static updateBounds(stroke: PenStroke, x: number, y: number): void {
    stroke.bounds.minX = Math.min(stroke.bounds.minX, x);
    stroke.bounds.minY = Math.min(stroke.bounds.minY, y);
    stroke.bounds.maxX = Math.max(stroke.bounds.maxX, x);
    stroke.bounds.maxY = Math.max(stroke.bounds.maxY, y);
  }

  static render(stroke: PenStroke, context: RenderContext): void {
    if (stroke.points.length < 2) return;

    const { ctx, offsetX, offsetY } = context;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;

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

  static isPointInStroke(stroke: PenStroke, x: number, y: number): boolean {
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
// rectangle.ts: Rectangle tool implementation

import { RectangleStroke, StrokePoint, RenderContext, Rectangle } from '../types';

export class RectangleTool {
  static createStroke(id: string, color: string, brushSize: number, layer: number, zIndex: number): RectangleStroke {
    return {
      id,
      tool: 'rectangle',
      color,
      brushSize,
      layer,
      zIndex,
      bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      points: [],
      rectangle: { x: 0, y: 0, width: 0, height: 0 }
    };
  }

  static createRectangle(id: string, x: number, y: number, width: number, height: number, color: string, brushSize: number, layer: number, zIndex: number): RectangleStroke {
    return {
      id,
      tool: 'rectangle',
      color,
      brushSize,
      layer,
      zIndex,
      bounds: { 
        minX: Math.min(x, x + width), 
        minY: Math.min(y, y + height), 
        maxX: Math.max(x, x + width), 
        maxY: Math.max(y, y + height) 
      },
      points: [],
      rectangle: { x, y, width, height }
    };
  }

  static addPoint(stroke: RectangleStroke, x: number, y: number, pressure: number): void {
    const point: StrokePoint = {
      x,
      y,
      pressure,
      timestamp: Date.now()
    };

    stroke.points.push(point);
    RectangleTool.updateBounds(stroke, x, y);
  }

  static updateBounds(stroke: RectangleStroke, x: number, y: number): void {
    stroke.bounds.minX = Math.min(stroke.bounds.minX, x);
    stroke.bounds.minY = Math.min(stroke.bounds.minY, y);
    stroke.bounds.maxX = Math.max(stroke.bounds.maxX, x);
    stroke.bounds.maxY = Math.max(stroke.bounds.maxY, y);
  }

  static updateRectangleBounds(stroke: RectangleStroke): void {
    if (!stroke.rectangle) return;
    
    const rect = stroke.rectangle;
    stroke.bounds.minX = rect.x;
    stroke.bounds.minY = rect.y;
    stroke.bounds.maxX = rect.x + rect.width;
    stroke.bounds.maxY = rect.y + rect.height;
  }

  static render(stroke: RectangleStroke, context: RenderContext): void {
    if (!stroke.rectangle) return;

    const { ctx, offsetX, offsetY } = context;

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

  static isPointInStroke(stroke: RectangleStroke, x: number, y: number): boolean {
    if (!stroke.rectangle) return false;
    
    // Check if point is inside rectangle
    return x >= stroke.rectangle.x && 
           x <= stroke.rectangle.x + stroke.rectangle.width &&
           y >= stroke.rectangle.y && 
           y <= stroke.rectangle.y + stroke.rectangle.height;
  }

  static moveRectangle(stroke: RectangleStroke, deltaX: number, deltaY: number): void {
    if (!stroke.rectangle) return;
    
    stroke.rectangle.x += deltaX;
    stroke.rectangle.y += deltaY;
    RectangleTool.updateRectangleBounds(stroke);
  }

  static resizeRectangle(stroke: RectangleStroke, scaleX: number, scaleY: number, offsetX: number, offsetY: number): void {
    if (!stroke.rectangle) return;
    
    const originalX = stroke.rectangle.x;
    const originalY = stroke.rectangle.y;
    
    stroke.rectangle.x = originalX + offsetX;
    stroke.rectangle.y = originalY + offsetY;
    stroke.rectangle.width *= scaleX;
    stroke.rectangle.height *= scaleY;
    
    RectangleTool.updateRectangleBounds(stroke);
  }
} 
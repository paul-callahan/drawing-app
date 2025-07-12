// eraser.ts: Eraser tool implementation - deletes entire objects

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
    // Eraser strokes are not rendered - they work invisibly
    // The eraser only deletes objects, it doesn't leave visual traces
    return;
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

  // New method to check if eraser stroke intersects with another stroke
  static intersectsWithStroke(eraserStroke: EraserStroke, targetStroke: any): boolean {
    // Check if any point in the eraser stroke is close to the target stroke
    for (const eraserPoint of eraserStroke.points) {
      if (this.isPointNearStroke(eraserPoint, targetStroke)) {
        return true;
      }
    }
    return false;
  }

  private static isPointNearStroke(point: StrokePoint, stroke: any): boolean {
    // For rectangle strokes, check if point is inside or near the rectangle
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      const rect = stroke.rectangle;
      const margin = stroke.brushSize || 10; // Add some margin for easier selection
      
      return point.x >= rect.x - margin && 
             point.x <= rect.x + rect.width + margin &&
             point.y >= rect.y - margin && 
             point.y <= rect.y + rect.height + margin;
    }
    
    // For pen/eraser strokes, check if point is near any stroke point
    for (const strokePoint of stroke.points) {
      const distance = Math.sqrt((point.x - strokePoint.x) ** 2 + (point.y - strokePoint.y) ** 2);
      const threshold = Math.max(stroke.brushSize || 10, 10); // Use stroke brush size or minimum threshold
      if (distance <= threshold) {
        return true;
      }
    }
    
    return false;
  }
} 
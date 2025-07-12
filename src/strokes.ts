// strokes.ts: Stroke object management with layers and z-ordering

import { Stroke, RenderContext } from './types';
import { ToolFactory } from './tools/factory';

export type { Stroke } from './types';

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
    const stroke = ToolFactory.createStroke(
      tool,
      this.generateId(),
      color,
      brushSize,
      this.currentLayer,
      this.nextZIndex++
    );
    this.strokes.push(stroke);
    return stroke;
  }

  createRectangle(x: number, y: number, width: number, height: number, color: string, brushSize: number): Stroke {
    const stroke = ToolFactory.createRectangle(
      this.generateId(),
      x,
      y,
      width,
      height,
      color,
      brushSize,
      this.currentLayer,
      this.nextZIndex++
    );
    this.strokes.push(stroke);
    return stroke;
  }

  addPointToStroke(strokeId: string, x: number, y: number, pressure: number): void {
    const stroke = this.strokes.find(s => s.id === strokeId);
    if (!stroke) return;

    ToolFactory.addPoint(stroke, x, y, pressure);
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
    const context: RenderContext = { ctx, offsetX, offsetY };
    ToolFactory.render(stroke, context);
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

  getStrokeCount(): number {
    return this.strokes.length;
  }

  getLayerStrokeCount(layer: number): number {
    return this.strokes.filter(stroke => stroke.layer === layer).length;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 
// types.ts: Common types and interfaces for all drawing tools

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

export interface StrokeBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface BaseStroke {
  id: string;
  tool: 'pen' | 'eraser' | 'rectangle';
  color: string;
  brushSize: number;
  layer: number;
  zIndex: number;
  bounds: StrokeBounds;
}

export interface PenStroke extends BaseStroke {
  tool: 'pen';
  points: StrokePoint[];
}

export interface EraserStroke extends BaseStroke {
  tool: 'eraser';
  points: StrokePoint[];
}

export interface RectangleStroke extends BaseStroke {
  tool: 'rectangle';
  points: StrokePoint[];
  rectangle: Rectangle;
}

export type Stroke = PenStroke | EraserStroke | RectangleStroke;

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  offsetX: number;
  offsetY: number;
} 
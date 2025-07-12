// canvas.ts: Canvas state and rendering with stroke-based objects

import { StrokeManager } from './strokes';

export interface CanvasState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  pressure: number;
  pressureSensitivity: boolean;
  currentTool: 'pen' | 'eraser' | 'rectangle';
  brushSize: number;
  brushColor: string;
  offsetX: number;
  offsetY: number;
  zoom: number;
  currentStrokeId: string | null;
  // Rectangle drawing state
  isDrawingRectangle: boolean;
  rectangleStartX: number;
  rectangleStartY: number;
  rectangleEndX: number;
  rectangleEndY: number;
}

export const state: CanvasState = {
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  pressure: 0.5,
  pressureSensitivity: true,
  currentTool: 'pen',
  brushSize: 5,
  brushColor: '#000000',
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  currentStrokeId: null,
  isDrawingRectangle: false,
  rectangleStartX: 0,
  rectangleStartY: 0,
  rectangleEndX: 0,
  rectangleEndY: 0
};

export const strokeManager = new StrokeManager();

// Canvas element
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export function initCanvas(canvasElement: HTMLCanvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d')!;
  
  // Set initial canvas size
  canvas.width = 1200;
  canvas.height = 800;
  
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function redrawViewport(): void {
  if (!ctx) return;
  
  // Clear the canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Render all strokes in the current viewport
  strokeManager.renderViewport(ctx, state.offsetX, state.offsetY, canvas.width, canvas.height);
  
  // Draw elastic band preview if drawing rectangle
  if (state.isDrawingRectangle) {
    drawElasticBand();
  }
}

function drawElasticBand(): void {
  if (!ctx) return;
  
  ctx.save();
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.7;
  
  const startX = state.rectangleStartX - state.offsetX;
  const startY = state.rectangleStartY - state.offsetY;
  const endX = state.rectangleEndX - state.offsetX;
  const endY = state.rectangleEndY - state.offsetY;
  
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

export function clearCanvas(): void {
  strokeManager.clearCanvas();
  redrawViewport();
}

export function getVirtualCoordinates(event: MouseEvent | TouchEvent | PointerEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  let clientX: number, clientY: number;
  
  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ('clientX' in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }
  
  const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
  const canvasY = (clientY - rect.top) * (canvas.height / rect.height);
  
  return {
    x: canvasX + state.offsetX,
    y: canvasY + state.offsetY
  };
}

export function getPressure(event: PointerEvent): number {
  return event.pressure || 0.5;
}

export function onScroll(event: WheelEvent): void {
  event.preventDefault();
  
  const delta = event.deltaY;
  const zoomFactor = 0.1;
  
  if (delta > 0) {
    // Zoom out
    state.zoom = Math.max(0.1, state.zoom - zoomFactor);
  } else {
    // Zoom in
    state.zoom = Math.min(5, state.zoom + zoomFactor);
  }
  
  // Get mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Adjust offset to zoom towards mouse position
  const zoomRatio = 1 - state.zoom;
  state.offsetX += mouseX * zoomRatio;
  state.offsetY += mouseY * zoomRatio;
  
  redrawViewport();
}

export function saveViewportAsImage(): string {
  // Create a temporary canvas to capture the entire drawing area
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Calculate the bounds of all strokes
  const strokes = strokeManager.getStrokesInViewport(0, 0, Infinity, Infinity);
  if (strokes.length === 0) {
    // If no strokes, return the current viewport
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL('image/png');
  }
  
  // Find the bounds of all strokes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const stroke of strokes) {
    minX = Math.min(minX, stroke.bounds.minX);
    minY = Math.min(minY, stroke.bounds.minY);
    maxX = Math.max(maxX, stroke.bounds.maxX);
    maxY = Math.max(maxY, stroke.bounds.maxY);
  }
  
  // Add some padding
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  tempCanvas.width = width;
  tempCanvas.height = height;
  
  // Fill with white background
  tempCtx.fillStyle = '#ffffff';
  tempCtx.fillRect(0, 0, width, height);
  
  // Render all strokes
  strokeManager.renderViewport(tempCtx, minX, minY, width, height);
  
  return tempCanvas.toDataURL('image/png');
}

// Layer management functions
export function setCurrentLayer(layer: number): void {
  strokeManager.setCurrentLayer(layer);
}

export function getCurrentLayer(): number {
  return strokeManager.getCurrentLayer();
}

export function getLayers(): number[] {
  return strokeManager.getLayers();
}

export function deleteLayer(layer: number): void {
  strokeManager.deleteLayer(layer);
  redrawViewport();
}

// Stroke management functions
export function createStroke(): string {
  const stroke = strokeManager.createStroke(
    state.currentTool,
    state.brushColor,
    state.brushSize
  );
  state.currentStrokeId = stroke.id;
  return stroke.id;
}

export function addPointToCurrentStroke(x: number, y: number, pressure: number): void {
  if (state.currentStrokeId) {
    strokeManager.addPointToStroke(state.currentStrokeId, x, y, pressure);
  }
}

export function finishStroke(): void {
  state.currentStrokeId = null;
  redrawViewport();
}

export function deleteStroke(strokeId: string): void {
  strokeManager.deleteStroke(strokeId);
  redrawViewport();
}

export function moveStrokeToLayer(strokeId: string, layer: number): void {
  strokeManager.moveStrokeToLayer(strokeId, layer);
  redrawViewport();
}

// Rectangle management functions
export function startRectangle(x: number, y: number): void {
  state.isDrawingRectangle = true;
  state.rectangleStartX = x;
  state.rectangleStartY = y;
  state.rectangleEndX = x;
  state.rectangleEndY = y;
}

export function updateRectangle(x: number, y: number): void {
  if (state.isDrawingRectangle) {
    state.rectangleEndX = x;
    state.rectangleEndY = y;
    redrawViewport();
  }
}

export function finishRectangle(): void {
  if (!state.isDrawingRectangle) return;
  
  const startX = state.rectangleStartX;
  const startY = state.rectangleStartY;
  const endX = state.rectangleEndX;
  const endY = state.rectangleEndY;
  
  // Calculate rectangle dimensions
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  // Only create rectangle if it has some size
  if (width > 1 && height > 1) {
    strokeManager.createRectangle(x, y, width, height, state.brushColor, state.brushSize);
  }
  
  // Reset rectangle drawing state
  state.isDrawingRectangle = false;
  state.rectangleStartX = 0;
  state.rectangleStartY = 0;
  state.rectangleEndX = 0;
  state.rectangleEndY = 0;
  
  redrawViewport();
} 
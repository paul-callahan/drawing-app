import { TileManager, TILE_SIZE } from './tiles';

export interface CanvasState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  pressure: number;
  offsetX: number;
  offsetY: number;
  brushSize: number;
  brushColor: string;
  pressureSensitivity: boolean;
  currentTool: 'pen' | 'eraser';
}

const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d')!;

export const tileManager = new TileManager();

export const state: CanvasState = {
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  pressure: 0,
  offsetX: 5000 - canvas.width / 2, // Start centered
  offsetY: 5000 - canvas.height / 2,
  brushSize: 5,
  brushColor: '#000000',
  pressureSensitivity: true,
  currentTool: 'pen',
};

export function redrawViewport() {
  tileManager.drawVisibleTiles(
    ctx,
    state.offsetX,
    state.offsetY,
    canvas.width,
    canvas.height
  );
}

export function clearCanvas() {
  tileManager.clearAll();
  redrawViewport();
}

export function getCanvasCoordinates(event: MouseEvent | TouchEvent | PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

export function getVirtualCoordinates(event: MouseEvent | TouchEvent | PointerEvent) {
  const coords = getCanvasCoordinates(event);
  return {
    x: coords.x + state.offsetX,
    y: coords.y + state.offsetY
  };
}

export function getPressure(event: PointerEvent): number {
  return event.pressure !== undefined ? event.pressure : 0.5;
}

export function saveViewportAsImage(): string {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tileManager.drawVisibleTiles(
    tempCtx,
    state.offsetX,
    state.offsetY,
    canvas.width,
    canvas.height
  );
  return tempCanvas.toDataURL('image/png');
}

export function onScroll(event: WheelEvent) {
  event.preventDefault();
  const scrollSpeed = 40;
  state.offsetX += event.deltaX * scrollSpeed / 100;
  state.offsetY += event.deltaY * scrollSpeed / 100;
  state.offsetX = Math.max(0, Math.min(state.offsetX, 10000 - canvas.width));
  state.offsetY = Math.max(0, Math.min(state.offsetY, 10000 - canvas.height));
  redrawViewport();
} 
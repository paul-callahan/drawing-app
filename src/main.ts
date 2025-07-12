import {
  state,
  redrawViewport,
  clearCanvas,
  getVirtualCoordinates,
  getPressure,
  onScroll,
  saveViewportAsImage,
  tileManager
} from './canvas';
import {
  setTool,
  setBrushSize,
  setBrushColor,
  setPressureSensitivity
} from './tools';
import {
  penTool,
  eraserTool,
  brushSizeSlider,
  brushSizeValue,
  brushColorPicker,
  pressureSensitivityCheckbox,
  clearCanvasBtn,
  saveImageBtn,
  updateCoordinates,
  updatePressureIndicator,
  updateToolInfo
} from './ui';
import { TILE_SIZE } from './tiles';
import { saveImage as platformSaveImage } from './platform';

// Drawing logic with tiles
function startDrawing(event: MouseEvent | TouchEvent | PointerEvent) {
  state.isDrawing = true;
  const coords = getVirtualCoordinates(event);
  state.lastX = coords.x;
  state.lastY = coords.y;
  if ('pressure' in event) {
    state.pressure = getPressure(event as PointerEvent);
    updatePressureIndicator(state.pressure, state.pressureSensitivity);
  }
}

function draw(event: MouseEvent | TouchEvent | PointerEvent) {
  if (!state.isDrawing) return;
  const coords = getVirtualCoordinates(event);
  const currentX = coords.x;
  const currentY = coords.y;
  let pressure = 0.5;
  if ('pressure' in event) {
    pressure = getPressure(event as PointerEvent);
    state.pressure = pressure;
    updatePressureIndicator(pressure, state.pressureSensitivity);
  }
  let lineWidth = state.brushSize;
  if (state.pressureSensitivity && pressure > 0) {
    lineWidth = state.brushSize * pressure;
  }
  // Draw the line on all affected tiles
  drawLineOnTiles(state.lastX, state.lastY, currentX, currentY, lineWidth, state.currentTool, state.brushColor);
  state.lastX = currentX;
  state.lastY = currentY;
  const viewportX = currentX - state.offsetX;
  const viewportY = currentY - state.offsetY;
  updateCoordinates(viewportX, viewportY);
  redrawViewport();
}

function stopDrawing() {
  state.isDrawing = false;
  updatePressureIndicator(0, false);
}

function drawLineOnTiles(x0: number, y0: number, x1: number, y1: number, lineWidth: number, tool: 'pen' | 'eraser', color: string) {
  // Find all tiles the line crosses (Bresenham's-style, but for tiles)
  const minTx = Math.floor(Math.min(x0, x1) / TILE_SIZE);
  const maxTx = Math.floor(Math.max(x0, x1) / TILE_SIZE);
  const minTy = Math.floor(Math.min(y0, y1) / TILE_SIZE);
  const maxTy = Math.floor(Math.max(y0, y1) / TILE_SIZE);
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      // Compute local coordinates in this tile
      const tileCtx = tileManager.getTileCtx(tx, ty);
      tileCtx.save();
      tileCtx.lineCap = 'round';
      tileCtx.lineJoin = 'round';
      tileCtx.lineWidth = Math.max(1, lineWidth);
      if (tool === 'eraser') {
        tileCtx.globalCompositeOperation = 'destination-out';
        tileCtx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        tileCtx.globalCompositeOperation = 'source-over';
        tileCtx.strokeStyle = color;
      }
      tileCtx.beginPath();
      // Clip the line to the tile bounds
      const lx0 = x0 - tx * TILE_SIZE;
      const ly0 = y0 - ty * TILE_SIZE;
      const lx1 = x1 - tx * TILE_SIZE;
      const ly1 = y1 - ty * TILE_SIZE;
      tileCtx.moveTo(lx0, ly0);
      tileCtx.lineTo(lx1, ly1);
      tileCtx.stroke();
      tileCtx.restore();
    }
  }
}

async function saveImage() {
  try {
    const dataUrl = saveViewportAsImage();
    const response = await platformSaveImage(dataUrl);
    console.log('Image saved:', response);
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

function setupEventListeners() {
  const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); startDrawing(e); });
  canvas.addEventListener('pointermove', (e) => { e.preventDefault(); draw(e); });
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);
  canvas.addEventListener('wheel', onScroll, { passive: false });

  penTool.addEventListener('click', () => {
    setTool('pen');
    penTool.classList.add('active');
    eraserTool.classList.remove('active');
    updateToolInfo('Pen Tool');
  });
  eraserTool.addEventListener('click', () => {
    setTool('eraser');
    eraserTool.classList.add('active');
    penTool.classList.remove('active');
    updateToolInfo('Eraser Tool');
  });
  brushSizeSlider.addEventListener('input', () => {
    setBrushSize(parseInt(brushSizeSlider.value));
    brushSizeValue.textContent = brushSizeSlider.value;
  });
  brushColorPicker.addEventListener('change', () => {
    setBrushColor(brushColorPicker.value);
  });
  pressureSensitivityCheckbox.addEventListener('change', () => {
    setPressureSensitivity(pressureSensitivityCheckbox.checked);
  });
  clearCanvasBtn.addEventListener('click', clearCanvas);
  saveImageBtn.addEventListener('click', saveImage);
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'b': case 'B':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); penTool.click(); }
        break;
      case 'e': case 'E':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); eraserTool.click(); }
        break;
      case 'Delete': case 'Backspace':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); clearCanvas(); }
        break;
      case 's': case 'S':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); saveImage(); }
        break;
    }
  });
}

function init() {
  redrawViewport();
  setupEventListeners();
  updateToolInfo('Pen Tool');
  console.log('Drawing app initialized with tiled infinite canvas.');
}

window.addEventListener('DOMContentLoaded', init);

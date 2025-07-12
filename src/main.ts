import {
  state,
  redrawViewport,
  clearCanvas,
  getVirtualCoordinates,
  getPressure,
  onScroll,
  saveViewportAsImage,
  initCanvas,
  createStroke,
  addPointToCurrentStroke,
  finishStroke,
  setCurrentLayer,
  getCurrentLayer,
  getLayers,
  deleteLayer,
  strokeManager,
  startRectangle,
  updateRectangle,
  finishRectangle
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
  rectangleTool,
  brushSizeSlider,
  brushSizeValue,
  brushColorPicker,
  pressureSensitivityCheckbox,
  clearCanvasBtn,
  saveImageBtn,
  layerSelect,
  addLayerBtn,
  deleteLayerBtn,
  updateCoordinates,
  updatePressureIndicator,
  updateToolInfo,
  updateStrokeCount,
  updateLayerSelect,
  getSelectedLayer
} from './ui';
import { saveImage as platformSaveImage } from './platform';

// Drawing logic with stroke objects
function startDrawing(event: MouseEvent | TouchEvent | PointerEvent) {
  const coords = getVirtualCoordinates(event);
  
  if (state.currentTool === 'rectangle') {
    // Start rectangle drawing
    startRectangle(coords.x, coords.y);
    state.isDrawing = true;
  } else {
    // Start stroke drawing
    state.isDrawing = true;
    state.lastX = coords.x;
    state.lastY = coords.y;
    
    // Create a new stroke
    createStroke();
    
    if ('pressure' in event) {
      state.pressure = getPressure(event as PointerEvent);
      updatePressureIndicator(state.pressure, state.pressureSensitivity);
    }
    
    // Add the first point to the stroke
    addPointToCurrentStroke(coords.x, coords.y, state.pressure);
  }
}

function draw(event: MouseEvent | TouchEvent | PointerEvent) {
  if (!state.isDrawing) return;
  
  const coords = getVirtualCoordinates(event);
  const currentX = coords.x;
  const currentY = coords.y;
  
  if (state.currentTool === 'rectangle') {
    // Update rectangle preview
    updateRectangle(currentX, currentY);
  } else {
    // Continue stroke drawing
    let pressure = 0.5;
    if ('pressure' in event) {
      pressure = getPressure(event as PointerEvent);
      state.pressure = pressure;
      updatePressureIndicator(pressure, state.pressureSensitivity);
    }
    
    // Add point to current stroke
    addPointToCurrentStroke(currentX, currentY, pressure);
    
    state.lastX = currentX;
    state.lastY = currentY;
    
    // Redraw to show the stroke as it's being drawn
    redrawViewport();
  }
  
  const viewportX = currentX - state.offsetX;
  const viewportY = currentY - state.offsetY;
  updateCoordinates(viewportX, viewportY);
}

function stopDrawing() {
  if (!state.isDrawing) return;
  
  if (state.currentTool === 'rectangle') {
    // Finish rectangle drawing
    finishRectangle();
  } else {
    // Finish stroke drawing
    updatePressureIndicator(0, false);
    finishStroke();
  }
  
  state.isDrawing = false;
  
  // Update stroke count
  updateStrokeCount(strokeManager.getStrokeCount());
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

function addNewLayer() {
  const layers = getLayers();
  const newLayer = Math.max(...layers) + 1;
  setCurrentLayer(newLayer);
  updateLayerSelect(getLayers(), getCurrentLayer());
}

function deleteCurrentLayer() {
  const currentLayer = getCurrentLayer();
  if (currentLayer === 0) {
    alert('Cannot delete the default layer (Layer 0)');
    return;
  }
  
  if (confirm(`Delete Layer ${currentLayer} and all its strokes?`)) {
    deleteLayer(currentLayer);
    updateLayerSelect(getLayers(), getCurrentLayer());
    updateStrokeCount(strokeManager.getStrokeCount());
  }
}

function setupEventListeners() {
  const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
  
  // Initialize canvas
  initCanvas(canvas);
  
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
    rectangleTool.classList.remove('active');
    updateToolInfo('Pen Tool');
  });
  eraserTool.addEventListener('click', () => {
    setTool('eraser');
    eraserTool.classList.add('active');
    penTool.classList.remove('active');
    rectangleTool.classList.remove('active');
    updateToolInfo('Eraser Tool');
  });
  rectangleTool.addEventListener('click', () => {
    setTool('rectangle');
    rectangleTool.classList.add('active');
    penTool.classList.remove('active');
    eraserTool.classList.remove('active');
    updateToolInfo('Rectangle Tool');
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
  
  // Layer controls
  layerSelect.addEventListener('change', () => {
    const selectedLayer = getSelectedLayer();
    setCurrentLayer(selectedLayer);
  });
  addLayerBtn.addEventListener('click', addNewLayer);
  deleteLayerBtn.addEventListener('click', deleteCurrentLayer);
  
  clearCanvasBtn.addEventListener('click', () => {
    clearCanvas();
    updateStrokeCount(strokeManager.getStrokeCount());
  });
  saveImageBtn.addEventListener('click', saveImage);
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'b': case 'B':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); penTool.click(); }
        break;
      case 'e': case 'E':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); eraserTool.click(); }
        break;
      case 'r': case 'R':
        if (e.ctrlKey || e.metaKey) { e.preventDefault(); rectangleTool.click(); }
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
  updateLayerSelect(getLayers(), getCurrentLayer());
  updateStrokeCount(strokeManager.getStrokeCount());
  console.log('Drawing app initialized with stroke-based objects, layers, and rectangle tool.');
}

window.addEventListener('DOMContentLoaded', init);

// ui.ts: UI element lookups and updates

// Tool buttons
export const penTool = document.getElementById('pen-tool') as HTMLButtonElement;
export const eraserTool = document.getElementById('eraser-tool') as HTMLButtonElement;
export const rectangleTool = document.getElementById('rectangle-tool') as HTMLButtonElement;

// Brush controls
export const brushSizeSlider = document.getElementById('brush-size') as HTMLInputElement;
export const brushSizeValue = document.getElementById('brush-size-value') as HTMLSpanElement;
export const brushColorPicker = document.getElementById('brush-color') as HTMLInputElement;
export const pressureSensitivityCheckbox = document.getElementById('pressure-sensitivity') as HTMLInputElement;

// Layer controls
export const layerSelect = document.getElementById('layer-select') as HTMLSelectElement;
export const addLayerBtn = document.getElementById('add-layer') as HTMLButtonElement;
export const deleteLayerBtn = document.getElementById('delete-layer') as HTMLButtonElement;

// Action buttons
export const clearCanvasBtn = document.getElementById('clear-canvas') as HTMLButtonElement;
export const saveImageBtn = document.getElementById('save-image') as HTMLButtonElement;

// Status elements
export const coordinates = document.getElementById('coordinates') as HTMLSpanElement;
export const pressureValue = document.getElementById('pressure-value') as HTMLSpanElement;
export const toolInfo = document.getElementById('tool-info') as HTMLSpanElement;
export const strokeCount = document.getElementById('stroke-count') as HTMLSpanElement;

// Pressure indicator
export const pressureIndicator = document.getElementById('pressure-indicator') as HTMLDivElement;

export function updateCoordinates(x: number, y: number): void {
  coordinates.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
}

export function updatePressureIndicator(pressure: number, enabled: boolean): void {
  if (!enabled) {
    pressureIndicator.style.display = 'none';
    return;
  }
  
  pressureIndicator.style.display = 'block';
  const pressureBar = pressureIndicator.querySelector('.pressure-bar') as HTMLElement;
  pressureBar.style.width = `${pressure * 100}%`;
  pressureValue.textContent = `Pressure: ${Math.round(pressure * 100)}%`;
}

export function updateToolInfo(info: string): void {
  toolInfo.textContent = info;
}

export function updateStrokeCount(count: number): void {
  strokeCount.textContent = `Strokes: ${count}`;
}

export function updateLayerSelect(layers: number[], currentLayer: number): void {
  // Clear existing options
  layerSelect.innerHTML = '';
  
  // Add options for each layer
  layers.forEach(layer => {
    const option = document.createElement('option');
    option.value = layer.toString();
    option.textContent = `Layer ${layer}`;
    layerSelect.appendChild(option);
  });
  
  // Set current layer
  layerSelect.value = currentLayer.toString();
}

export function getSelectedLayer(): number {
  return parseInt(layerSelect.value);
} 
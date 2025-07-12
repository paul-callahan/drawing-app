// ui.ts: UI updates and DOM lookups

export const penTool = document.getElementById('pen-tool') as HTMLButtonElement;
export const eraserTool = document.getElementById('eraser-tool') as HTMLButtonElement;
export const brushSizeSlider = document.getElementById('brush-size') as HTMLInputElement;
export const brushSizeValue = document.getElementById('brush-size-value') as HTMLSpanElement;
export const brushColorPicker = document.getElementById('brush-color') as HTMLInputElement;
export const pressureSensitivityCheckbox = document.getElementById('pressure-sensitivity') as HTMLInputElement;
export const clearCanvasBtn = document.getElementById('clear-canvas') as HTMLButtonElement;
export const saveImageBtn = document.getElementById('save-image') as HTMLButtonElement;
export const coordinatesSpan = document.getElementById('coordinates') as HTMLSpanElement;
export const pressureValueSpan = document.getElementById('pressure-value') as HTMLSpanElement;
export const toolInfoSpan = document.getElementById('tool-info') as HTMLSpanElement;
export const pressureIndicator = document.getElementById('pressure-indicator') as HTMLDivElement;
export const pressureBar = pressureIndicator.querySelector('.pressure-bar') as HTMLDivElement;

export function updateCoordinates(x: number, y: number) {
  coordinatesSpan.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
}

export function updatePressureIndicator(pressure: number, enabled: boolean) {
  if (enabled) {
    pressureIndicator.classList.add('visible');
    pressureBar.style.height = `${pressure * 100}%`;
    pressureValueSpan.textContent = `Pressure: ${Math.round(pressure * 100)}%`;
  } else {
    pressureIndicator.classList.remove('visible');
    pressureValueSpan.textContent = 'Pressure: 0%';
  }
}

export function updateToolInfo(tool: string) {
  toolInfoSpan.textContent = tool;
} 
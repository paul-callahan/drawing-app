// tools.ts: Tool state and switching
import { state, redrawViewport } from './canvas';

export function setTool(tool: 'pen' | 'eraser') {
  state.currentTool = tool;
  redrawViewport();
}

export function setBrushSize(size: number) {
  state.brushSize = size;
}

export function setBrushColor(color: string) {
  state.brushColor = color;
}

export function setPressureSensitivity(enabled: boolean) {
  state.pressureSensitivity = enabled;
} 
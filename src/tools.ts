// tools.ts: Tool state and switching

import { state } from './canvas';

export function setTool(tool: 'pen' | 'eraser' | 'rectangle' | 'selection'): void {
  state.currentTool = tool;
}

export function setBrushSize(size: number): void {
  state.brushSize = size;
}

export function setBrushColor(color: string): void {
  state.brushColor = color;
}

export function setPressureSensitivity(enabled: boolean): void {
  state.pressureSensitivity = enabled;
} 
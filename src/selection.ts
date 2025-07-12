// selection.ts: Object selection and transformation

import { Stroke } from './types';
import { ToolFactory } from './tools/factory';

export interface TransformHandle {
  x: number;
  y: number;
  type: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
}

export interface SelectionState {
  selectedStroke: Stroke | null;
  isMoving: boolean;
  isResizing: boolean;
  moveStartX: number;
  moveStartY: number;
  resizeHandle: TransformHandle | null;
  originalBounds: { x: number; y: number; width: number; height: number } | null;
}

export class SelectionManager {
  private state: SelectionState = {
    selectedStroke: null,
    isMoving: false,
    isResizing: false,
    moveStartX: 0,
    moveStartY: 0,
    resizeHandle: null,
    originalBounds: null
  };

  private handleSize = 8;

  selectStroke(stroke: Stroke | null): void {
    this.state.selectedStroke = stroke;
    this.state.isMoving = false;
    this.state.isResizing = false;
    this.state.resizeHandle = null;
    this.state.originalBounds = null;
  }

  getSelectedStroke(): Stroke | null {
    return this.state.selectedStroke;
  }

  isSelected(stroke: Stroke): boolean {
    return this.state.selectedStroke?.id === stroke.id;
  }

  getTransformHandles(offsetX: number, offsetY: number): TransformHandle[] {
    if (!this.state.selectedStroke) return [];

    const stroke = this.state.selectedStroke;
    const bounds = stroke.bounds;
    
    const x1 = bounds.minX - offsetX;
    const y1 = bounds.minY - offsetY;
    const x2 = bounds.maxX - offsetX;
    const y2 = bounds.maxY - offsetY;

    return [
      { x: x1, y: y1, type: 'top-left', size: this.handleSize },
      { x: x2, y: y1, type: 'top-right', size: this.handleSize },
      { x: x1, y: y2, type: 'bottom-left', size: this.handleSize },
      { x: x2, y: y2, type: 'bottom-right', size: this.handleSize }
    ];
  }

  isPointInHandle(x: number, y: number, offsetX: number, offsetY: number): TransformHandle | null {
    const handles = this.getTransformHandles(offsetX, offsetY);
    
    for (const handle of handles) {
      const handleX = handle.x;
      const handleY = handle.y;
      const size = handle.size;
      
      if (x >= handleX - size/2 && x <= handleX + size/2 &&
          y >= handleY - size/2 && y <= handleY + size/2) {
        return handle;
      }
    }
    
    return null;
  }

  isPointInSelection(x: number, y: number, offsetX: number, offsetY: number): boolean {
    if (!this.state.selectedStroke) return false;
    
    const bounds = this.state.selectedStroke.bounds;
    const x1 = bounds.minX - offsetX;
    const y1 = bounds.minY - offsetY;
    const x2 = bounds.maxX - offsetX;
    const y2 = bounds.maxY - offsetY;
    
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }

  startMove(x: number, y: number): void {
    if (!this.state.selectedStroke) return;
    
    this.state.isMoving = true;
    this.state.moveStartX = x;
    this.state.moveStartY = y;
    this.state.originalBounds = {
      x: this.state.selectedStroke.bounds.minX,
      y: this.state.selectedStroke.bounds.minY,
      width: this.state.selectedStroke.bounds.maxX - this.state.selectedStroke.bounds.minX,
      height: this.state.selectedStroke.bounds.maxY - this.state.selectedStroke.bounds.minY
    };
  }

  startResize(handle: TransformHandle, x: number, y: number): void {
    if (!this.state.selectedStroke) return;
    
    this.state.isResizing = true;
    this.state.resizeHandle = handle;
    this.state.moveStartX = x;
    this.state.moveStartY = y;
    this.state.originalBounds = {
      x: this.state.selectedStroke.bounds.minX,
      y: this.state.selectedStroke.bounds.minY,
      width: this.state.selectedStroke.bounds.maxX - this.state.selectedStroke.bounds.minX,
      height: this.state.selectedStroke.bounds.maxY - this.state.selectedStroke.bounds.minY
    };
  }

  updateMove(x: number, y: number): void {
    if (!this.state.isMoving || !this.state.selectedStroke || !this.state.originalBounds) return;
    
    const deltaX = x - this.state.moveStartX;
    const deltaY = y - this.state.moveStartY;
    
    // Move the stroke
    this.moveStroke(deltaX, deltaY);
    
    // Update move start position
    this.state.moveStartX = x;
    this.state.moveStartY = y;
  }

  updateResize(x: number, y: number): void {
    if (!this.state.isResizing || !this.state.selectedStroke || !this.state.originalBounds || !this.state.resizeHandle) return;
    
    const deltaX = x - this.state.moveStartX;
    const deltaY = y - this.state.moveStartY;
    
    // Resize the stroke
    this.resizeStroke(deltaX, deltaY);
    
    // Update resize start position
    this.state.moveStartX = x;
    this.state.moveStartY = y;
  }

  private moveStroke(deltaX: number, deltaY: number): void {
    if (!this.state.selectedStroke) return;
    
    ToolFactory.moveStroke(this.state.selectedStroke, deltaX, deltaY);
  }

  private resizeStroke(deltaX: number, deltaY: number): void {
    if (!this.state.selectedStroke || !this.state.resizeHandle || !this.state.originalBounds) return;
    
    const stroke = this.state.selectedStroke;
    const original = this.state.originalBounds;
    const handle = this.state.resizeHandle;
    
    // Calculate scale factors based on handle type
    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;
    
    if (handle.type === 'top-left') {
      scaleX = (original.width - deltaX) / original.width;
      scaleY = (original.height - deltaY) / original.height;
      offsetX = deltaX;
      offsetY = deltaY;
    } else if (handle.type === 'top-right') {
      scaleX = (original.width + deltaX) / original.width;
      scaleY = (original.height - deltaY) / original.height;
      offsetY = deltaY;
    } else if (handle.type === 'bottom-left') {
      scaleX = (original.width - deltaX) / original.width;
      scaleY = (original.height + deltaY) / original.height;
      offsetX = deltaX;
    } else if (handle.type === 'bottom-right') {
      scaleX = (original.width + deltaX) / original.width;
      scaleY = (original.height + deltaY) / original.height;
    }
    
    // Apply transformation to stroke
    ToolFactory.resizeStroke(stroke, scaleX, scaleY, offsetX, offsetY);
  }

  private transformStroke(stroke: Stroke, original: any, scaleX: number, scaleY: number, offsetX: number, offsetY: number): void {
    // Transform points
    for (const point of stroke.points) {
      const relativeX = point.x - original.x;
      const relativeY = point.y - original.y;
      
      point.x = original.x + offsetX + relativeX * scaleX;
      point.y = original.y + offsetY + relativeY * scaleY;
    }
    
    // Transform rectangle if it's a rectangle stroke
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      const relativeX = stroke.rectangle.x - original.x;
      const relativeY = stroke.rectangle.y - original.y;
      
      stroke.rectangle.x = original.x + offsetX + relativeX * scaleX;
      stroke.rectangle.y = original.y + offsetY + relativeY * scaleY;
      stroke.rectangle.width *= scaleX;
      stroke.rectangle.height *= scaleY;
    }
    
    // Update bounds
    ToolFactory.updateStrokeBounds(stroke);
  }

  private updateStrokeBounds(stroke: Stroke): void {
    ToolFactory.updateStrokeBounds(stroke);
  }

  stopMove(): void {
    this.state.isMoving = false;
    this.state.originalBounds = null;
  }

  stopResize(): void {
    this.state.isResizing = false;
    this.state.resizeHandle = null;
    this.state.originalBounds = null;
  }

  clearSelection(): void {
    this.state.selectedStroke = null;
    this.state.isMoving = false;
    this.state.isResizing = false;
    this.state.resizeHandle = null;
    this.state.originalBounds = null;
  }

  isMoving(): boolean {
    return this.state.isMoving;
  }

  isResizing(): boolean {
    return this.state.isResizing;
  }
} 
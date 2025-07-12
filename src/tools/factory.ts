// factory.ts: Tool factory for managing all drawing tools

import { Stroke, RenderContext } from '../types';
import { PenTool } from './pen';
import { EraserTool } from './eraser';
import { RectangleTool } from './rectangle';

export class ToolFactory {
  static createStroke(tool: 'pen' | 'eraser' | 'rectangle', id: string, color: string, brushSize: number, layer: number, zIndex: number): Stroke {
    switch (tool) {
      case 'pen':
        return PenTool.createStroke(id, color, brushSize, layer, zIndex);
      case 'eraser':
        return EraserTool.createStroke(id, color, brushSize, layer, zIndex);
      case 'rectangle':
        return RectangleTool.createStroke(id, color, brushSize, layer, zIndex);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  static createRectangle(id: string, x: number, y: number, width: number, height: number, color: string, brushSize: number, layer: number, zIndex: number): Stroke {
    return RectangleTool.createRectangle(id, x, y, width, height, color, brushSize, layer, zIndex);
  }

  static addPoint(stroke: Stroke, x: number, y: number, pressure: number): void {
    switch (stroke.tool) {
      case 'pen':
        PenTool.addPoint(stroke, x, y, pressure);
        break;
      case 'eraser':
        EraserTool.addPoint(stroke, x, y, pressure);
        break;
      case 'rectangle':
        RectangleTool.addPoint(stroke, x, y, pressure);
        break;
    }
  }

  static render(stroke: Stroke, context: RenderContext): void {
    switch (stroke.tool) {
      case 'pen':
        PenTool.render(stroke, context);
        break;
      case 'eraser':
        EraserTool.render(stroke, context);
        break;
      case 'rectangle':
        RectangleTool.render(stroke, context);
        break;
    }
  }

  static isPointInStroke(stroke: Stroke, x: number, y: number): boolean {
    switch (stroke.tool) {
      case 'pen':
        return PenTool.isPointInStroke(stroke, x, y);
      case 'eraser':
        return EraserTool.isPointInStroke(stroke, x, y);
      case 'rectangle':
        return RectangleTool.isPointInStroke(stroke, x, y);
      default:
        return false;
    }
  }

  static moveStroke(stroke: Stroke, deltaX: number, deltaY: number): void {
    // Move all points in the stroke
    for (const point of stroke.points) {
      point.x += deltaX;
      point.y += deltaY;
    }
    
    // Update bounds
    stroke.bounds.minX += deltaX;
    stroke.bounds.maxX += deltaX;
    stroke.bounds.minY += deltaY;
    stroke.bounds.maxY += deltaY;
    
    // Move rectangle if it's a rectangle stroke
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      RectangleTool.moveRectangle(stroke, deltaX, deltaY);
    }
  }

  static resizeStroke(stroke: Stroke, scaleX: number, scaleY: number, offsetX: number, offsetY: number): void {
    // Transform points
    for (const point of stroke.points) {
      const relativeX = point.x - stroke.bounds.minX;
      const relativeY = point.y - stroke.bounds.minY;
      
      point.x = stroke.bounds.minX + offsetX + relativeX * scaleX;
      point.y = stroke.bounds.minY + offsetY + relativeY * scaleY;
    }
    
    // Transform rectangle if it's a rectangle stroke
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      RectangleTool.resizeRectangle(stroke, scaleX, scaleY, offsetX, offsetY);
    }
    
    // Update bounds
    ToolFactory.updateStrokeBounds(stroke);
  }

  static updateStrokeBounds(stroke: Stroke): void {
    if (stroke.tool === 'rectangle' && stroke.rectangle) {
      RectangleTool.updateRectangleBounds(stroke);
    } else {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      for (const point of stroke.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
      
      stroke.bounds.minX = minX;
      stroke.bounds.minY = minY;
      stroke.bounds.maxX = maxX;
      stroke.bounds.maxY = maxY;
    }
  }
} 
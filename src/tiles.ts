// tiles.ts: Tiled infinite canvas manager

export const TILE_SIZE = 1024;

// Each tile is an offscreen canvas
export class TileManager {
  private tiles: Map<string, HTMLCanvasElement> = new Map();

  // Get the tile key for a given tile coordinate
  private tileKey(tx: number, ty: number): string {
    return `${tx},${ty}`;
  }

  // Get or create a tile at (tx, ty)
  getTile(tx: number, ty: number): HTMLCanvasElement {
    const key = this.tileKey(tx, ty);
    if (!this.tiles.has(key)) {
      const tile = document.createElement('canvas');
      tile.width = TILE_SIZE;
      tile.height = TILE_SIZE;
      this.tiles.set(key, tile);
    }
    return this.tiles.get(key)!;
  }

  // Get the 2D context for a tile
  getTileCtx(tx: number, ty: number): CanvasRenderingContext2D {
    return this.getTile(tx, ty).getContext('2d')!;
  }

  // Draw all visible tiles onto the main canvas
  drawVisibleTiles(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, viewportW: number, viewportH: number) {
    ctx.clearRect(0, 0, viewportW, viewportH);
    const startTx = Math.floor(offsetX / TILE_SIZE);
    const startTy = Math.floor(offsetY / TILE_SIZE);
    const endTx = Math.floor((offsetX + viewportW - 1) / TILE_SIZE);
    const endTy = Math.floor((offsetY + viewportH - 1) / TILE_SIZE);
    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const tile = this.tiles.get(this.tileKey(tx, ty));
        if (tile) {
          const sx = tx * TILE_SIZE - offsetX;
          const sy = ty * TILE_SIZE - offsetY;
          ctx.drawImage(tile, sx, sy);
        }
      }
    }
  }

  // Clear all tiles
  clearAll() {
    this.tiles.clear();
  }
} 
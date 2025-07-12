// platform.ts: Platform abstraction for Tauri vs Web

export const isTauri = !!(window as any).__TAURI__;

export async function saveImage(dataUrl: string) {
  if (isTauri) {
    // Dynamically import to avoid errors in web
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke('save_image', { dataUrl });
  } else {
    // Web: trigger download
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `drawing_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return Promise.resolve('Image downloaded');
  }
} 
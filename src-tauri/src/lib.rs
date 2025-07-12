use std::fs;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct SaveImageRequest {
    data_url: String,
}

#[derive(Serialize)]
struct SaveImageResponse {
    success: bool,
    message: String,
    file_path: Option<String>,
}

#[tauri::command]
async fn save_image(request: SaveImageRequest) -> Result<SaveImageResponse, String> {
    // Extract base64 data from data URL
    let data_url = request.data_url;
    if !data_url.starts_with("data:image/png;base64,") {
        return Err("Invalid data URL format".to_string());
    }
    
    let base64_data = data_url.trim_start_matches("data:image/png;base64,");
    
    // Decode base64 data
    let image_data = general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    // Create downloads directory if it doesn't exist
    let downloads_dir = dirs::download_dir()
        .ok_or("Could not find downloads directory")?;
    
    // Generate filename with timestamp
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let filename = format!("drawing_{}.png", timestamp);
    let file_path = downloads_dir.join(&filename);
    
    // Write the image file
    fs::write(&file_path, image_data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(SaveImageResponse {
        success: true,
        message: format!("Image saved as {}", filename),
        file_path: Some(file_path.to_string_lossy().to_string()),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

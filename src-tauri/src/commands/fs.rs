use serde::{Deserialize, Serialize};
use tauri::command;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_directory: bool,
    pub modified: Option<u64>,
}

#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    log::info!("Reading file: {}", path);
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
pub async fn write_file(path: String, content: String) -> Result<bool, String> {
    log::info!("Writing file: {}", path);
    std::fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    log::info!("Listing directory: {}", path);
    let mut entries = Vec::new();
    
    let dir = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    for entry in dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        
        entries.push(FileInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            size: metadata.len(),
            is_directory: metadata.is_dir(),
            modified: metadata.modified().ok().and_then(|t| {
                t.duration_since(std::time::UNIX_EPOCH).ok().map(|d| d.as_secs())
            }),
        });
    }
    
    Ok(entries)
}

#[command]
pub async fn file_exists(path: String) -> Result<bool, String> {
    Ok(PathBuf::from(&path).exists())
}

#[command]
pub async fn create_directory(path: String) -> Result<bool, String> {
    log::info!("Creating directory: {}", path);
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn delete_file(path: String) -> Result<bool, String> {
    log::info!("Deleting file: {}", path);
    let path_buf = PathBuf::from(&path);
    if path_buf.is_dir() {
        std::fs::remove_dir_all(&path).map_err(|e| e.to_string())?;
    } else {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(true)
}

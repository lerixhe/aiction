use serde::{Deserialize, Serialize};
use tauri::command;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ShellCommandRequest {
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: Option<String>,
    pub env: Option<std::collections::HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ShellCommandResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[command]
pub async fn execute_shell_command(request: ShellCommandRequest) -> Result<ShellCommandResult, String> {
    log::info!("Executing shell command: {} {:?}", request.command, request.args);
    
    let mut cmd = Command::new(&request.command);
    cmd.args(&request.args);
    
    if let Some(dir) = &request.working_dir {
        cmd.current_dir(dir);
    }
    
    if let Some(env) = &request.env {
        for (key, value) in env {
            cmd.env(key, value);
        }
    }
    
    let output = cmd.output().map_err(|e| e.to_string())?;
    
    Ok(ShellCommandResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

#[command]
pub async fn check_command_exists(command: String) -> Result<bool, String> {
    let result = Command::new("which")
        .arg(&command)
        .output()
        .map_err(|e| e.to_string())?;
    
    Ok(result.status.success())
}

#[command]
pub async fn get_system_info() -> Result<serde_json::Value, String> {
    let os = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    
    Ok(serde_json::json!({
        "os": os,
        "arch": arch,
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

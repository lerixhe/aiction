use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub content: String,
    pub model: String,
    pub usage: Option<Usage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub id: String,
    pub name: String,
    pub api_key: String,
    pub model: String,
    pub api_base_url: Option<String>,
}

#[command]
pub async fn test_api_connection(provider: ProviderConfig) -> Result<bool, String> {
    // TODO: 实现 API 连接测试
    log::info!("Testing API connection for provider: {}", provider.name);
    Ok(true)
}

#[command]
pub async fn fetch_models(provider: ProviderConfig) -> Result<Vec<String>, String> {
    // TODO: 实现获取模型列表
    log::info!("Fetching models for provider: {}", provider.name);
    Ok(vec!["gpt-4".to_string(), "gpt-3.5-turbo".to_string()])
}

#[command]
pub async fn send_chat_message(
    provider: ProviderConfig,
    request: ChatRequest,
) -> Result<ChatResponse, String> {
    // TODO: 实现发送聊天消息
    log::info!("Sending chat message to provider: {}", provider.name);
    Err("Not implemented".to_string())
}

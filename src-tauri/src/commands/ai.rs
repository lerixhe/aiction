use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

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
pub async fn test_api_connection(
    provider: ProviderConfig,
    _state: State<'_, AppState>,
) -> Result<bool, AppError> {
    log::info!("Testing API connection for provider: {}", provider.name);
    
    if provider.api_key.is_empty() {
        return Err(AppError::Validation("API key is required".to_string()));
    }

    let client = reqwest::Client::new();
    let base_url = provider.api_base_url.as_deref().unwrap_or("https://api.openai.com/v1");
    let url = format!("{}/models", base_url);

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", provider.api_key))
        .send()
        .await?;

    if response.status().is_success() {
        Ok(true)
    } else {
        Err(AppError::AiApi {
            code: "CONNECTION_FAILED".to_string(),
            message: format!("API returned status: {}", response.status()),
        })
    }
}

#[command]
pub async fn fetch_models(
    provider: ProviderConfig,
    _state: State<'_, AppState>,
) -> Result<Vec<String>, AppError> {
    log::info!("Fetching models for provider: {}", provider.name);
    
    if provider.api_key.is_empty() {
        return Err(AppError::Validation("API key is required".to_string()));
    }

    let client = reqwest::Client::new();
    let base_url = provider.api_base_url.as_deref().unwrap_or("https://api.openai.com/v1");
    let url = format!("{}/models", base_url);

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", provider.api_key))
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(AppError::AiApi {
            code: "FETCH_MODELS_FAILED".to_string(),
            message: format!("Failed to fetch models: {}", response.status()),
        });
    }

    let body: serde_json::Value = response.json().await?;
    let models = body["data"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter_map(|m| m["id"].as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}

#[command]
pub async fn send_chat_message(
    provider: ProviderConfig,
    request: ChatRequest,
    _state: State<'_, AppState>,
) -> Result<ChatResponse, AppError> {
    log::info!("Sending chat message to provider: {}", provider.name);
    
    if provider.api_key.is_empty() {
        return Err(AppError::Validation("API key is required".to_string()));
    }

    let client = reqwest::Client::new();
    let base_url = provider.api_base_url.as_deref().unwrap_or("https://api.openai.com/v1");
    let url = format!("{}/chat/completions", base_url);

    let model = request.model.as_deref().unwrap_or(&provider.model);

    let body = serde_json::json!({
        "model": model,
        "messages": request.messages,
        "temperature": request.temperature.unwrap_or(0.7),
        "max_tokens": request.max_tokens,
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", provider.api_key))
        .json(&body)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(AppError::AiApi {
            code: "CHAT_FAILED".to_string(),
            message: format!("API error: {}", error_text),
        });
    }

    let response_body: serde_json::Value = response.json().await?;

    let content = response_body["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let usage = response_body["usage"].as_object().map(|u| Usage {
        prompt_tokens: u["prompt_tokens"].as_u64().unwrap_or(0) as u32,
        completion_tokens: u["completion_tokens"].as_u64().unwrap_or(0) as u32,
        total_tokens: u["total_tokens"].as_u64().unwrap_or(0) as u32,
    });

    Ok(ChatResponse {
        content,
        model: model.to_string(),
        usage,
    })
}

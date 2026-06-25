use std::collections::HashMap;
use tauri::{Emitter, State};
use uuid::Uuid;

use crate::ai::{AiProvider, ChatMessage, ChatRequest, ChatResponse, StreamChunk};
use crate::error::AppError;
use crate::settings::ProviderConfig;
use crate::state::AppState;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct StreamChatRequest {
    pub provider_id: String,
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<u32>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct StreamChatResponse {
    pub stream_id: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct AbortChatRequest {
    pub stream_id: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ExecuteActionRequest {
    pub action_id: String,
    pub selection: String,
    pub variables: Option<HashMap<String, String>>,
    pub provider_id: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TestProviderRequest {
    pub provider_id: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TestProviderResponse {
    pub success: bool,
    pub message: String,
    pub models: Option<Vec<String>>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct GetModelsRequest {
    pub provider_id: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct GetModelsResponse {
    pub models: Vec<String>,
}

fn create_provider(config: &ProviderConfig) -> AiProvider {
    AiProvider::new(
        config.id.clone(),
        config.api_key.clone(),
        config.base_url.clone(),
    )
}

#[tauri::command]
pub async fn stream_chat(
    request: StreamChatRequest,
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<StreamChatResponse, AppError> {
    if request.messages.is_empty() {
        return Err(AppError::Validation("messages cannot be empty".to_string()));
    }

    let settings = state.get_settings()?;
    let provider_config = settings
        .ai
        .providers
        .iter()
        .find(|p| p.id == request.provider_id)
        .ok_or_else(|| AppError::Validation(format!("Provider not found: {}", request.provider_id)))?
        .clone();

    let provider = create_provider(&provider_config);
    let stream_id = Uuid::new_v4().to_string();

    let chat_request = ChatRequest {
        provider_id: request.provider_id,
        model: request.model,
        messages: request.messages,
        temperature: request.temperature.unwrap_or(settings.ai.temperature),
        max_tokens: request.max_tokens.unwrap_or(settings.ai.max_tokens),
        stream: true,
    };

    let response = provider.chat_stream(&chat_request).await?;
    let mut chat_stream = crate::ai::ChatStream::new(response);

    let stream_id_clone = stream_id.clone();
    let app_handle = app.clone();

    tokio::spawn(async move {
        let event_name = format!("chat-stream:{}", stream_id_clone);

        loop {
            match chat_stream.next_chunk().await {
                Ok(Some(chunk)) => {
                    let _ = app_handle.emit(&event_name, &chunk);
                }
                Ok(None) => {
                    let done_chunk = StreamChunk {
                        id: stream_id_clone.clone(),
                        delta: String::new(),
                        reasoning_delta: None,
                        finish_reason: Some("stop".to_string()),
                    };
                    let _ = app_handle.emit(&event_name, &done_chunk);
                    break;
                }
                Err(e) => {
                    log::error!("Stream error: {}", e);
                    let error_chunk = StreamChunk {
                        id: stream_id_clone.clone(),
                        delta: String::new(),
                        reasoning_delta: None,
                        finish_reason: Some("error".to_string()),
                    };
                    let _ = app_handle.emit(&event_name, &error_chunk);
                    break;
                }
            }
        }
    });

    Ok(StreamChatResponse { stream_id })
}

#[tauri::command]
pub async fn chat(
    request: StreamChatRequest,
    state: State<'_, AppState>,
) -> Result<ChatResponse, AppError> {
    if request.messages.is_empty() {
        return Err(AppError::Validation("messages cannot be empty".to_string()));
    }

    let settings = state.get_settings()?;
    let provider_config = settings
        .ai
        .providers
        .iter()
        .find(|p| p.id == request.provider_id)
        .ok_or_else(|| AppError::Validation(format!("Provider not found: {}", request.provider_id)))?
        .clone();

    let provider = create_provider(&provider_config);

    let chat_request = ChatRequest {
        provider_id: request.provider_id,
        model: request.model,
        messages: request.messages,
        temperature: request.temperature.unwrap_or(settings.ai.temperature),
        max_tokens: request.max_tokens.unwrap_or(settings.ai.max_tokens),
        stream: false,
    };

    provider.chat(&chat_request).await
}

#[tauri::command]
pub async fn abort_chat(
    _request: AbortChatRequest,
    _state: State<'_, AppState>,
) -> Result<bool, AppError> {
    // Note: Actual stream cancellation would require CancellationToken
    // For now, the frontend should stop listening to the event
    Ok(true)
}

#[tauri::command]
pub async fn execute_action(
    request: ExecuteActionRequest,
    state: State<'_, AppState>,
) -> Result<ChatResponse, AppError> {
    if request.selection.is_empty() {
        return Err(AppError::Validation("selection cannot be empty".to_string()));
    }

    let settings = state.get_settings()?;

    let action = settings
        .actions
        .iter()
        .find(|a| a.id == request.action_id)
        .ok_or_else(|| AppError::Validation(format!("Action not found: {}", request.action_id)))?
        .clone();

    let mut variables = request.variables.unwrap_or_default();
    variables.insert("selection".to_string(), request.selection.clone());

    let prompt = interpolate_prompt(&action.prompt, &variables);

    let provider_id = request
        .provider_id
        .unwrap_or_else(|| settings.ai.default_provider_id.clone());

    let provider_config = settings
        .ai
        .providers
        .iter()
        .find(|p| p.id == provider_id)
        .ok_or_else(|| AppError::Validation(format!("Provider not found: {}", provider_id)))?
        .clone();

    let model = request
        .model
        .unwrap_or_else(|| provider_config.default_model.clone());

    let provider = create_provider(&provider_config);

    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: settings.ai.system_prompt.clone(),
        },
        ChatMessage {
            role: "user".to_string(),
            content: prompt,
        },
    ];

    let chat_request = ChatRequest {
        provider_id,
        model,
        messages,
        temperature: settings.ai.temperature,
        max_tokens: settings.ai.max_tokens,
        stream: false,
    };

    provider.chat(&chat_request).await
}

fn interpolate_prompt(template: &str, variables: &HashMap<String, String>) -> String {
    let mut result = template.to_string();
    for (key, value) in variables {
        let placeholder = format!("{{{{{}}}}}", key);
        result = result.replace(&placeholder, value);
    }
    result
}

#[tauri::command]
pub async fn test_provider(
    request: TestProviderRequest,
    state: State<'_, AppState>,
) -> Result<TestProviderResponse, AppError> {
    let settings = state.get_settings()?;
    let provider_config = settings
        .ai
        .providers
        .iter()
        .find(|p| p.id == request.provider_id)
        .ok_or_else(|| AppError::Validation(format!("Provider not found: {}", request.provider_id)))?
        .clone();

    let provider = create_provider(&provider_config);
    let result = provider.test_connection().await?;

    Ok(TestProviderResponse {
        success: result.success,
        message: result.message,
        models: result.models,
    })
}

#[tauri::command]
pub async fn get_models(
    request: GetModelsRequest,
    state: State<'_, AppState>,
) -> Result<GetModelsResponse, AppError> {
    let settings = state.get_settings()?;
    let provider_config = settings
        .ai
        .providers
        .iter()
        .find(|p| p.id == request.provider_id)
        .ok_or_else(|| AppError::Validation(format!("Provider not found: {}", request.provider_id)))?
        .clone();

    let provider = create_provider(&provider_config);
    let models = provider.get_models().await?;

    Ok(GetModelsResponse { models })
}

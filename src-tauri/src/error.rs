use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("AI API error: {message}")]
    AiApi { code: String, message: String },

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    code: String,
    message: String,
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let (code, message) = match self {
            AppError::Io(e) => ("IO_ERROR".to_string(), e.to_string()),
            AppError::Json(e) => ("JSON_ERROR".to_string(), e.to_string()),
            AppError::Network(e) => ("NETWORK_ERROR".to_string(), e.to_string()),
            AppError::AiApi { code, message } => (code.clone(), message.clone()),
            AppError::Config(msg) => ("CONFIG_ERROR".to_string(), msg.clone()),
            AppError::NotFound(msg) => ("NOT_FOUND".to_string(), msg.clone()),
            AppError::Validation(msg) => ("VALIDATION_ERROR".to_string(), msg.clone()),
            AppError::Internal(msg) => ("INTERNAL_ERROR".to_string(), msg.clone()),
        };

        ErrorResponse { code, message }.serialize(serializer)
    }
}

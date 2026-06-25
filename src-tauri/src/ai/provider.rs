use reqwest::Client;
use std::time::Duration;

use crate::error::AppError;

use super::types::*;

#[derive(Debug, Clone)]
pub struct AiProvider {
    pub id: String,
    pub api_key: Option<String>,
    pub base_url: String,
    client: Client,
}

impl AiProvider {
    pub fn new(id: String, api_key: Option<String>, base_url: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            id,
            api_key,
            base_url,
            client,
        }
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            "application/json".parse().unwrap(),
        );

        if let Some(key) = &self.api_key {
            headers.insert(
                reqwest::header::AUTHORIZATION,
                format!("Bearer {}", key).parse().unwrap(),
            );
        }

        headers
    }

    pub async fn chat(&self, request: &ChatRequest) -> Result<ChatResponse, AppError> {
        let url = format!("{}/chat/completions", self.base_url);

        let openai_request = OpenAIRequest {
            model: request.model.clone(),
            messages: request.messages.clone(),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: false,
        };

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&openai_request)
            .send()
            .await
            .map_err(|e| AppError::AiApi {
                code: "request_failed".to_string(),
                message: format!("Failed to send request: {}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::AiApi {
                code: "api_error".to_string(),
                message: format!("API error ({}): {}", status, body),
            });
        }

        let openai_response: OpenAIResponse = response.json().await.map_err(|e| AppError::AiApi {
            code: "parse_error".to_string(),
            message: format!("Failed to parse response: {}", e),
        })?;

        let choice = openai_response.choices.first().ok_or_else(|| AppError::AiApi {
            code: "no_choices".to_string(),
            message: "No choices in response".to_string(),
        })?;

        let content = choice
            .message
            .as_ref()
            .and_then(|m| m.content.clone())
            .unwrap_or_default();

        Ok(ChatResponse {
            id: openai_response.id,
            content,
            model: request.model.clone(),
            usage: openai_response.usage.map(|u| Usage {
                prompt_tokens: u.prompt_tokens,
                completion_tokens: u.completion_tokens,
                total_tokens: u.total_tokens,
            }),
            finish_reason: choice.finish_reason.clone(),
        })
    }

    pub async fn chat_stream(
        &self,
        request: &ChatRequest,
    ) -> Result<reqwest::Response, AppError> {
        let url = format!("{}/chat/completions", self.base_url);

        let openai_request = OpenAIRequest {
            model: request.model.clone(),
            messages: request.messages.clone(),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: true,
        };

        let response = self
            .client
            .post(&url)
            .headers(self.get_headers())
            .json(&openai_request)
            .send()
            .await
            .map_err(|e| AppError::AiApi {
                code: "request_failed".to_string(),
                message: format!("Failed to send request: {}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::AiApi {
                code: "api_error".to_string(),
                message: format!("API error ({}): {}", status, body),
            });
        }

        Ok(response)
    }

    pub async fn get_models(&self) -> Result<Vec<String>, AppError> {
        let url = format!("{}/models", self.base_url);

        let response = self
            .client
            .get(&url)
            .headers(self.get_headers())
            .send()
            .await
            .map_err(|e| AppError::AiApi {
                code: "request_failed".to_string(),
                message: format!("Failed to fetch models: {}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::AiApi {
                code: "api_error".to_string(),
                message: format!("API error ({}): {}", status, body),
            });
        }

        let models_response: OpenAIModelsResponse =
            response.json().await.map_err(|e| AppError::AiApi {
                code: "parse_error".to_string(),
                message: format!("Failed to parse models response: {}", e),
            })?;

        Ok(models_response.data.into_iter().map(|m| m.id).collect())
    }

    pub async fn test_connection(&self) -> Result<ProviderTestResult, AppError> {
        match self.get_models().await {
            Ok(models) => Ok(ProviderTestResult {
                success: true,
                message: "Connection successful".to_string(),
                models: Some(models),
            }),
            Err(e) => Ok(ProviderTestResult {
                success: false,
                message: format!("Connection failed: {}", e),
                models: None,
            }),
        }
    }
}

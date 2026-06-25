use futures::stream::BoxStream;
use futures::StreamExt;
use reqwest::Response;

use crate::error::AppError;

use super::types::*;

type ByteStream = BoxStream<'static, Result<bytes::Bytes, reqwest::Error>>;

pub struct ChatStream {
    stream: ByteStream,
    buffer: String,
    finished: bool,
}

impl ChatStream {
    pub fn new(response: Response) -> Self {
        let stream = response.bytes_stream();
        Self {
            stream: Box::pin(stream),
            buffer: String::new(),
            finished: false,
        }
    }

    pub async fn next_chunk(&mut self) -> Result<Option<StreamChunk>, AppError> {
        if self.finished {
            return Ok(None);
        }

        loop {
            if let Some(line_end) = self.buffer.find('\n') {
                let line = self.buffer[..line_end].trim().to_string();
                self.buffer = self.buffer[line_end + 1..].to_string();

                if line.is_empty() {
                    continue;
                }

                if line == "data: [DONE]" {
                    self.finished = true;
                    return Ok(None);
                }

                if let Some(json_str) = line.strip_prefix("data: ") {
                    match serde_json::from_str::<OpenAIStreamResponse>(json_str) {
                        Ok(response) => {
                            if let Some(choice) = response.choices.first() {
                                let delta = choice
                                    .delta
                                    .as_ref()
                                    .and_then(|d| d.content.clone())
                                    .unwrap_or_default();

                                let reasoning_delta = choice
                                    .delta
                                    .as_ref()
                                    .and_then(|d| d.reasoning_content.clone());

                                if delta.is_empty()
                                    && reasoning_delta.is_none()
                                    && choice.finish_reason.is_none()
                                {
                                    continue;
                                }

                                return Ok(Some(StreamChunk {
                                    id: response.id,
                                    delta,
                                    reasoning_delta,
                                    finish_reason: choice.finish_reason.clone(),
                                }));
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to parse stream chunk: {}", e);
                            continue;
                        }
                    }
                }
            }

            match self.stream.next().await {
                Some(Ok(bytes)) => {
                    let text = String::from_utf8_lossy(&bytes);
                    self.buffer.push_str(&text);
                }
                Some(Err(e)) => {
                    return Err(AppError::AiApi {
                        code: "stream_error".to_string(),
                        message: format!("Stream error: {}", e),
                    });
                }
                None => {
                    self.finished = true;
                    return Ok(None);
                }
            }
        }
    }
}

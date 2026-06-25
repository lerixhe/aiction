use serde::{Deserialize, Serialize};

// 事件名称常量 - 与前端 shared/events.ts 保持同步
pub mod event_names {
    pub const SELECTION_CHANGED: &str = "selection:changed";
    pub const AI_STREAM_START: &str = "ai:stream:start";
    pub const AI_STREAM_DELTA: &str = "ai:stream:delta";
    pub const AI_STREAM_END: &str = "ai:stream:end";
    pub const AI_STREAM_ERROR: &str = "ai:stream:error";
    pub const STATE_CHANGED: &str = "state:changed";
}

// 事件载荷类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionChangedPayload {
    pub text: String,
    pub app_name: Option<String>,
    pub window_title: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiStreamDeltaPayload {
    pub delta: String,
    pub reasoning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiStreamErrorPayload {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateChangedPayload {
    pub key: String,
    pub value: serde_json::Value,
}

use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct StateChangedPayload {
    pub key: String,
    pub value: serde_json::Value,
}

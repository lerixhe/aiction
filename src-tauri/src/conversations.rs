use std::sync::{Mutex, OnceLock};

use serde::{Deserialize, Serialize};

use crate::ai::ChatMessage;
use crate::error::AppError;

type ConversationStore = std::sync::Arc<tauri_plugin_store::Store<tauri::Wry>>;

static CONVERSATION_STORE: OnceLock<Mutex<ConversationStore>> = OnceLock::new();

const CONVERSATIONS_KEY: &str = "conversations";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub messages: Vec<ChatMessage>,
    pub created_at: u64,
    pub updated_at: u64,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub selected_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationSummary {
    pub id: String,
    pub title: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub source: String,
    pub message_count: usize,
}

impl Conversation {
    pub fn new(id: String, source: String, selected_text: Option<String>) -> Self {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        let title = if source == "selection" {
            selected_text
                .as_deref()
                .map(|t| {
                    if t.len() > 30 {
                        format!("{}...", &t[..t.char_indices().nth(30).map_or(t.len(), |(i, _)| i)])
                    } else {
                        t.to_string()
                    }
                })
                .unwrap_or_else(|| "New Conversation".to_string())
        } else {
            "New Conversation".to_string()
        };

        Self {
            id,
            title,
            messages: Vec::new(),
            created_at: now,
            updated_at: now,
            source,
            selected_text,
        }
    }

    pub fn to_summary(&self) -> ConversationSummary {
        ConversationSummary {
            id: self.id.clone(),
            title: self.title.clone(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            source: self.source.clone(),
            message_count: self.messages.len(),
        }
    }
}

pub fn init_conversation_store(app: &tauri::AppHandle) -> Result<(), AppError> {
    let store = tauri_plugin_store::StoreBuilder::new(app, "conversations.json")
        .build()
        .map_err(|e| AppError::Custom(format!("Failed to create conversation store: {}", e)))?;
    CONVERSATION_STORE
        .set(Mutex::new(store))
        .map_err(|_| AppError::Custom("Conversation store already initialized".to_string()))?;
    Ok(())
}

fn get_store() -> Result<std::sync::MutexGuard<'static, ConversationStore>, AppError> {
    CONVERSATION_STORE
        .get()
        .ok_or_else(|| AppError::Custom("Conversation store not initialized".to_string()))?
        .lock()
        .map_err(|e| AppError::Lock(format!("conversation_store: {}", e)))
}

fn load_all() -> Result<Vec<Conversation>, AppError> {
    let store = get_store()?;
    match store.get(CONVERSATIONS_KEY) {
        Some(value) => {
            let conversations: Vec<Conversation> = serde_json::from_value(value.clone())
                .map_err(|e| AppError::Custom(format!("Failed to parse conversations: {}", e)))?;
            Ok(conversations)
        }
        None => Ok(Vec::new()),
    }
}

fn save_all(conversations: &[Conversation]) -> Result<(), AppError> {
    let store = get_store()?;
    let value = serde_json::to_value(conversations)
        .map_err(|e| AppError::Custom(format!("Failed to serialize conversations: {}", e)))?;
    store.set(CONVERSATIONS_KEY.to_string(), value);
    store
        .save()
        .map_err(|e| AppError::Custom(format!("Failed to save conversations: {}", e)))?;
    Ok(())
}

pub fn get_all_summaries() -> Result<Vec<ConversationSummary>, AppError> {
    let conversations = load_all()?;
    let mut summaries: Vec<ConversationSummary> = conversations.iter().map(|c| c.to_summary()).collect();
    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

pub fn get_conversation(id: &str) -> Result<Option<Conversation>, AppError> {
    let conversations = load_all()?;
    Ok(conversations.into_iter().find(|c| c.id == id))
}

pub fn create_conversation(source: &str, selected_text: Option<String>) -> Result<Conversation, AppError> {
    let mut conversations = load_all()?;
    let id = uuid::Uuid::new_v4().to_string();
    let conversation = Conversation::new(id, source.to_string(), selected_text);
    conversations.push(conversation.clone());
    save_all(&conversations)?;
    Ok(conversation)
}

pub fn add_message(id: &str, role: &str, content: &str) -> Result<Conversation, AppError> {
    let mut conversations = load_all()?;
    let conversation = conversations
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| AppError::Validation(format!("Conversation not found: {}", id)))?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    conversation.messages.push(ChatMessage {
        role: role.to_string(),
        content: content.to_string(),
    });
    conversation.updated_at = now;

    let result = conversation.clone();
    save_all(&conversations)?;
    Ok(result)
}

pub fn update_title(id: &str, title: &str) -> Result<(), AppError> {
    let mut conversations = load_all()?;
    let conversation = conversations
        .iter_mut()
        .find(|c| c.id == id)
        .ok_or_else(|| AppError::Validation(format!("Conversation not found: {}", id)))?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    conversation.title = title.to_string();
    conversation.updated_at = now;

    save_all(&conversations)?;
    Ok(())
}

pub fn delete_conversation(id: &str) -> Result<(), AppError> {
    let mut conversations = load_all()?;
    let before_len = conversations.len();
    conversations.retain(|c| c.id != id);
    if conversations.len() == before_len {
        return Err(AppError::Validation(format!("Conversation not found: {}", id)));
    }
    save_all(&conversations)?;
    Ok(())
}

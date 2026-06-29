use tauri::State;

use crate::conversations::{self, Conversation, ConversationSummary};
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub fn get_conversations(_state: State<'_, AppState>) -> Result<Vec<ConversationSummary>, AppError> {
    conversations::get_all_summaries()
}

#[tauri::command]
pub fn get_conversation(id: String, _state: State<'_, AppState>) -> Result<Option<Conversation>, AppError> {
    conversations::get_conversation(&id)
}

#[tauri::command]
pub fn create_conversation(
    source: String,
    selected_text: Option<String>,
    _state: State<'_, AppState>,
) -> Result<Conversation, AppError> {
    if !["manual", "selection"].contains(&source.as_str()) {
        return Err(AppError::Validation("source must be 'manual' or 'selection'".to_string()));
    }
    conversations::create_conversation(&source, selected_text)
}

#[tauri::command]
pub fn add_conversation_message(
    id: String,
    role: String,
    content: String,
    _state: State<'_, AppState>,
) -> Result<Conversation, AppError> {
    if !["user", "assistant", "system"].contains(&role.as_str()) {
        return Err(AppError::Validation("role must be 'user', 'assistant', or 'system'".to_string()));
    }
    conversations::add_message(&id, &role, &content)
}

#[tauri::command]
pub fn update_conversation_title(
    id: String,
    title: String,
    _state: State<'_, AppState>,
) -> Result<(), AppError> {
    if title.is_empty() {
        return Err(AppError::Validation("title cannot be empty".to_string()));
    }
    conversations::update_title(&id, &title)
}

#[tauri::command]
pub fn delete_conversation(id: String, _state: State<'_, AppState>) -> Result<(), AppError> {
    conversations::delete_conversation(&id)
}

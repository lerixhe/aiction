use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct Action {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub template: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActionExecutionRequest {
    pub action_id: String,
    pub input: String,
    pub context: Option<ActionContext>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActionContext {
    pub title: Option<String>,
    pub url: Option<String>,
    pub selection: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActionExecutionResult {
    pub success: bool,
    pub output: Option<String>,
    pub error: Option<String>,
}

#[command]
pub async fn execute_action(request: ActionExecutionRequest) -> Result<ActionExecutionResult, String> {
    log::info!("Executing action: {}", request.action_id);
    
    // TODO: 实现动作执行逻辑
    // 1. 根据 action_id 查找动作模板
    // 2. 替换模板中的占位符
    // 3. 调用 AI API 执行动作
    // 4. 返回结果
    
    Ok(ActionExecutionResult {
        success: true,
        output: Some("Action executed successfully".to_string()),
        error: None,
    })
}

#[command]
pub async fn get_actions() -> Result<Vec<Action>, String> {
    // TODO: 从存储中获取动作列表
    log::info!("Getting actions");
    Ok(vec![])
}

#[command]
pub async fn save_action(action: Action) -> Result<bool, String> {
    // TODO: 保存动作到存储
    log::info!("Saving action: {}", action.id);
    Ok(true)
}

#[command]
pub async fn delete_action(action_id: String) -> Result<bool, String> {
    // TODO: 从存储中删除动作
    log::info!("Deleting action: {}", action_id);
    Ok(true)
}

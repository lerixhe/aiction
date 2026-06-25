use super::{CursorPosition, SelectionDetector, SelectionResult, SelectionState};
use log::{debug, error, info, warn};

#[cfg(target_os = "windows")]
use windows::Win32::UI::Accessibility::*;
#[cfg(target_os = "windows")]
use windows::Win32::System::Com::*;
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::*;
#[cfg(target_os = "windows")]
use windows::core::*;

pub struct WindowsSelectionDetector {
    #[cfg(target_os = "windows")]
    automation: Option<IUIAutomation>,
}

impl WindowsSelectionDetector {
    pub fn new() -> Self {
        #[cfg(target_os = "windows")]
        {
            let automation = unsafe { CoCreateInstance(&CUIAutomation, None, CLSCTX_ALL).ok() };
            Self { automation }
        }

        #[cfg(not(target_os = "windows"))]
        {
            Self {}
        }
    }

    #[cfg(target_os = "windows")]
    fn get_focused_element(&self) -> Option<IUIAutomationElement> {
        let automation = self.automation.as_ref()?;
        unsafe {
            automation.GetFocusedElement().ok()
        }
    }

    #[cfg(target_os = "windows")]
    fn get_selected_text_from_element(&self, element: &IUIAutomationElement) -> Option<String> {
        unsafe {
            // Try TextPattern first
            let pattern: Option<IUIAutomationTextPattern> = element
                .GetCurrentPattern(UIA_TextPatternId)
                .ok()
                .and_then(|p| p.cast().ok());

            if let Some(text_pattern) = pattern {
                let range = text_pattern.GetSelection().ok()?.GetElement(0).ok()?;
                let text = range.GetText(-1).ok()?;
                if !text.is_empty() {
                    return Some(text.to_string());
                }
            }

            // Try ValuePattern
            let pattern: Option<IUIAutomationValuePattern> = element
                .GetCurrentPattern(UIA_ValuePatternId)
                .ok()
                .and_then(|p| p.cast().ok());

            if let Some(value_pattern) = pattern {
                let value = value_pattern.CurrentValue().ok()?;
                if !value.is_empty() {
                    return Some(value.to_string());
                }
            }

            None
        }
    }
}

impl SelectionDetector for WindowsSelectionDetector {
    fn get_selected_text(&self) -> SelectionState {
        #[cfg(target_os = "windows")]
        {
            let element = match self.get_focused_element() {
                Some(el) => el,
                None => {
                    debug!("No focused element found");
                    return SelectionState::Empty;
                }
            };

            if let Some(text) = self.get_selected_text_from_element(&element) {
                info!("Found selected text: {} chars", text.len());
                return SelectionState::Text(SelectionResult {
                    text,
                    position: self.get_cursor_position(),
                });
            }

            debug!("No text selected");
            SelectionState::Empty
        }

        #[cfg(not(target_os = "windows"))]
        {
            SelectionState::Unavailable
        }
    }

    fn get_cursor_position(&self) -> Option<CursorPosition> {
        #[cfg(target_os = "windows")]
        {
            unsafe {
                let mut point = POINT::default();
                if GetCursorPos(&mut point).is_ok() {
                    Some(CursorPosition {
                        x: point.x as f64,
                        y: point.y as f64,
                    })
                } else {
                    None
                }
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            None
        }
    }
}

unsafe impl Send for WindowsSelectionDetector {}
unsafe impl Sync for WindowsSelectionDetector {}

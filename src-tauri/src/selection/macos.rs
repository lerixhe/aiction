use super::{CursorPosition, SelectionDetector, SelectionResult, SelectionState};
use cocoa::base::{id, BOOL, YES};
use core_foundation::base::{CFRelease, CFTypeRef, TCFType};
use core_foundation::string::{CFString, CFStringRef};
use core_graphics::event::CGEvent;
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
use log::{debug, info, warn};
use std::ptr;

const K_AX_ERROR_SUCCESS: i32 = 0;

const K_AX_SELECTED_TEXT: &str = "AXSelectedText";
const K_AX_FOCUSED_UI_ELEMENT: &str = "AXFocusedUIElement";

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn AXUIElementCreateApplication(pid: i32) -> CFTypeRef;
    fn AXUIElementCopyAttributeValue(
        element: CFTypeRef,
        attribute: CFStringRef,
        value: *mut CFTypeRef,
    ) -> i32;
    fn AXIsProcessTrusted() -> BOOL;
    fn AXIsProcessTrustedWithOptions(options: CFTypeRef) -> BOOL;
}

pub struct MacOsSelectionDetector;

impl MacOsSelectionDetector {
    pub fn new() -> Self {
        Self
    }

    pub fn check_accessibility(&self) -> bool {
        unsafe { AXIsProcessTrusted() == YES }
    }

    pub fn request_accessibility() -> bool {
        unsafe {
            // This will trigger the system permission prompt
            let key = CFString::new("AXTrustedCheckOptionPrompt");
            let options = core_foundation::dictionary::CFDictionary::from_CFType_pairs(&[
                (key.as_CFType(), core_foundation::boolean::CFBoolean::true_value().as_CFType()),
            ]);
            AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef() as CFTypeRef) == YES
        }
    }

    fn get_focused_app_pid(&self) -> Option<i32> {
        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let running_apps: id = msg_send![workspace, runningApplications];
            let count: usize = msg_send![running_apps, count];

            for i in 0..count {
                let app: id = msg_send![running_apps, objectAtIndex:i];
                let is_active: BOOL = msg_send![app, isActive];
                if is_active == YES {
                    let pid: i32 = msg_send![app, processIdentifier];
                    return Some(pid);
                }
            }

            None
        }
    }

    fn get_selected_text_from_element(&self, element: CFTypeRef) -> Option<String> {
        unsafe {
            let attribute = CFString::new(K_AX_SELECTED_TEXT);
            let mut value: CFTypeRef = ptr::null();

            let result = AXUIElementCopyAttributeValue(
                element,
                attribute.as_concrete_TypeRef(),
                &mut value,
            );

            if result == K_AX_ERROR_SUCCESS && !value.is_null() {
                let cf_string: CFString = TCFType::wrap_under_get_rule(value as CFStringRef);
                let text = cf_string.to_string();

                if !text.is_empty() {
                    return Some(text);
                }
            }

            None
        }
    }

    fn get_focused_element(&self, app_element: CFTypeRef) -> Option<CFTypeRef> {
        unsafe {
            let attr = CFString::new(K_AX_FOCUSED_UI_ELEMENT);
            let mut value: CFTypeRef = ptr::null();

            let result =
                AXUIElementCopyAttributeValue(app_element, attr.as_concrete_TypeRef(), &mut value);

            if result == K_AX_ERROR_SUCCESS && !value.is_null() {
                Some(value)
            } else {
                None
            }
        }
    }

    fn query_cursor_position(&self) -> Option<CursorPosition> {
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).ok()?;
        let event = CGEvent::new(source).ok()?;
        let point = event.location();
        Some(CursorPosition {
            x: point.x,
            y: point.y,
        })
    }
}

impl SelectionDetector for MacOsSelectionDetector {
    fn get_selected_text(&self) -> SelectionState {
        if !self.check_accessibility() {
            warn!("Accessibility permissions not granted");
            return SelectionState::Unavailable;
        }

        let pid = match self.get_focused_app_pid() {
            Some(pid) => pid,
            None => {
                debug!("No focused application found");
                return SelectionState::Empty;
            }
        };

        let app_element = unsafe { AXUIElementCreateApplication(pid) };

        // Try to get the focused UI element first, then read its selected text
        if let Some(focused) = self.get_focused_element(app_element) {
            if let Some(text) = self.get_selected_text_from_element(focused) {
                info!("Found selected text: {} chars", text.len());
                unsafe { CFRelease(focused) };
                unsafe { CFRelease(app_element) };
                return SelectionState::Text(SelectionResult {
                    text,
                    position: self.query_cursor_position(),
                });
            }
            unsafe { CFRelease(focused) };
        }

        // Fallback: try selected text directly on the app element
        if let Some(text) = self.get_selected_text_from_element(app_element) {
            info!("Found selected text from app element: {} chars", text.len());
            unsafe { CFRelease(app_element) };
            return SelectionState::Text(SelectionResult {
                text,
                position: self.query_cursor_position(),
            });
        }

        unsafe { CFRelease(app_element) };
        debug!("No text selected");
        SelectionState::Empty
    }

    fn get_cursor_position(&self) -> Option<CursorPosition> {
        self.query_cursor_position()
    }
}

unsafe impl Send for MacOsSelectionDetector {}
unsafe impl Sync for MacOsSelectionDetector {}

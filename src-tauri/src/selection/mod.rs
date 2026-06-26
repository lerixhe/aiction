#[cfg(target_os = "macos")]
pub mod macos;

#[cfg(target_os = "windows")]
pub mod windows;

pub mod position;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionResult {
    pub text: String,
    pub position: Option<CursorPosition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SelectionState {
    Text(SelectionResult),
    Empty,
    Unavailable,
}

pub trait SelectionDetector {
    fn get_selected_text(&self) -> SelectionState;
    fn get_cursor_position(&self) -> Option<CursorPosition>;
}

pub fn create_detector() -> Box<dyn SelectionDetector> {
    #[cfg(target_os = "macos")]
    {
        Box::new(macos::MacOsSelectionDetector::new())
    }

    #[cfg(target_os = "windows")]
    {
        Box::new(windows::WindowsSelectionDetector::new())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        compile_error!("Unsupported platform for selection detection");
    }
}

pub fn check_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::MacOsSelectionDetector::new().check_accessibility()
    }

    #[cfg(target_os = "windows")]
    {
        true // Windows doesn't need special accessibility permission
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

pub fn request_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::MacOsSelectionDetector::request_accessibility()
    }

    #[cfg(target_os = "windows")]
    {
        true // Windows doesn't need special accessibility permission
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

/// Accessibility 选区读取的三态结果（类似 Kivio 实现）
/// - `Text(s)`：AX 取到非空选区
/// - `Empty`：AX 可用且确认当前没有选区
/// - `Unavailable`：AX 无权限 / 无 focused element / 元素不支持该属性
pub enum AxSelection {
    Text(String),
    Empty,
    Unavailable,
}

/// 直接从当前前台控件读取 Accessibility selected text（类似 Kivio 实现）
/// 这条路径不碰剪贴板，不受热键修饰键干扰
#[cfg(target_os = "macos")]
fn read_accessibility_selected_text() -> AxSelection {
    if !check_accessibility_permission() {
        log::warn!("AX unavailable: accessibility permission missing");
        return AxSelection::Unavailable;
    }

    use core_foundation::{
        base::{CFRelease, CFType, CFTypeRef, TCFType},
        string::{CFString, CFStringRef},
    };

    type AXUIElementRef = *const libc::c_void;
    type AXError = i32;

    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn AXUIElementCreateSystemWide() -> AXUIElementRef;
        fn AXUIElementCopyAttributeValue(
            element: AXUIElementRef,
            attribute: CFStringRef,
            value: *mut CFTypeRef,
        ) -> AXError;
    }

    const AX_ERROR_SUCCESS: AXError = 0;
    const AX_ERROR_NO_VALUE: AXError = -25212;

    unsafe {
        let system = AXUIElementCreateSystemWide();
        if system.is_null() {
            log::warn!("AX unavailable: system-wide element null");
            return AxSelection::Unavailable;
        }

        let focused_attr = CFString::new("AXFocusedUIElement");
        let mut focused_ref: CFTypeRef = std::ptr::null();
        let focused_err = AXUIElementCopyAttributeValue(
            system,
            focused_attr.as_concrete_TypeRef(),
            &mut focused_ref,
        );
        CFRelease(system as CFTypeRef);
        if focused_err != AX_ERROR_SUCCESS || focused_ref.is_null() {
            log::warn!("AX unavailable: no focused element (err={focused_err})");
            return AxSelection::Unavailable;
        }
        let focused = CFType::wrap_under_create_rule(focused_ref);

        let selected_attr = CFString::new("AXSelectedText");
        let mut selected_ref: CFTypeRef = std::ptr::null();
        let selected_err = AXUIElementCopyAttributeValue(
            focused.as_CFTypeRef() as AXUIElementRef,
            selected_attr.as_concrete_TypeRef(),
            &mut selected_ref,
        );

        if selected_err == AX_ERROR_NO_VALUE {
            log::debug!("AX confirmed empty selection (kAXErrorNoValue)");
            return AxSelection::Empty;
        }

        if selected_err != AX_ERROR_SUCCESS || selected_ref.is_null() {
            log::warn!("AX unavailable: AXSelectedText err={selected_err}");
            return AxSelection::Unavailable;
        }

        let selected = CFType::wrap_under_create_rule(selected_ref);
        match selected.downcast_into::<CFString>() {
            Some(cf) => {
                let text = cf.to_string();
                if text.trim().is_empty() {
                    log::debug!("AX confirmed empty selection (empty AXSelectedText)");
                    AxSelection::Empty
                } else {
                    AxSelection::Text(text)
                }
            }
            None => {
                log::warn!("AX unavailable: AXSelectedText not a CFString");
                AxSelection::Unavailable
            }
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn read_accessibility_selected_text() -> AxSelection {
    // TODO: 实现 Windows UIA 读取
    AxSelection::Unavailable
}

/// 模拟 Cmd+C (macOS) / Ctrl+C (Windows) 把选中文本拷进剪贴板
fn send_copy_shortcut() {
    #[cfg(target_os = "macos")]
    {
        if !check_accessibility_permission() {
            log::warn!("Accessibility permission missing for copy shortcut");
            return;
        }
        use core_graphics::event::{CGEvent, CGEventFlags, CGEventTapLocation};
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};

        let source = match CGEventSource::new(CGEventSourceStateID::Private) {
            Ok(s) => s,
            Err(_) => {
                log::error!("CGEventSource::new(Private) failed");
                return;
            }
        };

        // ANSI 'c' = keycode 8
        const KEY_C: core_graphics::event::CGKeyCode = 8;
        let down = match CGEvent::new_keyboard_event(source.clone(), KEY_C, true) {
            Ok(ev) => ev,
            Err(_) => {
                log::error!("CGEvent::new_keyboard_event(down) failed");
                return;
            }
        };
        down.set_flags(CGEventFlags::CGEventFlagCommand);
        down.post(CGEventTapLocation::HID);

        let up = match CGEvent::new_keyboard_event(source, KEY_C, false) {
            Ok(ev) => ev,
            Err(_) => {
                log::error!("CGEvent::new_keyboard_event(up) failed");
                return;
            }
        };
        up.set_flags(CGEventFlags::CGEventFlagCommand);
        up.post(CGEventTapLocation::HID);
    }
}

/// 获取剪贴板变化计数（用于检测剪贴板是否变化）
#[cfg(target_os = "macos")]
fn clipboard_change_count() -> Option<i64> {
    use cocoa::{
        appkit::NSPasteboard,
        base::{id, nil},
    };
    unsafe {
        let pasteboard: id = NSPasteboard::generalPasteboard(nil);
        if pasteboard == nil {
            None
        } else {
            Some(pasteboard.changeCount() as i64)
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn clipboard_change_count() -> Option<i64> {
    None
}

/// 读取剪贴板文本内容
fn read_clipboard_text() -> Option<String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::{id, nil};
        use cocoa::appkit::NSPasteboard;

        unsafe {
            let pasteboard: id = NSPasteboard::generalPasteboard(nil);
            if pasteboard == nil {
                return None;
            }

            let types: id = msg_send![pasteboard, types];
            let ns_string_type: id = msg_send![class!(NSString), alloc];
            let ns_string_type: id = msg_send![ns_string_type, initWithUTF8String: "public.utf8-plain-text\0".as_ptr()];
            let has_string: bool = msg_send![types, containsObject: ns_string_type];
            let _: () = msg_send![ns_string_type, release];

            if !has_string {
                return None;
            }

            let text: id = msg_send![pasteboard, stringForType: ns_string_type];
            if text == nil {
                return None;
            }

            let cstr: *const i8 = msg_send![text, UTF8String];
            if cstr.is_null() {
                return None;
            }

            Some(std::ffi::CStr::from_ptr(cstr).to_string_lossy().to_string())
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        None
    }
}

/// 写入文本到剪贴板
fn write_clipboard_text(text: &str) -> bool {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::{id, nil};
        use cocoa::appkit::NSPasteboard;
        use core_foundation::string::CFString;

        unsafe {
            let pasteboard: id = NSPasteboard::generalPasteboard(nil);
            if pasteboard == nil {
                return false;
            }

            let _: () = msg_send![pasteboard, clearContents];
            let cf_string = CFString::new(text);
            let ns_string_type: id = msg_send![class!(NSString), alloc];
            let ns_string_type: id = msg_send![ns_string_type, initWithUTF8String: "public.utf8-plain-text\0".as_ptr()];
            let _: bool = msg_send![pasteboard, setString: cf_string forType: ns_string_type];
            let _: () = msg_send![ns_string_type, release];
            true
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

/// 等待快捷键修饰键释放（避免 Cmd+C 与残留修饰键组合）
#[cfg(target_os = "macos")]
fn wait_for_copy_shortcut_modifiers_to_clear(timeout: std::time::Duration) {
    use core_graphics::{event::CGEventFlags, event_source::CGEventSourceStateID};

    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        fn CGEventSourceFlagsState(state_id: CGEventSourceStateID) -> u64;
    }

    let mask = CGEventFlags::CGEventFlagShift.bits()
        | CGEventFlags::CGEventFlagControl.bits()
        | CGEventFlags::CGEventFlagAlternate.bits()
        | CGEventFlags::CGEventFlagCommand.bits();
    let start = std::time::Instant::now();
    while start.elapsed() < timeout {
        let flags = unsafe { CGEventSourceFlagsState(CGEventSourceStateID::CombinedSessionState) };
        if flags & mask == 0 {
            return;
        }
        std::thread::sleep(std::time::Duration::from_millis(20));
    }
}

#[cfg(not(target_os = "macos"))]
fn wait_for_copy_shortcut_modifiers_to_clear(timeout: std::time::Duration) {
    std::thread::sleep(timeout.min(std::time::Duration::from_millis(120)));
}

/// 在前一个 App 仍持焦点时把选中文本读出来（类似 Kivio 的 capture_active_selection）
/// 优先使用 Accessibility API 直接读取，失败时才模拟 Cmd+C 兜底
/// 返回选中的文本，如果没有选中或失败则返回 None
pub fn capture_active_selection() -> Option<String> {
    // 1. 先尝试 Accessibility API 直接读取
    match read_accessibility_selected_text() {
        AxSelection::Text(text) => {
            log::info!("Selected text captured via Accessibility: {} chars", text.len());
            return Some(text);
        }
        AxSelection::Empty => {
            log::debug!("AX confirmed no selection, skipping Cmd+C fallback");
            return None;
        }
        AxSelection::Unavailable => {
            log::debug!("AX unavailable, falling back to Cmd+C");
        }
    }

    // 2. AX 无法判定时，走剪贴板 snapshot + Cmd+C 兜底逻辑
    let snapshot = read_clipboard_text();
    let before_change_count = clipboard_change_count();

    // 等用户松开修饰键，避免 Cmd+C 与残留修饰键组合
    wait_for_copy_shortcut_modifiers_to_clear(std::time::Duration::from_millis(450));
    send_copy_shortcut();
    std::thread::sleep(std::time::Duration::from_millis(150));

    let captured = read_clipboard_text();
    let text_changed = match (&snapshot, &captured) {
        (Some(a), Some(b)) => a != b,
        (None, Some(_)) => true,
        _ => false,
    };
    let after_change_count = clipboard_change_count();
    let pasteboard_changed = match (before_change_count, after_change_count) {
        (Some(before), Some(after)) => before != after,
        _ => false,
    };

    // 还原原剪贴板内容
    if let Some(orig) = &snapshot {
        write_clipboard_text(orig);
    }

    // pasteboard changeCount 覆盖"选中文本与原剪贴板文本完全相同"的情况
    if !text_changed && !pasteboard_changed {
        return None;
    }

    match captured {
        Some(t) if !t.trim().is_empty() => {
            log::info!("Selected text captured via Cmd+C: {} chars", t.len());
            Some(t)
        }
        _ => None,
    }
}

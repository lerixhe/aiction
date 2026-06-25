use super::CursorPosition;
use log::debug;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolbarPosition {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenBounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

pub struct PositionCalculator {
    toolbar_width: f64,
    toolbar_height: f64,
    offset_y: f64,
    margin: f64,
}

impl PositionCalculator {
    pub fn new(toolbar_width: f64, toolbar_height: f64) -> Self {
        Self {
            toolbar_width,
            toolbar_height,
            offset_y: 20.0, // Default offset below cursor
            margin: 10.0,   // Default margin from screen edges
        }
    }

    pub fn with_offset(mut self, offset_y: f64) -> Self {
        self.offset_y = offset_y;
        self
    }

    pub fn with_margin(mut self, margin: f64) -> Self {
        self.margin = margin;
        self
    }

    pub fn calculate_position(
        &self,
        cursor: &CursorPosition,
        screen: &ScreenBounds,
    ) -> ToolbarPosition {
        let mut x = cursor.x - (self.toolbar_width / 2.0);
        let mut y = cursor.y + self.offset_y;

        // Ensure toolbar stays within screen bounds horizontally
        if x < screen.x + self.margin {
            x = screen.x + self.margin;
        } else if x + self.toolbar_width > screen.x + screen.width - self.margin {
            x = screen.x + screen.width - self.toolbar_width - self.margin;
        }

        // If toolbar would go below screen, show it above cursor
        if y + self.toolbar_height > screen.y + screen.height - self.margin {
            y = cursor.y - self.toolbar_height - self.offset_y;
        }

        // Ensure toolbar doesn't go above screen
        if y < screen.y + self.margin {
            y = screen.y + self.margin;
        }

        debug!(
            "Calculated toolbar position: ({}, {}) for cursor ({}, {})",
            x, y, cursor.x, cursor.y
        );

        ToolbarPosition {
            x,
            y,
            width: self.toolbar_width,
            height: self.toolbar_height,
        }
    }
}

// Get screen bounds for the current display
pub fn get_screen_bounds() -> ScreenBounds {
    #[cfg(target_os = "macos")]
    {
        get_macos_screen_bounds()
    }

    #[cfg(target_os = "windows")]
    {
        get_windows_screen_bounds()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        // Default fallback
        ScreenBounds {
            x: 0.0,
            y: 0.0,
            width: 1920.0,
            height: 1080.0,
        }
    }
}

#[cfg(target_os = "macos")]
fn get_macos_screen_bounds() -> ScreenBounds {
    use cocoa::appkit::NSScreen;
    use cocoa::base::{id, nil};

    unsafe {
        let screen: id = msg_send![class!(NSScreen), mainScreen];
        if screen == nil {
            return ScreenBounds {
                x: 0.0,
                y: 0.0,
                width: 1920.0,
                height: 1080.0,
            };
        }

        let _frame = NSScreen::frame(screen);
        let visible_frame = NSScreen::visibleFrame(screen);

        ScreenBounds {
            x: visible_frame.origin.x,
            y: visible_frame.origin.y,
            width: visible_frame.size.width,
            height: visible_frame.size.height,
        }
    }
}

#[cfg(target_os = "windows")]
fn get_windows_screen_bounds() -> ScreenBounds {
    use windows::Win32::Foundation::*;
    use windows::Win32::Graphics::Gdi::*;
    use windows::Win32::UI::WindowsAndMessaging::*;

    unsafe {
        let monitor = MonitorFromPoint(POINT::default(), MONITOR_DEFAULTTONEAREST);
        let mut monitor_info = MONITORINFOEXW {
            cbSize: std::mem::size_of::<MONITORINFOEXW>() as u32,
            ..Default::default()
        };

        if GetMonitorInfoW(monitor, &mut monitor_info as *mut _ as *mut _).as_bool() {
            let work_area = monitor_info.rcWork;
            ScreenBounds {
                x: work_area.left as f64,
                y: work_area.top as f64,
                width: (work_area.right - work_area.left) as f64,
                height: (work_area.bottom - work_area.top) as f64,
            }
        } else {
            ScreenBounds {
                x: 0.0,
                y: 0.0,
                width: 1920.0,
                height: 1080.0,
            }
        }
    }
}

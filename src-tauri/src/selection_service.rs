use crate::selection::{self, SelectionResult, SelectionState};
use crate::selection::position::{PositionCalculator, ToolbarPosition};
use crate::windows;
use log::{debug, info, warn};
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

const POLL_INTERVAL: Duration = Duration::from_millis(300);
const DEBOUNCE_DURATION: Duration = Duration::from_millis(500);

#[derive(Debug, Clone, Serialize)]
pub struct SelectionEvent {
    pub text: String,
    pub toolbar_position: Option<ToolbarPosition>,
}

pub struct SelectionService {
    running: Arc<AtomicBool>,
    last_text: Arc<Mutex<Option<String>>>,
    handle: Option<thread::JoinHandle<()>>,
}

impl SelectionService {
    pub fn new() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            last_text: Arc::new(Mutex::new(None)),
            handle: None,
        }
    }

    pub fn start(&mut self, app: AppHandle) {
        if self.running.load(Ordering::SeqCst) {
            warn!("SelectionService is already running");
            return;
        }

        self.running.store(true, Ordering::SeqCst);
        let running = self.running.clone();
        let last_text = self.last_text.clone();

        let handle = thread::spawn(move || {
            info!("SelectionService started");
            let detector = selection::create_detector();

            while running.load(Ordering::SeqCst) {
                match detector.get_selected_text() {
                    SelectionState::Text(result) => {
                        let text = result.text.trim().to_string();
                        if text.is_empty() {
                            continue;
                        }

                        // Check if this is the same as last selection
                        let should_emit = {
                            let mut last = last_text.lock().expect("SelectionService: failed to lock last_text");
                            if last.as_ref() == Some(&text) {
                                false
                            } else {
                                *last = Some(text.clone());
                                true
                            }
                        };

                        if should_emit {
                            info!("New selection detected: {} chars", text.len());

                            // Calculate toolbar position
                            let toolbar_position = if let Some(ref cursor) = result.position {
                                let screen = selection::position::get_screen_bounds();
                                let calculator = PositionCalculator::new(400.0, 48.0)
                                    .with_offset(20.0)
                                    .with_margin(10.0);
                                Some(calculator.calculate_position(cursor, &screen))
                            } else {
                                None
                            };

                            // First ensure toolbar window exists
                            if let Err(e) = windows::ensure_toolbar_window(&app) {
                                warn!("Failed to show toolbar window: {}", e);
                                continue;
                            }

                            // Position toolbar window
                            if let Some(ref pos) = toolbar_position {
                                if let Err(e) = windows::position_toolbar_window(&app, pos.x, pos.y) {
                                    warn!("Failed to position toolbar: {}", e);
                                }
                            }

                            // Small delay to ensure window is ready
                            thread::sleep(Duration::from_millis(50));

                            // Emit event to toolbar window
                            let event = SelectionEvent {
                                text: text.clone(),
                                toolbar_position,
                            };

                            if let Err(e) = app.emit("selection-changed", &event) {
                                warn!("Failed to emit selection event: {}", e);
                            } else {
                                info!("Emitted selection-changed event");
                            }
                        }
                    }
                    SelectionState::Empty => {
                        let had_text = {
                            let mut last = last_text.lock().expect("SelectionService: failed to lock last_text");
                            last.take().is_some()
                        };

                        if had_text {
                            debug!("Selection cleared");
                            // Hide toolbar window
                            if let Err(e) = windows::hide_toolbar_window(&app) {
                                warn!("Failed to hide toolbar: {}", e);
                            }
                            if let Err(e) = app.emit("selection-cleared", ()) {
                                warn!("Failed to emit selection-cleared event: {}", e);
                            }
                        }
                    }
                    SelectionState::Unavailable => {
                        warn!("Selection detection unavailable - check accessibility permissions");
                        thread::sleep(Duration::from_secs(5));
                        continue;
                    }
                }

                thread::sleep(POLL_INTERVAL);
            }

            info!("SelectionService stopped");
        });

        self.handle = Some(handle);
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::SeqCst);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
        // Clear last text
        let mut last = self.last_text.lock().expect("SelectionService: failed to lock last_text");
        *last = None;
    }

    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }
}

impl Drop for SelectionService {
    fn drop(&mut self) {
        self.stop();
    }
}

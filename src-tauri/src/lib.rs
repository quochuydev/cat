use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            // Set both the window and webview background to fully transparent
            let transparent = tauri::utils::config::Color(0, 0, 0, 0);
            let _ = window.set_background_color(Some(transparent));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

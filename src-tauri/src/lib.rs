use std::thread;

use serde::Serialize;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tiny_http::{Header, Response, Server};

#[derive(Clone, Serialize)]
struct ChatMessage {
    message: String,
}

#[derive(serde::Deserialize)]
struct SayRequest {
    message: String,
}

fn start_message_server(app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        let server = match Server::http("127.0.0.1:11451") {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Failed to start message server: {}", e);
                return;
            }
        };

        for mut request in server.incoming_requests() {
            // CORS preflight
            if request.method() == &tiny_http::Method::Options {
                let response = Response::empty(204)
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                    )
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Methods", "POST, OPTIONS")
                            .unwrap(),
                    )
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Headers", "Content-Type").unwrap(),
                    );
                let _ = request.respond(response);
                continue;
            }

            // Only POST /say
            if request.method() != &tiny_http::Method::Post || request.url() != "/say" {
                let response = Response::from_string("{\"error\":\"Not found\"}")
                    .with_status_code(404)
                    .with_header(
                        Header::from_bytes("Content-Type", "application/json").unwrap(),
                    )
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                    );
                let _ = request.respond(response);
                continue;
            }

            let mut body = String::new();
            if request.as_reader().read_to_string(&mut body).is_err() {
                let response = Response::from_string("{\"error\":\"Bad request\"}")
                    .with_status_code(400)
                    .with_header(
                        Header::from_bytes("Content-Type", "application/json").unwrap(),
                    )
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                    );
                let _ = request.respond(response);
                continue;
            }

            let msg = match serde_json::from_str::<SayRequest>(&body) {
                Ok(req) => req.message,
                Err(_) => {
                    // If not JSON, treat the raw body as the message
                    body.trim().to_string()
                }
            };

            if msg.is_empty() {
                let response = Response::from_string("{\"error\":\"Empty message\"}")
                    .with_status_code(400)
                    .with_header(
                        Header::from_bytes("Content-Type", "application/json").unwrap(),
                    )
                    .with_header(
                        Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                    );
                let _ = request.respond(response);
                continue;
            }

            let _ = app_handle.emit("chat-message", ChatMessage { message: msg });

            let response = Response::from_string("{\"ok\":true}")
                .with_status_code(200)
                .with_header(
                    Header::from_bytes("Content-Type", "application/json").unwrap(),
                )
                .with_header(
                    Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
                );
            let _ = request.respond(response);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyS);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut(shortcut)
                .expect("failed to register shortcut")
                .with_handler(move |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        let _ = app.emit("toggle-menu", ());
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let transparent = tauri::utils::config::Color(0, 0, 0, 0);
            let _ = window.set_background_color(Some(transparent));
            let _ = window.set_shadow(false);

            // Start local message server on port 11451
            start_message_server(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

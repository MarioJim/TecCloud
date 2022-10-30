use tokio::signal::unix::{signal, SignalKind};

#[tokio::main]
async fn main() {
    println!("waiting for sigterm");

    signal(SignalKind::terminate())
        .expect("Couldn't wait for sigterm")
        .recv()
        .await;

    println!("received sigterm");
}

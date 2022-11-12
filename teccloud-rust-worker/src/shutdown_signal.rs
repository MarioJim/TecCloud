use tokio::{
    signal::unix::{signal, SignalKind},
    sync::broadcast::{channel, Receiver, Sender},
};
use tracing::error;

pub struct ShutdownSignal {
    sender: Sender<()>,
    receiver: Option<Receiver<()>>,
}

impl Default for ShutdownSignal {
    fn default() -> Self {
        let (sender, rx) = channel(1);

        let sigterm_sender = sender.clone();
        tokio::spawn(async move {
            signal(SignalKind::terminate())
                .expect("Couldn't wait for SIGTERM")
                .recv()
                .await;

            if let Err(error) = sigterm_sender.send(()) {
                error!(?error, "Error sending shutdown signal");
            }
        });

        let sigint_sender = sender.clone();
        tokio::spawn(async move {
            signal(SignalKind::interrupt())
                .expect("Couldn't wait for SIGINT")
                .recv()
                .await;

            if let Err(error) = sigint_sender.send(()) {
                error!(?error, "Error sending shutdown signal");
            }
        });

        Self {
            sender,
            receiver: Some(rx),
        }
    }
}

impl ShutdownSignal {
    pub(crate) fn get_sender(&self) -> Sender<()> {
        self.sender.clone()
    }

    pub(crate) fn get_receiver(&mut self) -> Receiver<()> {
        self.receiver
            .take()
            .unwrap_or_else(|| self.sender.subscribe())
    }
}

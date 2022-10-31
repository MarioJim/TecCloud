use anyhow::{Context, Result};
use futures_lite::StreamExt;
use lapin::{message::Delivery, options::BasicAckOptions};
use teccloud_shared_rust::{
    conn::{RabbitMQConnection, WaitForConnections},
    Config,
    ConnectionType::ThumbnailGeneration,
    FileInfo, ShutdownSignal,
};
use tracing::{debug, debug_span, error};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let mut shutdown_signal = ShutdownSignal::default();
    let config = Config::create_from_env(ThumbnailGeneration)?;

    WaitForConnections::from(&config).start().await?;

    let rmq_conn = RabbitMQConnection::setup(&config).await?;
    let mut consumer = rmq_conn.create_consumer(&mut shutdown_signal).await?;

    while let Some(delivery) = consumer.next().await {
        if let Err(error) = process_message(delivery).await {
            error!(?error, "Error processing message");
        }
    }

    rmq_conn.close().await?;

    Ok(())
}

async fn process_message(delivery: Delivery) -> Result<()> {
    let processing_file_span = debug_span!("Processing message");
    let _enter = processing_file_span.enter();

    let file_info = FileInfo::from_delivery(&delivery)?;
    debug!(?file_info, "Received file info");

    error!(
        "Should be generating thumbnails for file {}",
        file_info.file_id
    );

    delivery
        .ack(BasicAckOptions::default())
        .await
        .context("Ack'ing delivery")
}

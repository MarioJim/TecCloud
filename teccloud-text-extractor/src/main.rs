use anyhow::{Context, Result};
use futures_lite::StreamExt;
use lapin::{message::Delivery, options::BasicAckOptions};
use teccloud_shared_rust::{
    conn::{PostgresConnection, RabbitMQConnection, WaitForConnections},
    Config,
    ConnectionType::TextExtraction,
    FileInfo, ShutdownSignal,
};
use tracing::{debug, debug_span, error};

mod extractor;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let mut shutdown_signal = ShutdownSignal::default();
    let config = Config::create_from_env(TextExtraction)?;

    WaitForConnections::from(&config).start().await?;

    let mut pg_conn = PostgresConnection::setup(&config, &mut shutdown_signal).await?;
    let rmq_conn = RabbitMQConnection::setup(&config).await?;
    let mut consumer = rmq_conn.create_consumer(&mut shutdown_signal).await?;

    while let Some(delivery) = consumer.next().await {
        if let Err(error) = process_message(delivery, &mut pg_conn).await {
            error!(?error, "Error processing message");
        }
    }

    rmq_conn.close().await?;

    Ok(())
}

async fn process_message(delivery: Delivery, pg_conn: &mut PostgresConnection) -> Result<()> {
    let processing_file_span = debug_span!("Processing message");
    let _enter = processing_file_span.enter();

    let file_info = FileInfo::from_delivery(&delivery)?;
    debug!(?file_info, "Received file info");

    let pages_text = extractor::extract_text(&file_info)
        .await
        .with_context(|| format!("On file {}", file_info.file_id))?;
    debug!(
        pages = pages_text.len(),
        first_page_size = pages_text.get(&1).map_or(0, |text| text.len()),
        "Extracted text"
    );

    pg_conn.store(file_info, pages_text).await?;
    debug!("Stored text");

    delivery
        .ack(BasicAckOptions::default())
        .await
        .context("Ack'ing delivery")
}

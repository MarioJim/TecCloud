use anyhow::Result;
use futures_lite::StreamExt;
use lapin::options::BasicAckOptions;
use tracing::error;

mod config;
mod conn;
mod file_info;
mod process;
mod shutdown_signal;

use crate::{
    config::Config,
    conn::{PostgresConnection, RabbitMQConnection, WaitForConnections},
    file_info::FileInfo,
    process::process_message,
    shutdown_signal::ShutdownSignal,
};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let mut shutdown_signal = ShutdownSignal::default();
    let config = Config::create_from_env()?;

    WaitForConnections::from(&config).start().await?;

    let mut pg_conn = PostgresConnection::setup(&config, &mut shutdown_signal).await?;
    let rmq_conn = RabbitMQConnection::setup(&config).await?;
    let mut consumer = rmq_conn.create_consumer(&mut shutdown_signal).await?;

    while let Some(delivery) = consumer.next().await {
        if let Err(error) = process_message(&delivery.data, &config, &mut pg_conn).await {
            error!(?error, "Error processing message");
        }
        if let Err(error) = delivery.ack(BasicAckOptions::default()).await {
            error!(?error, "Error ack'ing message");
        }
    }

    rmq_conn.close().await?;

    Ok(())
}

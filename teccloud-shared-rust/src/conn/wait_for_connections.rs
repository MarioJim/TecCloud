use anyhow::{Context, Result};
use tokio::{net::TcpStream, time};
use tracing::debug;

use crate::Config;

pub struct WaitForConnections {
    rmq_address: (String, u16),
    pg_address: (String, u16),
}

impl From<&Config> for WaitForConnections {
    fn from(config: &Config) -> Self {
        Self {
            rmq_address: config.rabbitmq_address(),
            pg_address: config.postgres_address(),
        }
    }
}

impl WaitForConnections {
    pub async fn start(&self) -> Result<()> {
        let pg_address = self.pg_address.clone();
        let pg_handle = tokio::spawn(async move {
            while TcpStream::connect(&pg_address).await.is_err() {
                debug!("Failed to connect to Postgres");
                time::sleep(time::Duration::from_secs(1)).await;
            }
            debug!("Postgres is up");
        });

        let rmq_address = self.rmq_address.clone();
        let rmq_handle = tokio::spawn(async move {
            while TcpStream::connect(&rmq_address).await.is_err() {
                debug!("Failed to connect to RabbitMQ");
                time::sleep(time::Duration::from_secs(1)).await;
            }
            debug!("RabbitMQ is up");
        });

        tokio::try_join!(pg_handle, rmq_handle).context("Waiting for connections")?;

        time::sleep(time::Duration::from_secs(5)).await;
        debug!("Connecting to database and queue...");

        Ok(())
    }
}

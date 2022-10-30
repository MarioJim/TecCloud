use std::{
    pin::Pin,
    task::{Context, Poll},
};

use anyhow::{Context as AnyhowContext, Result};
use futures_lite::{ready, Stream, StreamExt};
use lapin::{
    message::Delivery,
    options::{BasicConsumeOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties, Consumer,
};
use tokio::sync::broadcast;
use tracing::{debug, error, info};

use crate::{Config, ConnectionType, ShutdownSignal};

pub struct RabbitMQConnection {
    connection: Connection,
    queue_name: String,
    consumer_tag: &'static str,
}

impl RabbitMQConnection {
    pub async fn setup(config: &Config) -> Result<Self> {
        let uri = config.amqp_uri();
        let options = ConnectionProperties::default()
            .with_executor(tokio_executor_trait::Tokio::current())
            .with_reactor(tokio_reactor_trait::Tokio);

        let connection = Connection::connect_uri(uri, options)
            .await
            .context("Setting up the RabbitMQ connection")?;
        info!("Connected to RabbitMQ");

        let queue_name = config.queue_name().clone();
        let consumer_tag = match config.connection_type {
            ConnectionType::TextExtraction => "text_extractor_consumer",
            ConnectionType::ThumbnailGeneration => "thumbnail_generator_consumer",
        };

        Ok(Self {
            connection,
            queue_name,
            consumer_tag,
        })
    }

    pub async fn create_consumer(
        &self,
        shutdown: &mut ShutdownSignal,
    ) -> Result<RabbitMQConsumerLoop> {
        let channel = self.connection.create_channel().await?;

        let queue_options = QueueDeclareOptions {
            durable: true,
            ..Default::default()
        };
        channel
            .queue_declare(&self.queue_name, queue_options, FieldTable::default())
            .await?;
        debug!("Declared queue");

        let consumer = channel
            .basic_consume(
                &self.queue_name,
                self.consumer_tag,
                BasicConsumeOptions::default(),
                FieldTable::default(),
            )
            .await
            .context("Creating the consumer")?;
        info!("Initialized RabbitMQ consumer");

        Ok(RabbitMQConsumerLoop {
            inner: consumer,
            shutdown_sender: shutdown.get_sender(),
            shutdown_receiver: shutdown.get_receiver(),
        })
    }

    pub async fn close(self) -> Result<()> {
        info!("Closing RabbitMQ connection");

        self.connection
            .close(0, "closing connection")
            .await
            .context("Closing the RabbitMQ connection")
    }
}

pub struct RabbitMQConsumerLoop {
    inner: Consumer,
    shutdown_receiver: broadcast::Receiver<()>,
    shutdown_sender: broadcast::Sender<()>,
}

impl Stream for RabbitMQConsumerLoop {
    type Item = Delivery;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        if !self.shutdown_receiver.is_empty() {
            return Poll::Ready(None);
        }

        let maybe_delivery =
            ready!(self.inner.poll_next(cx)).and_then(|delivery_result| match delivery_result {
                Ok(delivery) => Some(delivery),
                Err(error) => {
                    error!(?error, "Error receiving delivery");
                    None
                }
            });

        if maybe_delivery.is_none() {
            if let Err(error) = self.shutdown_sender.send(()) {
                error!(?error, "Error sending shutdown signal");
            }
        }

        Poll::Ready(maybe_delivery)
    }
}

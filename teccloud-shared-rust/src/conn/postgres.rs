use anyhow::{Context, Result};
use nohash_hasher::IntMap;
use tokio_postgres::{Client, NoTls, Statement};
use tracing::{debug, debug_span, error, info};

use crate::{Config, ConnectionType, FileInfo, ShutdownSignal};

const SELECT_PAGES_STMT: &str = r#"SELECT id, number FROM pages WHERE "fileId" = ($1)"#;
const INSERT_TEXT_STMT: &str =
    r#"INSERT INTO pages ("fileId", number, content) VALUES ($1, $2, $3)"#;
const INSERT_THUMB_STMT: &str =
    r#"INSERT INTO pages ("fileId", number, "thumbnailPath") VALUES ($1, $2, $3)"#;
const UPDATE_TEXT_STMT: &str = "UPDATE pages SET content = ($1) WHERE id = ($2)";
const UPDATE_THUMB_STMT: &str = r#"UPDATE pages SET "thumbnailPath" = ($1) WHERE id = ($2)"#;

pub struct PostgresConnection {
    client: Client,
    select_pages_stmt: Statement,
    insert_stmt: Statement,
    update_stmt: Statement,
}

impl PostgresConnection {
    pub async fn setup(config: &Config, shutdown_signal: &mut ShutdownSignal) -> Result<Self> {
        let (client, connection) = config
            .postgres_config()
            .connect(NoTls)
            .await
            .context("Connecting to Postgres DB")?;

        let connection_shutdown_signal_sender = shutdown_signal.get_sender();
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                error!(?error, "On Postgres connection");
                if let Err(error) = connection_shutdown_signal_sender.send(()) {
                    error!(?error, "Error sending shutdown signal");
                }
            }
        });
        info!("Connected to Postgres");

        let select_pages_stmt = client.prepare(SELECT_PAGES_STMT).await?;
        let insert_stmt = match config.connection_type {
            ConnectionType::TextExtraction => client.prepare(INSERT_TEXT_STMT),
            ConnectionType::ThumbnailGeneration => client.prepare(INSERT_THUMB_STMT),
        }
        .await?;
        let update_stmt = match config.connection_type {
            ConnectionType::TextExtraction => client.prepare(UPDATE_TEXT_STMT),
            ConnectionType::ThumbnailGeneration => client.prepare(UPDATE_THUMB_STMT),
        }
        .await?;
        debug!("Prepared Postgres statements");

        Ok(Self {
            client,
            select_pages_stmt,
            insert_stmt,
            update_stmt,
        })
    }

    pub async fn store(&mut self, file_info: FileInfo, data: IntMap<i32, String>) -> Result<()> {
        let storing_data_span = debug_span!("Inserting data into Postgres");
        let _enter = storing_data_span.enter();

        let tx = self.client.transaction().await?;

        let page_number_to_id: IntMap<i32, i32> = tx
            .query(&self.select_pages_stmt, &[&file_info.id])
            .await?
            .into_iter()
            .map(|row| (row.get(1), row.get(0)))
            .collect();

        for (page_num, path) in &data {
            if let Some(page_id) = page_number_to_id.get(page_num) {
                tx.execute(&self.update_stmt, &[path, page_id]).await?;
            } else {
                tx.execute(&self.insert_stmt, &[&file_info.id, page_num, path])
                    .await?;
            }
        }

        tx.commit()
            .await
            .context("Committing a transaction to Postgres")?;

        debug!("Stored data in Postgres");

        Ok(())
    }
}

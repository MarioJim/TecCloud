use anyhow::{Context, Result};
use nohash_hasher::IntMap;
use tokio_postgres::{Client, NoTls, Statement};
use tracing::{debug, debug_span, error, info};

use crate::{file_info::FileID, process::PageToStringsMap, Config, ShutdownSignal};

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
    insert_text_stmt: Statement,
    insert_thumb_stmt: Statement,
    update_text_stmt: Statement,
    update_thumb_stmt: Statement,
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
        let insert_text_stmt = client.prepare(INSERT_TEXT_STMT).await?;
        let insert_thumb_stmt = client.prepare(INSERT_THUMB_STMT).await?;
        let update_text_stmt = client.prepare(UPDATE_TEXT_STMT).await?;
        let update_thumb_stmt = client.prepare(UPDATE_THUMB_STMT).await?;
        debug!("Prepared Postgres statements");

        Ok(Self {
            client,
            select_pages_stmt,
            insert_text_stmt,
            insert_thumb_stmt,
            update_text_stmt,
            update_thumb_stmt,
        })
    }

    pub async fn store_page_contents(
        &mut self,
        file_id: &FileID,
        page_contents: IntMap<i32, String>,
    ) -> Result<()> {
        self.store(file_id, DataToStore::Contents, page_contents)
            .await
    }

    pub async fn store_thumbnails(
        &mut self,
        file_id: &FileID,
        page_thumbnails: IntMap<i32, String>,
    ) -> Result<()> {
        self.store(file_id, DataToStore::Thumbnails, page_thumbnails)
            .await
    }

    async fn store(
        &mut self,
        file_id: &FileID,
        data_type: DataToStore,
        data: PageToStringsMap,
    ) -> Result<()> {
        let storing_data_span = debug_span!("Inserting data into Postgres");
        let _enter = storing_data_span.enter();

        let tx = self.client.transaction().await?;

        let page_number_to_id: IntMap<i32, i32> = tx
            .query(&self.select_pages_stmt, &[&file_id])
            .await?
            .into_iter()
            .map(|row| (row.get(1), row.get(0)))
            .collect();

        let update_stmt = match data_type {
            DataToStore::Contents => &self.update_text_stmt,
            DataToStore::Thumbnails => &self.update_thumb_stmt,
        };
        let insert_stmt = match data_type {
            DataToStore::Contents => &self.insert_text_stmt,
            DataToStore::Thumbnails => &self.insert_thumb_stmt,
        };

        for (page_num, path) in &data {
            if let Some(page_id) = page_number_to_id.get(page_num) {
                tx.execute(update_stmt, &[path, page_id]).await?;
            } else {
                tx.execute(insert_stmt, &[&file_id, page_num, path]).await?;
            }
        }

        tx.commit()
            .await
            .context("Committing a transaction to Postgres")?;

        debug!("Stored data in Postgres");

        Ok(())
    }
}

#[derive(Debug, Clone, Copy)]
enum DataToStore {
    Contents,
    Thumbnails,
}

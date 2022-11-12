use std::path::PathBuf;

use anyhow::{Context, Result};
use lapin::uri::AMQPUri;
use tokio::fs::canonicalize;
use tokio_postgres::config::Config as PGConfig;

use crate::FileInfo;

#[derive(Debug)]
struct PostgresConfig {
    host: String,
    db: String,
    user: String,
    pass: String,
}

#[derive(Debug)]
struct RabbitMQConfig {
    host: String,
    user: String,
    pass: String,
    queue: String,
}

#[derive(Debug)]
pub struct Config {
    files_folder: String,
    postgres: PostgresConfig,
    rabbitmq: RabbitMQConfig,
}

macro_rules! maybe_env_var {
    ($v:expr) => {{
        std::env::var($v).context(concat!("No env var named ", $v, " found."))
    }};
}

impl Config {
    pub fn create_from_env() -> Result<Config> {
        let rabbitmq = RabbitMQConfig {
            host: maybe_env_var!("RABBITMQ_HOST")?,
            user: maybe_env_var!("RABBITMQ_DEFAULT_USER")?,
            pass: maybe_env_var!("RABBITMQ_DEFAULT_PASS")?,
            queue: maybe_env_var!("RABBITMQ_WORKER_QUEUE")?,
        };

        let postgres = PostgresConfig {
            host: maybe_env_var!("POSTGRES_HOST")?,
            db: maybe_env_var!("POSTGRES_DB")?,
            user: maybe_env_var!("POSTGRES_USER")?,
            pass: maybe_env_var!("POSTGRES_PASSWORD")?,
        };

        let files_folder =
            std::env::var("FILES_FOLDER").unwrap_or_else(|_| String::from("userfiles/"));

        Ok(Config {
            files_folder,
            rabbitmq,
            postgres,
        })
    }

    pub async fn path_for_file(&self, file: &FileInfo) -> Result<PathBuf> {
        canonicalize(format!("{}{}", self.files_folder, file.file_name))
            .await
            .context("Canonicalizing path to a file")
    }

    pub(crate) fn queue_name(&self) -> &String {
        &self.rabbitmq.queue
    }

    pub(crate) fn amqp_uri(&self) -> AMQPUri {
        let mut uri = AMQPUri::default();
        uri.authority.host = self.rabbitmq.host.clone();
        uri.authority.userinfo.username = self.rabbitmq.user.clone();
        uri.authority.userinfo.password = self.rabbitmq.pass.clone();
        uri
    }

    pub(crate) fn rabbitmq_address(&self) -> (String, u16) {
        (self.rabbitmq.host.clone(), 5672)
    }

    pub(crate) fn postgres_config(&self) -> PGConfig {
        let mut pg_config = PGConfig::default();
        pg_config.host(&self.postgres.host);
        pg_config.user(&self.postgres.user);
        pg_config.password(&self.postgres.pass);
        pg_config.dbname(&self.postgres.db);
        pg_config
    }

    pub(crate) fn postgres_address(&self) -> (String, u16) {
        (self.postgres.host.clone(), 5432)
    }
}

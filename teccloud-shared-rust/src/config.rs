use anyhow::{Context, Result};
use lapin::uri::AMQPUri;
use tokio_postgres::config::Config as PGConfig;

use crate::ConnectionType;

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
    text_queue: String,
    thumb_queue: String,
}

#[derive(Debug)]
pub struct Config {
    pub connection_type: ConnectionType,
    postgres: PostgresConfig,
    rabbitmq: RabbitMQConfig,
}

macro_rules! maybe_env_var {
    ($v:expr) => {{
        std::env::var($v).context(concat!("No env var named ", $v, " found."))
    }};
}

impl Config {
    pub fn create_from_env(connection_type: ConnectionType) -> Result<Config> {
        let rabbitmq = RabbitMQConfig {
            host: maybe_env_var!("RABBITMQ_HOST")?,
            user: maybe_env_var!("RABBITMQ_DEFAULT_USER")?,
            pass: maybe_env_var!("RABBITMQ_DEFAULT_PASS")?,
            text_queue: maybe_env_var!("RABBITMQ_TEXT_QUEUE")?,
            thumb_queue: maybe_env_var!("RABBITMQ_THUMB_QUEUE")?,
        };

        let postgres = PostgresConfig {
            host: maybe_env_var!("POSTGRES_HOST")?,
            db: maybe_env_var!("POSTGRES_DB")?,
            user: maybe_env_var!("POSTGRES_USER")?,
            pass: maybe_env_var!("POSTGRES_PASSWORD")?,
        };

        Ok(Config {
            connection_type,
            rabbitmq,
            postgres,
        })
    }

    pub(crate) fn queue_name(&self) -> &String {
        match self.connection_type {
            ConnectionType::TextExtraction => &self.rabbitmq.text_queue,
            ConnectionType::ThumbnailGeneration => &self.rabbitmq.thumb_queue,
        }
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

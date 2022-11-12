use anyhow::Result;
use tracing::{debug, debug_span, info};

use crate::{Config, FileInfo, PostgresConnection};

mod image;
mod libreoffice;
pub(self) mod pdf;
mod text;

pub async fn process_message(
    data: &[u8],
    config: &Config,
    pg_conn: &mut PostgresConnection,
) -> Result<()> {
    let processing_file_span = debug_span!("Processing message");
    let _enter = processing_file_span.enter();

    let file_info = FileInfo::try_from(data)?;
    debug!(?file_info, "Received file info");

    let file_path = config.path_for_file(&file_info).await?;

    match file_info.file_type.as_str() {
        filetype if filetype.starts_with("text/") => {
            text::process_text_file(&file_info.id, &file_path, pg_conn).await
        }
        "application/pdf" => pdf::process_pdf(&file_info.id, file_path, pg_conn).await,
        "image/jpeg" | "image/png" => {
            image::process_image(&file_info.id, &file_path, pg_conn).await
        }
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        | "application/msword"
        | "application/vnd.oasis.opendocument.text"
        | "application/vnd.ms-powerpoint"
        | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        | "application/vnd.oasis.opendocument.presentation" => {
            libreoffice::process_using_libreoffice(&file_info.id, &file_path, pg_conn).await
        }
        other => {
            info!("type {} not recognized", other);
            Ok(())
        }
    }
}

pub type PageToStringsMap = nohash_hasher::IntMap<i32, String>;

pub(super) trait Single<T> {
    fn single(value: T) -> Self;
}

impl<T> Single<T> for nohash_hasher::IntMap<i32, String>
where
    T: ToString,
{
    fn single(value: T) -> Self {
        let mut map = Self::default();
        map.insert(0, value.to_string());
        map
    }
}

use std::path::Path;

use anyhow::{Context, Result};
use tokio::{fs::File, io::AsyncReadExt};

use crate::{
    conn::PostgresConnection,
    file_info::FileID,
    process::{PageToStringsMap, Single},
};

/// Only extracts text by reading the file
pub async fn process_text_file(
    file_id: &FileID,
    file_path: &Path,
    pg_conn: &mut PostgresConnection,
) -> Result<()> {
    let mut file_content_bytes = Vec::new();
    File::open(file_path)
        .await
        .context("Opening text file")?
        .read_to_end(&mut file_content_bytes)
        .await
        .context("Reading text file")?;
    let file_content = String::from_utf8_lossy(&file_content_bytes).into_owned();

    let page_contents = PageToStringsMap::single(file_content);

    pg_conn.store_page_contents(file_id, page_contents).await
}

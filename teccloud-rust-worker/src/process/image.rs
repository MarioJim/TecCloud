use std::path::Path;

use anyhow::{Context, Result};

use crate::{
    conn::PostgresConnection,
    file_info::FileID,
    process::{PageToStringsMap, Single},
};

/// Only extracts text using Tesseract
pub async fn process_image(
    file_id: &FileID,
    file_path: &Path,
    pg_conn: &mut PostgresConnection,
) -> Result<()> {
    let page_contents = tesseract::ocr(&file_path.to_string_lossy(), "spa")
        .map(PageToStringsMap::single)
        .context("Calling tesseract")?;

    pg_conn.store_page_contents(file_id, page_contents).await
}

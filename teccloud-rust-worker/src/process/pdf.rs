use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

use anyhow::{Context, Result};
use poppler::Document;
use tokio::process::Command;
use tracing::{debug, error};
use url::Url;

use super::PageToStringsMap;
use crate::{conn::PostgresConnection, file_info::FileID};

pub async fn process_pdf(
    file_id: &FileID,
    file_path: PathBuf,
    pg_conn: &mut PostgresConnection,
) -> Result<()> {
    let file_path_text = Arc::new(file_path);
    let file_path_thumb = file_path_text.clone();

    let maybe_page_contents = tokio::spawn(async move { extract_text(&file_path_text) });
    let maybe_thumbnails = tokio::spawn(async move { generate_thumbnails(&file_path_thumb).await });

    match maybe_page_contents
        .await
        .context("Unable to await text-extracting task")?
    {
        Ok(page_contents) => {
            if let Err(error) = pg_conn.store_page_contents(file_id, page_contents).await {
                error!(?error, "Error storing page contents of PDF");
            }
        }
        Err(error) => error!(?error, "Error extracting text from PDF"),
    };

    match maybe_thumbnails
        .await
        .context("Unable to await thumbnail-generating task")?
    {
        Ok(thumbnails) => {
            if let Err(error) = pg_conn.store_thumbnails(file_id, thumbnails).await {
                error!(?error, "Error storing thumbnails of PDF");
            }
        }
        Err(error) => error!(?error, "Error generating thumbnails from PDF"),
    };

    Ok(())
}

fn extract_text(file_path: &Path) -> Result<PageToStringsMap> {
    let Ok(file_path) = Url::from_file_path(file_path) else {
        anyhow::bail!("Canonicalized file path is not absolute");
    };

    let document = Document::from_file(file_path.as_str(), None)?;
    let page_contents: PageToStringsMap = (0..document.n_pages())
        .filter_map(|page_idx| {
            document
                .page(page_idx)
                .and_then(|page| page.text())
                .map(|text| (page_idx + 1, text.to_string()))
        })
        .collect();

    debug!(
        num_page_contents = page_contents.len(),
        "Extracted text from PDF"
    );

    Ok(page_contents)
}

async fn generate_thumbnails(file_path: &Path) -> Result<PageToStringsMap> {
    let pdftoppm_output = Command::new("pdftoppm")
        .args([
            "-jpeg",
            "-scale-to",
            "400",
            "-forcenum",
            &file_path.to_string_lossy(),
            &file_path.to_string_lossy(),
        ])
        .output()
        .await?;

    if !pdftoppm_output.status.success() {
        anyhow::bail!(format!(
            "pdftoppm exited unsuccessfully:\n{}",
            String::from_utf8_lossy(&pdftoppm_output.stderr)
        ));
    }

    let mut page_idx = 1;
    let mut thumbnail_paths = PageToStringsMap::default();

    loop {
        let thumbnail_name = format!(
            "{}-{}.jpg",
            file_path.file_name().unwrap().to_string_lossy(),
            page_idx
        );
        if !file_path.with_file_name(&thumbnail_name).exists() {
            break;
        }

        thumbnail_paths.insert(page_idx, thumbnail_name);
        page_idx += 1;
    }

    debug!(
        num_thumbnail_paths = thumbnail_paths.len(),
        "Generated thumbnails from PDF"
    );

    Ok(thumbnail_paths)
}

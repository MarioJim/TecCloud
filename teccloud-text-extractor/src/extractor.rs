use std::path::PathBuf;

use anyhow::{Context, Result};
use poppler::Document;
use teccloud_shared_rust::{FileInfo, PageContents};
use tokio::{
    fs::{canonicalize, remove_file, File},
    io::AsyncReadExt,
    process::Command,
};
use tracing::{debug_span, info};

pub async fn extract_text(file_info: &FileInfo) -> Result<PageContents> {
    let extracting_text_span = debug_span!("Extracting text");
    let _enter = extracting_text_span.enter();

    let file_path = canonicalize(format!("./userfiles/{}", file_info.file_id)).await?;

    match file_info.file_type.as_str() {
        filetype if filetype.starts_with("text/") => read_text_file(&file_path)
            .await
            .context("Reading text file"),
        "application/pdf" => {
            let file_path = format!("file://{}", file_path.to_string_lossy());
            let document = Document::from_file(&file_path, None)?;
            let page_contents = (0..document.n_pages())
                .filter_map(|page_idx| {
                    document
                        .page(page_idx)
                        .and_then(|page| page.text())
                        .map(|text| (page_idx, text.to_string()))
                })
                .collect();
            Ok(page_contents)
        }
        "image/jpeg" | "image/png" => tesseract::ocr(&file_path.to_string_lossy(), "spa")
            .map(to_page_contents)
            .context("Calling tesseract"),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        | "application/msword"
        | "application/vnd.oasis.opendocument.text"
        | "application/vnd.ms-powerpoint"
        | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        | "application/vnd.oasis.opendocument.presentation" => {
            let libreoffice_status = Command::new("soffice")
                .args([
                    "--convert-to",
                    "txt:Text",
                    &file_path.to_string_lossy(),
                    "--outdir",
                    &file_path
                        .parent()
                        .context("File is root directory")?
                        .to_string_lossy(),
                ])
                .status()
                .await?;
            if !libreoffice_status.success() {
                anyhow::bail!(
                    "LibreOffice converter exited unsuccessfully on file {}",
                    file_info.file_id
                );
            }

            let output_file_path = file_path.with_extension("txt");
            let result = read_text_file(&output_file_path)
                .await
                .context("Reading output file")?;

            remove_file(output_file_path)
                .await
                .context("Removing output file")?;

            Ok(result)
        }
        other => {
            info!("type {} not recognized", other);
            Ok(PageContents::default())
        }
    }
}

async fn read_text_file(file_path: &PathBuf) -> Result<PageContents> {
    let mut file_content_bytes = Vec::new();
    File::open(file_path)
        .await?
        .read_to_end(&mut file_content_bytes)
        .await?;
    let file_content = String::from_utf8_lossy(&file_content_bytes).into_owned();
    let page_contents = to_page_contents(file_content);
    Ok(page_contents)
}

fn to_page_contents(text: String) -> PageContents {
    let mut page_contents = PageContents::default();
    page_contents.insert(1, text);
    page_contents
}

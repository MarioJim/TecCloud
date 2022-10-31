use std::path::Path;

use anyhow::{Context, Result};
use encoding_rs::WINDOWS_1252;
use poppler::Document;
use teccloud_shared_rust::{FileInfo, PageContents, Single};
use tokio::{
    fs::{canonicalize, remove_file, File},
    io::AsyncReadExt,
    process::Command,
};
use tracing::{debug, debug_span, info, trace};

pub async fn extract_text(file_info: &FileInfo) -> Result<PageContents> {
    let extracting_text_span = debug_span!("Extracting text");
    let _enter = extracting_text_span.enter();

    let file_path = canonicalize(format!("./userfiles/{}", file_info.file_id)).await?;

    match file_info.file_type.as_str() {
        filetype if filetype.starts_with("text/") => extract_from_text(&file_path).await,
        "application/pdf" => extract_from_pdf(&file_path),
        "image/jpeg" | "image/png" => extract_from_image(&file_path),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        | "application/msword"
        | "application/vnd.oasis.opendocument.text"
        | "application/vnd.ms-powerpoint"
        | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        | "application/vnd.oasis.opendocument.presentation" => {
            extract_using_libreoffice(&file_path).await
        }
        other => {
            info!("type {} not recognized", other);
            Ok(PageContents::default())
        }
    }
}

async fn extract_from_text(file_path: &Path) -> Result<PageContents> {
    debug!("Extracting text from text file");
    let mut file_content_bytes = Vec::new();
    File::open(file_path)
        .await
        .context("Opening text file")?
        .read_to_end(&mut file_content_bytes)
        .await
        .context("Reading text file")?;
    let file_content = String::from_utf8_lossy(&file_content_bytes).into_owned();
    Ok(PageContents::single(file_content))
}

fn extract_from_pdf(file_path: &Path) -> Result<PageContents> {
    debug!("Extracting text from PDF");
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

fn extract_from_image(file_path: &Path) -> Result<PageContents> {
    debug!("Extracting text from image");
    tesseract::ocr(&file_path.to_string_lossy(), "spa")
        .map(PageContents::single)
        .context("Calling tesseract")
}

async fn extract_using_libreoffice(file_path: &Path) -> Result<PageContents> {
    debug!("Extracting text using LibreOffice");
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
        anyhow::bail!("LibreOffice converter exited unsuccessfully");
    }
    trace!("Generated output file");

    let output_file_path = file_path.with_extension("txt");
    let mut file_content_bytes = Vec::new();
    File::open(&output_file_path)
        .await
        .context("Opening output file")?
        .read_to_end(&mut file_content_bytes)
        .await
        .context("Reading output file")?;
    let (file_content, _, _) = WINDOWS_1252.decode(&file_content_bytes);
    trace!("Read output file");

    remove_file(output_file_path)
        .await
        .context("Removing output file")?;
    trace!("Removed output file");

    Ok(PageContents::single(file_content))
}

use std::path::Path;

use anyhow::{Context, Result};
use tokio::{fs::remove_file, process::Command};
use tracing::{error, trace};

use crate::{conn::PostgresConnection, file_info::FileID, process::pdf::process_pdf};

/// Generates thumbnails and extracts text by first converting the
/// document to PDF using LibreOffice
pub async fn process_using_libreoffice(
    file_id: &FileID,
    file_path: &Path,
    pg_conn: &mut PostgresConnection,
) -> Result<()> {
    let libreoffice_output = Command::new("soffice")
        .args([
            "--convert-to",
            "pdf",
            &file_path.to_string_lossy(),
            "--outdir",
            &file_path
                .parent()
                .context("File is root directory")?
                .to_string_lossy(),
        ])
        .output()
        .await?;

    if !libreoffice_output.status.success() {
        anyhow::bail!(format!(
            "LibreOffice exited unsuccessfully:\n{}",
            String::from_utf8_lossy(&libreoffice_output.stderr)
        ));
    }
    trace!("Generated output file");

    let output_file_path = file_path.with_extension("pdf");

    let result_of_processing = process_pdf(file_id, output_file_path.clone(), pg_conn).await;

    if let Err(error) = remove_file(output_file_path).await {
        error!(?error, "Error removing file");
    }
    trace!("Removed output file");

    result_of_processing
}

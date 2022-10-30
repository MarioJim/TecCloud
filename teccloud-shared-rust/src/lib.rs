mod config;
pub mod conn;
mod file_info;
mod shutdown_signal;

pub use config::Config;
pub use file_info::FileInfo;
pub use shutdown_signal::ShutdownSignal;

pub type PageContents = nohash_hasher::IntMap<i32, String>;
pub type ThumbnailPaths = nohash_hasher::IntMap<i32, String>;

#[derive(Debug, Clone, Copy)]
pub enum ConnectionType {
    TextExtraction,
    ThumbnailGeneration,
}

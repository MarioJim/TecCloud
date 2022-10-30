use anyhow::{Context, Result};
use lapin::message::Delivery;

#[derive(Debug)]
pub struct FileInfo {
    pub id: i32,
    pub file_id: String,
    pub file_type: String,
}

impl FileInfo {
    pub fn from_delivery(delivery: &Delivery) -> Result<Self> {
        serde_json::from_slice::<'_, serde_json::Value>(&delivery.data)
            .context("Parsing the JSON message")
            .and_then(FileInfo::try_from)
    }
}

impl TryFrom<serde_json::Value> for FileInfo {
    type Error = anyhow::Error;

    fn try_from(value: serde_json::Value) -> Result<Self> {
        let mut map = match value {
            serde_json::Value::Object(map) => map,
            _ => anyhow::bail!("Not a JSON map"),
        };

        let id = match map.remove("id") {
            Some(serde_json::Value::Number(id)) if id.is_i64() => {
                id.as_i64().unwrap().try_into().unwrap()
            }
            Some(_) => anyhow::bail!("Invalid datatype for key 'id'"),
            None => anyhow::bail!("Key 'id' not found"),
        };

        let file_id = match map.remove("fileId") {
            Some(serde_json::Value::String(file_id)) => file_id,
            Some(_) => anyhow::bail!("Invalid datatype for key 'fileId'"),
            None => anyhow::bail!("Key 'fileId' not found"),
        };

        let file_type = match map.remove("fileType") {
            Some(serde_json::Value::String(file_type)) => file_type,
            Some(_) => anyhow::bail!("Invalid datatype for key 'fileType'"),
            None => anyhow::bail!("Key 'fileType' not found"),
        };

        Ok(Self {
            id,
            file_id,
            file_type,
        })
    }
}

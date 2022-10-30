# syntax=docker/dockerfile:1

# builder container
FROM rust:1-slim-bullseye as builder
WORKDIR /teccloud
COPY Cargo.toml Cargo.lock ./
COPY teccloud-shared-rust/ teccloud-shared-rust/
COPY teccloud-text-extractor/ teccloud-text-extractor/
COPY teccloud-thumbnail-generator/ teccloud-thumbnail-generator/
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/root/target \
    cargo build --bin teccloud-thumbnail-generator --release --locked

# runner container
FROM debian:bullseye-slim
WORKDIR /app
RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /teccloud/target/release/teccloud-thumbnail-generator ./
CMD ["./teccloud-thumbnail-generator"]

# syntax=docker/dockerfile:1

# builder container
FROM rust:1-slim-bullseye as builder
RUN apt-get update \
    && apt-get install -y pkg-config libleptonica-dev libtesseract-dev clang libpoppler-glib-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /teccloud
COPY Cargo.toml Cargo.lock ./
COPY teccloud-shared-rust/ teccloud-shared-rust/
COPY teccloud-text-extractor/ teccloud-text-extractor/
COPY teccloud-thumbnail-generator/ teccloud-thumbnail-generator/
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/root/target \
    cargo build --bin teccloud-text-extractor --release --locked

# runner container
FROM debian:bullseye-slim
WORKDIR /app
RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
        default-jre \
        libpoppler-glib8 \
        libreoffice-impress-nogui \
        libreoffice-java-common \
        libreoffice-writer-nogui \
        tesseract-ocr-spa \
        tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /teccloud/target/release/teccloud-text-extractor ./
CMD ["./teccloud-text-extractor"]

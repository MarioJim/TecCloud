# syntax=docker/dockerfile:1

# builder container
FROM rust:1-slim-bullseye as builder
RUN apt-get update \
    && apt-get install -y \
        clang \
        libleptonica-dev \
        libpoppler-glib-dev \
        libtesseract-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/root/target \
    cargo build --release --locked

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
        poppler-utils \
        tesseract-ocr-spa \
        tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/teccloud-rust-worker ./
CMD ["./teccloud-rust-worker"]

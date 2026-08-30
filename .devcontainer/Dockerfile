FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

RUN corepack enable

RUN apt-get update \
  && apt-get install --yes --no-install-recommends pipx \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/home/node/.local/bin:${PATH}"

FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Suppress apt-utils warnings and set stable mirrors
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections && \
    sed -i 's/deb.debian.org/cdn-fastly.deb.debian.org/g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's/deb.debian.org/cdn-fastly.deb.debian.org/g' /etc/apt/sources.list

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    apt-utils \
    libpq5 \
    postgresql-client \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

COPY . /app/

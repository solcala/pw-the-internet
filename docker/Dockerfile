# Pinned to @playwright/test version in package.json — do not use :latest
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

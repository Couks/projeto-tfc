#!/bin/bash

# Deploy script for NestJS backend
set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Run Prisma migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

echo "✅ Database migrations completed"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Application built successfully"

# Start the application
echo "🚀 Starting application..."
npm run start:prod

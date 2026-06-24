#!/bin/bash

echo "=== AIction Build Script ==="
echo ""

echo "1. Building frontend..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build successful"

echo ""
echo "2. Building Rust backend..."
cd src-tauri && cargo build
if [ $? -ne 0 ]; then
    echo "❌ Rust backend build failed"
    exit 1
fi
echo "✅ Rust backend build successful"

echo ""
echo "3. Building Tauri application..."
cd .. && pnpm build:tauri
if [ $? -ne 0 ]; then
    echo "❌ Tauri application build failed"
    exit 1
fi
echo "✅ Tauri application build successful"

echo ""
echo "=== Build Complete ==="
echo "Application built successfully!"
echo ""
echo "To run in development mode:"
echo "  pnpm dev"
echo ""
echo "To build for production:"
echo "  pnpm build:tauri"

#!/bin/bash

echo "Starting The Forge Installation..."
echo "Credit: Built by Jadai Studios (jadai.dev)"

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Node.js not found. Please install Node.js first."
    exit
fi

# Install dependencies
npm install

# Create data directory
mkdir -p data/repos
mkdir -p data/uploads

# Success message
echo "------------------------------------------------"
echo "Installation Complete!"
echo "1. Ensure Ollama is running (ollama serve)"
echo "2. Run 'npm run dev' to start The Forge"
echo "3. Visit http://localhost:3000"
echo "------------------------------------------------"

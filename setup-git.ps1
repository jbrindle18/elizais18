# Git Setup Script for elizais18 repository
# Run this in PowerShell after Git is installed and Cursor is restarted

# Navigate to project directory
cd "C:\Users\joebr\Documents\!Other\Eliza eats pickles"

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Configure git user (if not already configured)
# git config user.name "jbrindle18"
# git config user.email "your-email@example.com"

# Make initial commit
git commit -m "Initial commit - Eliza pickle game"

# Add remote repository
git remote add origin https://github.com/jbrindle18/elizais18.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub (you may need to authenticate)
git push -u origin main

Write-Host "Setup complete! If you get authentication errors, you may need to:"
Write-Host "1. Use GitHub Personal Access Token instead of password"
Write-Host "2. Or use GitHub Desktop for easier authentication"



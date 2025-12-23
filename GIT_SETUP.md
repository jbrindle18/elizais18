# Setting Up Git to Push Directly to GitHub from Cursor

## Step 1: Install Git
1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart Cursor after installation

## Step 2: Initialize Git Repository

Open terminal in Cursor (Ctrl + `) and run:

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit - Eliza pickle game"
```

## Step 3: Connect to GitHub

1. Create a new repository on GitHub.com (don't initialize with README)
2. Copy the repository URL (e.g., https://github.com/yourusername/eliza-pickle-game.git)

Then in terminal:

```bash
# Add GitHub as remote (replace with your URL)
git remote add origin https://github.com/yourusername/eliza-pickle-game.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main" → "/ (root)"
5. Save

Your game will be live at: `https://yourusername.github.io/eliza-pickle-game`

## Step 5: Making Future Changes

After you edit files in Cursor:

```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

Your changes will automatically update on GitHub Pages!

## Using Cursor's Git Integration

Cursor also has built-in Git features:
- Look for the Source Control icon in the left sidebar (looks like a branch)
- You can stage, commit, and push directly from the UI
- No need to use terminal if you prefer the GUI



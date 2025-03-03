#!/bin/bash

# Script to commit and push changes from WSL
# Usage: ./scripts/git-push.sh "Your commit message"

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./scripts/git-push.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Navigate to the project directory
# This assumes the script is run from the project root
# If running from WSL, you'll need to adjust the path
# Example: cd /mnt/c/Users/nadel/Documents/krv-app

# Add all changes
echo "Adding all changes..."
git add .

# Commit changes
echo "Committing changes with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Push changes
echo "Pushing changes to remote repository..."
git push

echo ""
echo "Done!" 
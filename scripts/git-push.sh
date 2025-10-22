#!/bin/bash

# This script automates the process of adding, committing, and pushing code to a Git repository.
# It prompts the user for a commit message and the branch name, and then executes the git commands.

# Prompt the user to enter a commit message
echo "Please enter your commit message:"
read COMMIT_MESSAGE

# Check if the commit message is empty
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "Error: No commit message provided. Aborting."
  exit 1
fi

# Prompt the user to enter the name of the branch to push to
echo "Please enter the name of the branch you want to push to:"
read BRANCH_NAME

# Check if the branch name is empty
if [ -z "$BRANCH_NAME" ]; then
  echo "Error: No branch name provided. Aborting."
  exit 1
fi

# Add all changes to the staging area
echo "Adding all changes..."
git add .

# Commit the changes with the provided message
echo "Committing with message: '$COMMIT_MESSAGE'..."
git commit -m "$COMMIT_MESSAGE"

# Push the committed changes to the remote repository and specified branch
echo "Pushing changes to remote branch '$BRANCH_NAME'..."
git push origin "$BRANCH_NAME"

echo "Success! Your changes have been committed and pushed."

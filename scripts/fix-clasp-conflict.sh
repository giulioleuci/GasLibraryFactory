#!/bin/bash

# Script to fix the "appsscript file already exists" conflict
# This script resolves the conflict by pulling, cleaning, and re-pushing

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if we're in a library directory
if [ ! -f "appsscript.json" ]; then
    print_error "No appsscript.json found in current directory"
    print_info "Please navigate to a library directory first:"
    print_info "  cd GoogleApiWrapper"
    print_info "  cd SheetDBLib"
    print_info "  cd GasResilienceLib"
    print_info "  etc."
    exit 1
fi

if [ ! -f ".clasp.json" ]; then
    print_error "No .clasp.json found - project not created yet"
    print_info "Create the project first with:"
    print_info "  clasp create --type standalone --title \"LibraryName\" --rootDir ."
    exit 1
fi

print_info "=========================================="
print_info "  Fixing Clasp File Conflict"
print_info "=========================================="
echo ""

# Get the library name from directory
LIB_NAME=$(basename "$PWD")
print_info "Library: ${LIB_NAME}"
echo ""

# Step 1: Pull current remote state
print_info "Step 1: Pulling current remote files..."
if clasp pull 2>&1 | tee /tmp/clasp_pull.log; then
    print_success "Remote files pulled"
else
    print_warning "Pull had issues, but continuing..."
fi
echo ""

# Step 2: Check for conflicting files
print_info "Step 2: Checking for file conflicts..."
if [ -f "appsscript" ]; then
    print_warning "Found local file 'appsscript' (without .json extension)"
    print_info "This file is likely causing the conflict"
    print_info "Removing it..."
    rm "appsscript"
    print_success "Removed conflicting 'appsscript' file"
fi

# Check for duplicate appsscript files
APPSSCRIPT_COUNT=$(ls -1 appsscript* 2>/dev/null | wc -l)
if [ "$APPSSCRIPT_COUNT" -gt 1 ]; then
    print_warning "Multiple appsscript files found:"
    ls -1 appsscript*
    print_info "Keeping only appsscript.json..."
    find . -maxdepth 1 -name "appsscript*" ! -name "appsscript.json" -delete
fi
echo ""

# Step 3: Verify .claspignore is correct
print_info "Step 3: Verifying .claspignore configuration..."
if [ ! -f ".claspignore" ]; then
    print_warning ".claspignore not found, creating it..."
    cat > .claspignore << 'EOF'
# README and documentation
README.md
*.md

# Local configuration files
.clasp.json

# Git
.git
.gitignore

# Editors
.vscode
.idea
*.swp
*~

# OS
.DS_Store
Thumbs.db

# Node modules
node_modules
package.json
package-lock.json
EOF
    print_success ".claspignore created"
fi
echo ""

# Step 4: Clean up any .gs files that might conflict
print_info "Step 4: Checking pushed files..."
print_info "Files that will be pushed:"
# Show what files will be pushed (excluding .claspignore patterns)
git ls-files . | grep -v -f .claspignore 2>/dev/null || ls -1 *.gs *.json 2>/dev/null | grep -v "package.json" || true
echo ""

# Step 5: Try push with force
print_info "Step 5: Attempting push with --force flag..."
if clasp push --force; then
    print_success "Push successful!"
    echo ""
    print_info "=========================================="
    print_success "  Conflict Resolved!"
    print_info "=========================================="
    echo ""
    print_info "Next steps:"
    echo "  1. Verify files: clasp open"
    echo "  2. Test your code in the Apps Script editor"
    exit 0
fi

# If --force didn't work, try alternative approach
print_warning "Standard push with --force failed"
echo ""

print_info "Step 6: Attempting alternative fix..."
print_info "This will recreate the project connection..."
echo ""

read -p "Do you want to recreate the project? This won't delete remote files. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cancelled. Try manually deleting the 'appsscript' file from the online editor."
    print_info "Open the project: clasp open"
    print_info "Then delete any file named 'appsscript' (without .json)"
    exit 1
fi

# Backup .clasp.json
cp .clasp.json .clasp.json.backup
print_info "Backed up .clasp.json to .clasp.json.backup"

# Extract script ID
SCRIPT_ID=$(grep -o '"scriptId":"[^"]*' .clasp.json | cut -d'"' -f4)
print_info "Script ID: ${SCRIPT_ID}"

# Remove and recreate .clasp.json
rm .clasp.json
echo "{\"scriptId\":\"${SCRIPT_ID}\",\"rootDir\":\"$(pwd)\"}" > .clasp.json
print_success "Recreated .clasp.json"

# Try push again
print_info "Attempting push again..."
if clasp push --force; then
    print_success "Push successful!"
    rm .clasp.json.backup
else
    print_error "Push still failing"
    print_info "Restoring backup..."
    mv .clasp.json.backup .clasp.json
    echo ""
    print_error "=========================================="
    print_error "  Manual Intervention Required"
    print_error "=========================================="
    echo ""
    print_info "Please try these steps manually:"
    echo ""
    echo "1. Open the project in browser:"
    echo "   clasp open"
    echo ""
    echo "2. In the Apps Script editor:"
    echo "   - Look for a file named 'appsscript' (without .json)"
    echo "   - Delete this file if it exists"
    echo "   - Keep 'appsscript.json'"
    echo ""
    echo "3. Then try pushing again:"
    echo "   clasp push --force"
    echo ""
    exit 1
fi

echo ""
print_info "=========================================="
print_success "  Conflict Resolved!"
print_info "=========================================="
echo ""

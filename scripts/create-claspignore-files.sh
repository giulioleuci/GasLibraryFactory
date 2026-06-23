#!/bin/bash

# Script per creare i file .claspignore per tutte le librerie
# Autore: GasLibraryFactory

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Creazione file .claspignore per tutte le librerie...${NC}"
echo ""

# Template .claspignore
CLASPIGNORE_CONTENT='# README e documentazione
README.md
*.md

# File di configurazione locale
.clasp.json

# Git
.git
.gitignore

# Editor
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
'

# Array delle librerie
LIBRARIES=("GasExpressionEngineLib" "GasResilienceLib" "GoogleApiWrapper" "JobRunnerLib" "SheetDBLib" "WorkspaceTemplateEngine")

# Crea .claspignore per ogni libreria
for lib in "${LIBRARIES[@]}"; do
    if [ -d "$lib" ]; then
        echo "$CLASPIGNORE_CONTENT" > "$lib/.claspignore"
        echo -e "${GREEN}✓ $lib/.claspignore${NC}"
    else
        echo -e "${YELLOW}⚠ Directory $lib non trovata, saltata${NC}"
    fi
done

echo ""
echo -e "${GREEN}File .claspignore creati con successo!${NC}"
echo ""
echo "Questi file impediscono il caricamento di:"
echo "  - File markdown (README.md, docs)"
echo "  - File di configurazione locale (.clasp.json)"
echo "  - Cartelle .git e .vscode"
echo "  - File temporanei e di sistema"
echo ""

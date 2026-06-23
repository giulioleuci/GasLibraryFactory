#!/bin/bash

# Script per aggiornare lo Script ID di GoogleApiWrapper in tutte le librerie dipendenti
# Autore: GasLibraryFactory

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Errore: Script ID mancante${NC}"
    echo ""
    echo "Uso: ./update-library-dependencies.sh <SCRIPT_ID_GOOGLEAPIWRAPPER>"
    echo ""
    echo "Esempio:"
    echo "  ./update-library-dependencies.sh 1aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"
    echo ""
    echo "Come ottenere lo Script ID:"
    echo "  1. cd GoogleApiWrapper"
    echo "  2. clasp open"
    echo "  3. Nell'editor Apps Script: Project Settings > Script ID"
    echo "  oppure"
    echo "  4. cat GoogleApiWrapper/.clasp.json | grep scriptId"
    echo ""
    exit 1
fi

GOOGLE_API_WRAPPER_ID="$1"

echo -e "${BLUE}Aggiornamento dipendenze con Script ID: ${GOOGLE_API_WRAPPER_ID}${NC}"
echo ""

# Verifica che lo Script ID sembri valido
if [[ ! "$GOOGLE_API_WRAPPER_ID" =~ ^[A-Za-z0-9_-]+$ ]]; then
    echo -e "${RED}Errore: Lo Script ID non sembra valido${NC}"
    echo "Formato atteso: lettere, numeri, trattini e underscore"
    exit 1
fi

# Funzione per aggiornare un file
update_file() {
    local file=$1
    local lib_name=$2

    if [ -f "$file" ]; then
        # Usa sed per sostituire il placeholder
        if grep -q "PLACEHOLDER_GOOGLEAPIWRAPPER_ID" "$file"; then
            sed -i "s/PLACEHOLDER_GOOGLEAPIWRAPPER_ID/$GOOGLE_API_WRAPPER_ID/g" "$file"
            echo -e "${GREEN}✓ $lib_name aggiornato${NC}"
        elif grep -q "$GOOGLE_API_WRAPPER_ID" "$file"; then
            echo -e "${YELLOW}⚠ $lib_name già aggiornato${NC}"
        else
            # Sostituisci qualsiasi libraryId esistente
            sed -i "s/\"libraryId\": \"[^\"]*\"/\"libraryId\": \"$GOOGLE_API_WRAPPER_ID\"/g" "$file"
            echo -e "${GREEN}✓ $lib_name aggiornato (libraryId sostituito)${NC}"
        fi
    else
        echo -e "${RED}✗ $lib_name: file non trovato!${NC}"
    fi
}

# Aggiorna JobRunnerLib
update_file "JobRunnerLib/appsscript.json" "JobRunnerLib"

# Aggiorna SheetDBLib
update_file "SheetDBLib/appsscript.json" "SheetDBLib"

# Aggiorna WorkspaceTemplateEngine
update_file "WorkspaceTemplateEngine/appsscript.json" "WorkspaceTemplateEngine"

echo ""
echo -e "${GREEN}Aggiornamento completato!${NC}"
echo ""
echo -e "${YELLOW}Prossimi passi:${NC}"
echo "  1. Verifica le modifiche:"
echo "     grep -A 5 'dependencies' JobRunnerLib/appsscript.json"
echo "     grep -A 5 'dependencies' SheetDBLib/appsscript.json"
echo "     grep -A 5 'dependencies' WorkspaceTemplateEngine/appsscript.json"
echo ""
echo "  2. Esegui clasp push in ogni directory per applicare le modifiche:"
echo "     cd JobRunnerLib && clasp push && cd .."
echo "     cd SheetDBLib && clasp push && cd .."
echo "     cd WorkspaceTemplateEngine && clasp push && cd .."
echo ""

#!/bin/bash

# Script per creare i file appsscript.json per tutte le librerie
# Autore: GasLibraryFactory

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Creazione file appsscript.json per tutte le librerie...${NC}"
echo ""

# GasExpressionEngineLib
cat > GasExpressionEngineLib/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
EOF
echo -e "${GREEN}✓ GasExpressionEngineLib/appsscript.json${NC}"

# GasResilienceLib
cat > GasResilienceLib/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
EOF
echo -e "${GREEN}✓ GasResilienceLib/appsscript.json${NC}"

# GoogleApiWrapper
cat > GoogleApiWrapper/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
EOF
echo -e "${GREEN}✓ GoogleApiWrapper/appsscript.json${NC}"

# JobRunnerLib
cat > JobRunnerLib/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "GoogleApiWrapper",
        "version": "1",
        "libraryId": "PLACEHOLDER_GOOGLEAPIWRAPPER_ID"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
EOF
echo -e "${GREEN}✓ JobRunnerLib/appsscript.json${NC}"

# SheetDBLib
cat > SheetDBLib/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "GoogleApiWrapper",
        "version": "1",
        "libraryId": "PLACEHOLDER_GOOGLEAPIWRAPPER_ID"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
}
EOF
echo -e "${GREEN}✓ SheetDBLib/appsscript.json${NC}"

# WorkspaceTemplateEngine - verifica se esiste già
if [ ! -f "WorkspaceTemplateEngine/appsscript.json" ]; then
    cat > WorkspaceTemplateEngine/appsscript.json << 'EOF'
{
  "timeZone": "Europe/Rome",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "GoogleApiWrapper",
        "version": "1",
        "libraryId": "PLACEHOLDER_GOOGLEAPIWRAPPER_ID"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
  ]
}
EOF
    echo -e "${GREEN}✓ WorkspaceTemplateEngine/appsscript.json${NC}"
else
    echo -e "${YELLOW}⚠ WorkspaceTemplateEngine/appsscript.json già esistente (non modificato)${NC}"
fi

echo ""
echo -e "${GREEN}File appsscript.json creati con successo!${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "Dopo aver pubblicato GoogleApiWrapper come libreria, esegui:"
echo "  ./update-library-dependencies.sh <SCRIPT_ID_GOOGLEAPIWRAPPER>"
echo ""

#!/bin/bash

# Script per creare tutti i progetti Google Apps Script usando clasp
# Autore: GasLibraryFactory
# Descrizione: Automatizza la creazione di tutti e 6 i progetti delle librerie

set -e  # Esci in caso di errore

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
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

# Verifica che clasp sia installato
if ! command -v clasp &> /dev/null; then
    print_error "clasp non è installato. Installalo con: npm install -g @google/clasp"
    exit 1
fi

print_success "clasp è installato"

# Verifica che l'utente sia loggato
if ! clasp login --status &> /dev/null; then
    print_warning "Non sei loggato a clasp. Effettua il login..."
    clasp login
fi

print_success "Sei loggato a clasp"

# Array delle librerie in ordine di creazione (rispettando le dipendenze)
declare -a LIBRARIES=(
    "GoogleApiWrapper"
    "GasExpressionEngineLib"
    "GasResilienceLib"
    "JobRunnerLib"
    "SheetDBLib"
    "WorkspaceTemplateEngine"
)

# Directory base
BASE_DIR=$(pwd)

# Verifica che esistano i file appsscript.json
check_appsscript_files() {
    local missing=0
    for lib in "${LIBRARIES[@]}"; do
        if [ ! -f "${lib}/appsscript.json" ]; then
            print_warning "File appsscript.json mancante per ${lib}"
            missing=1
        fi
    done

    if [ $missing -eq 1 ]; then
        print_warning "Alcuni file appsscript.json sono mancanti"
        print_info "Esecuzione automatica di create-appsscript-configs.sh..."
        if bash "${BASE_DIR}/create-appsscript-configs.sh"; then
            print_success "File appsscript.json creati"
            echo ""
        else
            print_error "Errore nella creazione dei file appsscript.json"
            return 1
        fi
    fi
}

check_appsscript_files

# Verifica che esistano i file .claspignore
check_claspignore_files() {
    local missing=0
    for lib in "${LIBRARIES[@]}"; do
        if [ ! -f "${lib}/.claspignore" ]; then
            missing=1
            break
        fi
    done

    if [ $missing -eq 1 ]; then
        print_info "Creazione file .claspignore..."
        if bash "${BASE_DIR}/create-claspignore-files.sh"; then
            print_success "File .claspignore creati"
            echo ""
        else
            print_error "Errore nella creazione dei file .claspignore"
            return 1
        fi
    fi
}

check_claspignore_files

# Funzione per creare un progetto
create_project() {
    local lib_name=$1
    local lib_dir="${BASE_DIR}/${lib_name}"

    print_info "====================================="
    print_info "Creazione progetto: ${lib_name}"
    print_info "====================================="

    # Verifica che la directory esista
    if [ ! -d "$lib_dir" ]; then
        print_error "Directory non trovata: ${lib_dir}"
        return 1
    fi

    # Entra nella directory
    cd "$lib_dir"

    # Controlla se esiste già un .clasp.json
    if [ -f ".clasp.json" ]; then
        print_warning "Il progetto ${lib_name} esiste già (.clasp.json trovato)"
        read -p "Vuoi sovrascriverlo? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Saltato ${lib_name}"
            cd "$BASE_DIR"
            return 0
        fi
        rm .clasp.json
    fi

    # Crea il progetto
    print_info "Creazione progetto clasp per ${lib_name}..."
    if clasp create --type standalone --title "${lib_name}" --rootDir .; then
        print_success "Progetto creato"
    else
        print_error "Errore nella creazione del progetto ${lib_name}"
        cd "$BASE_DIR"
        return 1
    fi

    # Push dei file
    print_info "Push dei file per ${lib_name}..."
    if clasp push --force; then
        print_success "File caricati con successo"
    else
        print_error "Errore nel push dei file per ${lib_name}"
        cd "$BASE_DIR"
        return 1
    fi

    # Mostra lo Script ID
    if [ -f ".clasp.json" ]; then
        SCRIPT_ID=$(grep -o '"scriptId":"[^"]*' .clasp.json | cut -d'"' -f4)
        print_success "Script ID: ${SCRIPT_ID}"

        # Salva lo Script ID in un file di riepilogo
        echo "${lib_name}: ${SCRIPT_ID}" >> "${BASE_DIR}/script-ids.txt"
    fi

    # Torna alla directory base
    cd "$BASE_DIR"

    echo ""
}

# Banner iniziale
echo ""
print_info "=========================================="
print_info "  Setup Clasp per GasLibraryFactory"
print_info "=========================================="
echo ""
print_warning "Questo script creerà 6 progetti Google Apps Script:"
for lib in "${LIBRARIES[@]}"; do
    echo "  - ${lib}"
done
echo ""
read -p "Vuoi continuare? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Operazione annullata"
    exit 0
fi
echo ""

# Rimuovi il file di riepilogo precedente se esiste
if [ -f "${BASE_DIR}/script-ids.txt" ]; then
    rm "${BASE_DIR}/script-ids.txt"
fi

# Crea tutti i progetti
for lib in "${LIBRARIES[@]}"; do
    create_project "$lib"
done

# Riepilogo finale
echo ""
print_info "=========================================="
print_info "  Riepilogo Script IDs"
print_info "=========================================="
echo ""

if [ -f "${BASE_DIR}/script-ids.txt" ]; then
    cat "${BASE_DIR}/script-ids.txt"
    echo ""
    print_success "Script IDs salvati in: script-ids.txt"
else
    print_warning "Nessuno Script ID generato"
fi

echo ""
print_info "=========================================="
print_info "  Prossimi Passi"
print_info "=========================================="
echo ""
echo "1. Pubblica GoogleApiWrapper come libreria:"
echo "   - Apri il progetto: cd GoogleApiWrapper && clasp open"
echo "   - Deploy > Manage deployments > Create deployment > Library"
echo "   - Copia lo Script ID della libreria"
echo ""
echo "2. Aggiungi GoogleApiWrapper alle librerie dipendenti:"
echo "   - JobRunnerLib"
echo "   - SheetDBLib"
echo "   - WorkspaceTemplateEngine"
echo "   (Editor > Libraries > Add library > Incolla Script ID)"
echo ""
echo "3. Esegui i test per ogni libreria:"
echo "   - Apri il progetto: cd LibraryName && clasp open"
echo "   - Seleziona 'runAllTests' da Tests.gs"
echo "   - Clicca Run e autorizza i permessi"
echo ""
print_success "Setup completato!"
echo ""

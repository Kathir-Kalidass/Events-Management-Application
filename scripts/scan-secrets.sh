#!/bin/bash

# Scan staged changes for potential secrets before commit
# Pattern matches: URIs with credentials, AWS keys, private keys, tokens, passwords

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SECRET_PATTERNS=(
  'mongodb\+srv://[^:]+:[^@]+@'
  'https?://[^:]+:[^@]+@'
  '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----'
  'AKIA[0-9A-Z]{16}'
  'sk-[a-zA-Z0-9]{20,}'
  'ghp_[a-zA-Z0-9]{36}'
  'gho_[a-zA-Z0-9]{36}'
  'ghu_[a-zA-Z0-9]{36}'
  'github_pat_[a-zA-Z0-9]{22,}'
  'xox[baprs]-[0-9a-zA-Z-]{10,}'
  'AIza[0-9A-Za-z_-]{35}'
)

violations=0

while read -r file; do
  [ -z "$file" ] && continue
  [ ! -f "$file" ] && continue

  for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -qP "$pattern" "$file" 2>/dev/null; then
      echo -e "${RED}SECURITY ALERT:${NC} Possible secret found in ${YELLOW}$file${NC}"
      grep -Pn "$pattern" "$file" | while read -r line; do
        echo "  $line" | sed 's/\(.\{40\}\).*/\1.../'
      done
      ((violations++))
    fi
  done
done < <(git diff --cached --name-only --diff-filter=ACM)

if [ "$violations" -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Commit blocked: $violations potential secret(s) detected.${NC}"
  echo -e "${YELLOW}Please remove secrets from the staged files and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ No secrets detected in staged changes${NC}"
exit 0

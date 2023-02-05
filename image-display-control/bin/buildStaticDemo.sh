#!/usr/bin/env bash

# Builds a mobile demo that can directly be shipped to e.g. Netlify as a static
# site.

set -e

if [ "$npm_execpath" = "" ]; then
    echo "Run me with 'npm run buildstaticdemo' instead"
    exit 1
fi

rm -f static-demo.zip
npm run build

zip -r static-demo.zip . -x ".git*" -x ".vscode/*" -x "bin/*" -x "test/*" \
  -x "docs/*" -x "coverage/*"

#!/usr/bin/env bash

# Builds a mobile demo that can directly be shipped to Netlify

rm -f netlify.zip

pushd image-display-control/
npm build
popd

zip -r netlify.zip image-display-control -x "*/.git*" \
  -x "*/.vscode/*" -x "*/bin/*" -x "*/test/*" -x "*/docs/*" -x "*/coverage/*"

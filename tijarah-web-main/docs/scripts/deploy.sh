#!/bin/bash

# Create deployment directory
rm -rf tijarah-web-deploy
mkdir tijarah-web-deploy

# Copy essential files
cp -r .next tijarah-web-deploy/
cp package.json tijarah-web-deploy/
cp package-lock.json tijarah-web-deploy/
cp next.config.js tijarah-web-deploy/
cp -r public tijarah-web-deploy/
cp ecosystem.production.config.js tijarah-web-deploy/

# Create deployment package
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
zip -r "tijarah-web-qa-prod-${TIMESTAMP}.zip" tijarah-web-deploy/

echo "Deployment package created: tijarah-web-qa-prod-${TIMESTAMP}.zip"
echo "Size: $(du -h tijarah-web-qa-prod-${TIMESTAMP}.zip | cut -f1)"

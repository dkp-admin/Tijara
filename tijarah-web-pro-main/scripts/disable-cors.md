# Disable CORS for Development

## Option 1: Chrome with Disabled Security (Windows)
```bash
# Create a shortcut with these flags:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="C:\temp\chrome-dev"
```

## Option 2: Chrome with Disabled Security (Mac)
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

## Option 3: Chrome with Disabled Security (Linux)
```bash
google-chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir="/tmp/chrome-dev"
```

## Option 4: Use CORS Browser Extension
1. Install "CORS Unblock" or "CORS Toggle" extension
2. Enable it when developing locally
3. Disable it for normal browsing

## Option 5: Firefox (about:config)
1. Open `about:config`
2. Set `security.fileuri.strict_origin_policy` to `false`
3. Set `privacy.file_unique_origin` to `false`

**⚠️ Warning: Only use these methods for development. Never browse the internet with disabled security!**

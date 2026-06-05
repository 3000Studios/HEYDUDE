param(
  [string]$ProjectName = "heydude",
  [string]$EnvPath = "C:\Users\Servi\.config\env\global.env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvPath)) {
  throw "global.env not found at $EnvPath"
}

$publicPrefixes = @("VITE_", "NEXT_PUBLIC_")
$publicNames = @(
  "APP_NAME",
  "CONTACT_EMAIL",
  "PUBLIC_SITE_URL",
  "SITE_DOMAIN",
  "SITE_ORIGIN",
  "SITE_URL",
  "STRIPE_PUBLIC",
  "STRIPE_PUBLISHABLE_KEY",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_ID_PROD"
)
$reservedBindingNames = @("AI", "DB", "D1", "KV", "R2", "R2_BUCKET")

$secrets = [ordered]@{}
foreach ($line in Get-Content $EnvPath) {
  if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') { continue }
  $name = $Matches[1].Trim()
  $value = $Matches[2]
  if ([string]::IsNullOrWhiteSpace($value)) { continue }

  $isPublicPrefix = $false
  foreach ($prefix in $publicPrefixes) {
    if ($name.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      $isPublicPrefix = $true
      break
    }
  }
  if ($isPublicPrefix -or ($publicNames -contains $name) -or ($reservedBindingNames -contains $name)) { continue }
  $secrets[$name] = $value
}

if ($secrets.Count -eq 0) {
  Write-Host "No secret-like variables found."
  exit 0
}

$tempFile = Join-Path ([System.IO.Path]::GetTempPath()) ("heydude-pages-secrets-" + [Guid]::NewGuid().ToString("N") + ".json")
try {
  $secrets | ConvertTo-Json -Depth 2 | Set-Content -Path $tempFile -Encoding UTF8
  npx wrangler pages secret bulk $tempFile --project-name $ProjectName
  Write-Host "Uploaded $($secrets.Count) secret-like variable names to Cloudflare Pages project '$ProjectName'."
}
finally {
  Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
}

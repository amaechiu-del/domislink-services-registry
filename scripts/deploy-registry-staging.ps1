[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^https://domislink-sso-registry-staging\.[a-z0-9-]+\.workers\.dev$')]
    [string]$GatewayOrigin,

    [switch]$CreateDatabase,
    [switch]$Deploy
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Push-Location $repo
try {
    $wrangler = Join-Path $repo 'node_modules\.bin\wrangler.cmd'
    if (-not (Test-Path -LiteralPath $wrangler)) {
        throw 'Install the repository dependencies before running this script.'
    }

    function Invoke-Wrangler {
        & $wrangler @args
        if ($LASTEXITCODE -ne 0) {
            throw "Wrangler failed with exit code $LASTEXITCODE."
        }
    }

    $database = 'domislink-services-registry-staging-db'
    $configFile = 'wrangler.staging.local.jsonc'
    if (Test-Path -LiteralPath $configFile) {
        throw "Move the existing $configFile aside before regenerating it."
    }

    $inventory = Invoke-Wrangler d1 list --json | Out-String | ConvertFrom-Json
    $matches = @($inventory | Where-Object { $_.name -eq $database })
    if ($matches.Count -gt 1) {
        throw 'Multiple matching staging databases. Check the Cloudflare account.'
    }
    if ($matches.Count -eq 0) {
        if (-not $CreateDatabase) {
            throw "Missing $database. After confirming the account and plan, rerun with -CreateDatabase."
        }
        Invoke-Wrangler d1 create $database
    }

    $previousOrigin = $env:ONELINK_STAGING_ORIGIN
    try {
        $env:ONELINK_STAGING_ORIGIN = $GatewayOrigin
        & node scripts/prepare-staging.mjs
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not prepare the Registry staging config.'
        }
    } finally {
        $env:ONELINK_STAGING_ORIGIN = $previousOrigin
    }

    if ($Deploy) {
        Invoke-Wrangler d1 migrations apply $database --remote --config $configFile
        Invoke-Wrangler deploy --config $configFile
    } else {
        Invoke-Wrangler deploy --dry-run --config $configFile
    }
} finally {
    Pop-Location
}

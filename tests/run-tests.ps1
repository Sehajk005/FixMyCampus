#!/usr/bin/env pwsh
Write-Host "Running backend tests..."
npm --prefix ..\backend test
$backendExit = $LASTEXITCODE

Write-Host "Running frontend tests..."
npm --prefix ..\frontend test
$frontendExit = $LASTEXITCODE

Write-Host "Running root integration tests..."
npm run test:integration
$integrationExit = $LASTEXITCODE

if ($backendExit -ne 0 -or $frontendExit -ne 0 -or $integrationExit -ne 0) {
    Write-Host "One or more test suites failed. Backend exit: $backendExit, Frontend exit: $frontendExit, Integration exit: $integrationExit"
    exit 1
} else {
    Write-Host "All test suites passed."
    exit 0
}

# עקיפת אימות תעודת SSL לסביבת בדיקות
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Write-Host "1. Checking Pod Status..." -ForegroundColor Cyan
$podStatus = kubectl get pods -l app.kubernetes.io/name=sample-nodejs -n default -o jsonpath='{.items[0].status.phase}'
if ($podStatus -ne "Running") {
    Write-Error "Test Failed: Pod is not Running. Current status: $podStatus"
    exit 1
}
Write-Host "Pod is Running!" -ForegroundColor Green

Write-Host "2. Testing Application Liveness Endpoint (/live)..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock { kubectl port-forward svc/sample-nodejs 8080:8080 -n default }
Start-Sleep -Seconds 3

try {
    # ניסיון פנייה ב-HTTP
    $response = Invoke-RestMethod -Uri "http://localhost:8080/live" -Method Get
    Write-Host "Liveness Check Passed: $response" -ForegroundColor Green
} catch {
    Write-Error "Test Failed: Unable to reach /live endpoint. $_"
    Stop-Job $job; Remove-Job $job
    exit 1
}

# ניקוי ה-Job של ה-Port Forward
Stop-Job $job
Remove-Job $job

Write-Host "E2E Test Passed Successfully!" -ForegroundColor Green
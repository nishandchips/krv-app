Write-Host "Committing road conditions UI improvements..." -ForegroundColor Cyan

# Add the modified files
git add src/components/RoadStatusIndicators.js
git add src/components/ClosuresList.js
git add src/components/cards/RoadClosuresCard.js

# Commit the changes
git commit -m "Fix road conditions UI: align status lights and prevent text truncation"

# Push the changes
git push

Write-Host "Road conditions UI improvements committed and pushed!" -ForegroundColor Green
Write-Host "The changes should be deployed to your site shortly." -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Yellow
Write-Host "1. Fixed vertical alignment of status lights with fixed-height containers" -ForegroundColor White
Write-Host "2. Improved text display in condition boxes with better overflow handling" -ForegroundColor White
Write-Host "3. Increased padding in condition boxes for better readability" -ForegroundColor White
Write-Host "4. Adjusted card spacing to provide more room for content" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
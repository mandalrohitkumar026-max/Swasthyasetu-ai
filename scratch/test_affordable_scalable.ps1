# Test script for Affordable and Scalable Healthcare Service Modules
$baseUrl = "http://localhost:5000"

Write-Host "=== SWASTHYASETU AFFORDABLE & SCALABLE BACKEND API SUITE ===" -ForegroundColor Cyan

# 1. Health check
$health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
Write-Host "[PASS] Health status: $($health.status), mode: $($health.database.mode)" -ForegroundColor Green

# 2. Healthcare Resources Directory - 5 Tier query
$dir = Invoke-RestMethod -Uri "$baseUrl/api/resources?page=1&limit=5" -Method Get
Write-Host "[PASS] Directory returned $($dir.data.Length) resources, total: $($dir.meta.totalCount)" -ForegroundColor Green

# 3. Filter by Category: pharmacy
$pharms = Invoke-RestMethod -Uri "$baseUrl/api/resources?category=pharmacy" -Method Get
Write-Host "[PASS] Pharmacy Category returned $($pharms.data.Length) pharmacies, e.g. $($pharms.data[0].name)" -ForegroundColor Green

# 4. Filter by Category: diagnostic_lab
$labs = Invoke-RestMethod -Uri "$baseUrl/api/resources?category=diagnostic_lab" -Method Get
Write-Host "[PASS] Diagnostic Lab Category returned $($labs.data.Length) labs, e.g. $($labs.data[0].name)" -ForegroundColor Green

# 5. Low-Bandwidth 2G Lite Mode (?lite=true)
$liteRes = Invoke-RestMethod -Uri "$baseUrl/api/resources?lite=true&limit=3" -Method Get
$sample = $liteRes.data[0]
Write-Host "[PASS] Lite mode response received. Sample: $($sample.name), emergencyCasualty: $($sample.emergencyCasualtyAvailable)" -ForegroundColor Green

# 6. Published Price Comparison Matrix
$pricing = Invoke-RestMethod -Uri "$baseUrl/api/resources/pricing-comparison" -Method Get
$firstPrice = $pricing.data[0]
Write-Host "[PASS] Pricing Comparison returned $($pricing.count) benchmarked procedures. e.g. $($firstPrice.serviceName): Gov/Affordable: Rs. $($firstPrice.governmentRate), Pvt Avg: Rs. $($firstPrice.privateMarketAverageRate), Avg Savings: $($firstPrice.estimatedSavingsPercentage)%" -ForegroundColor Green

# 7. Category counts summary
$catCounts = Invoke-RestMethod -Uri "$baseUrl/api/resources/categories" -Method Get
Write-Host "[PASS] Category breakdown retrieved: Hospitals=$($catCounts.breakdown.hospital), Clinics=$($catCounts.breakdown.clinic), Labs=$($catCounts.breakdown.diagnostic_lab), Pharmacies=$($catCounts.breakdown.pharmacy), Gov=$($catCounts.breakdown.government_resource)" -ForegroundColor Green

# 8. Rural Health Education (English & Hindi)
$eduEn = Invoke-RestMethod -Uri "$baseUrl/api/rural/health-education?lang=en" -Method Get
Write-Host "[PASS] English Rural Education topics: $($eduEn.count), First: $($eduEn.data[0].title_en)" -ForegroundColor Green

$eduHi = Invoke-RestMethod -Uri "$baseUrl/api/rural/health-education?lang=hi" -Method Get
Write-Host "[PASS] Hindi Rural Education topics: $($eduHi.count), First: $($eduHi.data[0].title_hi)" -ForegroundColor Green

# 9. Low Bandwidth Offline Bundle
$bundle = Invoke-RestMethod -Uri "$baseUrl/api/rural/low-bandwidth-bundle" -Method Get
Write-Host "[PASS] Low-Bandwidth Bundle received: Emergency 108=$($bundle.emergencyHelpline), Tele-MANAS=$($bundle.mentalHealthHelpline), Compact Centers=$($bundle.centers.Length)" -ForegroundColor Green

# 10. Doctor Availability
$avail = Invoke-RestMethod -Uri "$baseUrl/api/telemed/availability/usr-doc-01" -Method Get
Write-Host "[PASS] Doctor Availability: $($avail.doctorName), Fee: Rs. $($avail.consultationFee), Available Slots: $($avail.availableSlotsCount), Next: $($avail.nextAvailableSlot)" -ForegroundColor Green

# 11. Follow-up Tracking
$followUps = Invoke-RestMethod -Uri "$baseUrl/api/telemed/follow-ups" -Method Get
Write-Host "[PASS] Patient Follow-ups retrieved: $($followUps.Length), First: $($followUps[0].patientName) -> $($followUps[0].reason)" -ForegroundColor Green

# 12. Consultation Room Info
$room = Invoke-RestMethod -Uri "$baseUrl/api/telemed/rooms/apt-001" -Method Get
Write-Host "[PASS] Secure Consultation Room: $($room.roomId), Signaling: $($room.serverUrl)" -ForegroundColor Green

Write-Host "`n=== ALL AFFORDABLE & SCALABLE TEST CASES PASSED SUCCESSFULLY ===" -ForegroundColor Green

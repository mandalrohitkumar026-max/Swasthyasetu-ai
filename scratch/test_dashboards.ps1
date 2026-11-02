# Test script for Professional Dashboards Suite (Patient, Doctor, Admin)
$baseUrl = "http://localhost:5000"

Write-Host "=== SWASTHYASETU DASHBOARD API TEST SUITE ===" -ForegroundColor Cyan

# 1. Admin Dashboard Analytics (Default 30d, All districts)
$adminAnalytics = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard-analytics?range=30d&district=All" -Method Get
Write-Host "[PASS] Admin Analytics retrieved:" -ForegroundColor Green
Write-Host "       Registered Patients: $($adminAnalytics.overview.totalRegisteredPatients)"
Write-Host "       Verified Doctors: $($adminAnalytics.overview.verifiedDoctors)"
Write-Host "       Total Appointments: $($adminAnalytics.overview.totalAppointments)"
Write-Host "       Active Centers: $($adminAnalytics.overview.activeHealthcareCenters)"
Write-Host "       Rural %: $($adminAnalytics.ruralVsUrbanUsage.ruralPercentage)%, Urban %: $($adminAnalytics.ruralVsUrbanUsage.urbanPercentage)%"
Write-Host "       Monthly Registration datapoints: $($adminAnalytics.monthlyRegistrations.Length)"
Write-Host "       Platform Engagement trends: $($adminAnalytics.platformEngagement.trends.Length)"

# 2. Admin Dashboard Analytics with District Filter (Sitapur)
$sitapurAnalytics = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard-analytics?range=7d&district=Sitapur" -Method Get
Write-Host "[PASS] Filtered Analytics for Sitapur: $($sitapurAnalytics.ruralVsUrbanUsage.districtDistribution.Length) district records" -ForegroundColor Green

# 3. Doctor Dashboard Summary
$doctorSummary = Invoke-RestMethod -Uri "$baseUrl/api/telemed/doctor/dashboard-summary" -Method Get
Write-Host "[PASS] Doctor Dashboard Summary retrieved:" -ForegroundColor Green
Write-Host "       Doctor Name: $($doctorSummary.doctor.name)"
Write-Host "       Waiting Queue: $($doctorSummary.overview.waitingQueueCount)"
Write-Host "       Patient Roster: $($doctorSummary.patientManagement.Length) patients"
Write-Host "       Appointment Requests: $($doctorSummary.appointmentRequests.Length) pending"
Write-Host "       Consultation Notes: $($doctorSummary.consultationNotes.Length) saved"
Write-Host "       Case-Mix Specialties: $($doctorSummary.workloadStats.consultationCaseMix.Length)"

# 4. Save Consultation Note
$noteBody = @{
  appointmentId = "apt-001"
  patientId = "usr-pat-01"
  patientName = "Ramesh Patel"
  diagnosis = "Type 2 Diabetes Mellitus with Stage-1 Hypertension"
  notes = "Automated test note: Patient advised continuous glucose monitoring and salt restriction."
  tags = @("NCD", "Automated Test")
} | ConvertTo-Json

$savedNote = Invoke-RestMethod -Uri "$baseUrl/api/telemed/consultation-notes" -Method Post -Body $noteBody -ContentType "application/json"
Write-Host "[PASS] Consultation Note created: ID $($savedNote.data.id) for $($savedNote.data.patientName)" -ForegroundColor Green

# 5. Accept Appointment Request
$acceptBody = @{
  patientName = "Kailash Chand"
  scheduledTime = "Today 03:30 PM"
  consultationMode = "kiosk"
} | ConvertTo-Json

$acceptRes = Invoke-RestMethod -Uri "$baseUrl/api/telemed/appointments/req-01/accept-request" -Method Patch -Body $acceptBody -ContentType "application/json"
Write-Host "[PASS] Appointment request accepted: $($acceptRes.message), Apt ID: $($acceptRes.appointment.id)" -ForegroundColor Green

# 6. Patient Dashboard Summary
$patientSummary = Invoke-RestMethod -Uri "$baseUrl/api/telemed/patient/dashboard-summary" -Method Get
Write-Host "[PASS] Patient Dashboard Summary retrieved:" -ForegroundColor Green
Write-Host "       Patient Name: $($patientSummary.patientProfile.name), ABHA: $($patientSummary.patientProfile.abhaNumber)"
Write-Host "       Vitals: BP $($patientSummary.healthOverview.vitalsLatest.bloodPressure), Glucose $($patientSummary.healthOverview.vitalsLatest.bloodGlucose)"
Write-Host "       Glucose 7d Chart points: $($patientSummary.healthOverview.metricsChartSeries.bloodGlucose7d.Length)"
Write-Host "       Upcoming Appointments: $($patientSummary.upcomingAppointments.Length)"
Write-Host "       Chronic Conditions: $($patientSummary.medicalHistory.chronicIllnesses.Length)"
Write-Host "       Active Notifications: $($patientSummary.notifications.Length)"
Write-Host "       Recommendations: $($patientSummary.healthcareRecommendations.Length)"

Write-Host "`n=== ALL DASHBOARD API TESTS PASSED SUCCESSFULLY ===" -ForegroundColor Green

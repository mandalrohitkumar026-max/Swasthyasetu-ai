export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'AUTHORIZED' | 'DENIED' | 'SUCCESS' | 'REVOKED' | 'ALERT_HIGH' | 'CONNECTED';
  ip: string;
  patientConsentToken?: string;
  details?: string;
}

class AuditService {
  private logs: AuditLogEntry[] = [
    {
      id: 'log-01',
      timestamp: '2026-11-01 10:45:12',
      user: 'Dr. Priya Sharma',
      action: 'VIEW_PATIENT_RECORDS',
      resource: 'ABHA: 14-8921-4321-7654',
      status: 'AUTHORIZED',
      ip: '10.24.1.8',
      patientConsentToken: 'consent-req-001',
      details: 'Longitudinal EHR accessed for teleconsultation review'
    },
    {
      id: 'log-02',
      timestamp: '2026-11-01 10:48:30',
      user: 'Dr. Arvind Rao',
      action: 'DIGITAL_SIGN_PRESCRIPTION',
      resource: 'Prescription: rx-9821',
      status: 'SUCCESS',
      ip: '10.24.1.12',
      details: 'NMC verified cryptographic signature applied'
    },
    {
      id: 'log-03',
      timestamp: '2026-11-01 11:15:02',
      user: 'Admin Desk',
      action: 'VERIFY_DOCTOR',
      resource: 'Doctor: Dr. Vikram Malhotra',
      status: 'AUTHORIZED',
      ip: '10.24.0.5',
      details: 'Credentials validated against National Medical Registry'
    },
    {
      id: 'log-04',
      timestamp: '2026-11-01 11:22:45',
      user: 'Surveillance Engine',
      action: 'OUTBREAK_ALERT_TRIGGERED',
      resource: 'Sitapur Block 2 - Dengue cluster',
      status: 'ALERT_HIGH',
      ip: 'internal-daemon',
      details: 'Spatial cluster of 24 acute pyrexia cases detected'
    }
  ];

  /**
   * Record a security, compliance, or sensitive health record access event
   */
  public log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...entry,
    };

    this.logs.unshift(newEntry);
    
    // Maintain rolling memory buffer (max 1000 in-memory logs)
    if (this.logs.length > 1000) {
      this.logs.pop();
    }

    return newEntry;
  }

  /**
   * Retrieve immutable audit trail
   */
  public getLogs(limit = 50): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }
}

export const auditService = new AuditService();

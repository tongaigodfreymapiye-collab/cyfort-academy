window.CYFORT_LABS = [
  {
    "id": "identity",
    "title": "Identity & Access Incident",
    "category": "Entra ID / IAM",
    "description": "Investigate suspicious sign-in, enforce MFA and document a response.",
    "tasks": [
      {
        "command": "inspect signin",
        "hint": "Review the simulated sign-in log.",
        "points": 15
      },
      {
        "command": "inspect user",
        "hint": "Identify the affected account and risk.",
        "points": 15
      },
      {
        "command": "set mfa enforced",
        "hint": "Apply an MFA enforcement decision.",
        "points": 20
      },
      {
        "command": "revoke sessions",
        "hint": "Revoke active sessions.",
        "points": 20
      },
      {
        "command": "submit finding compromised account",
        "hint": "Record your incident finding.",
        "points": 30
      }
    ],
    "responses": {
      "inspect signin": "2026-10-12 02:17 UTC | user: analyst@cyfort.example | IP: 203.0.113.45 | location: unfamiliar | risk: HIGH | MFA: not satisfied",
      "inspect user": "User: analyst@cyfort.example | privileged: yes | sign-in risk: HIGH | last password change: 64 days ago",
      "set mfa enforced": "POLICY UPDATED (SIMULATED): MFA enforced for affected identity.",
      "revoke sessions": "SESSIONS REVOKED (SIMULATED): active refresh tokens invalidated.",
      "submit finding compromised account": "FINDING ACCEPTED: high-risk sign-in to a privileged account; account compromise suspected."
    }
  },
  {
    "id": "network",
    "title": "Network Defence Lab",
    "category": "SOC / Firewall",
    "description": "Triage a suspicious network connection and create a containment rule.",
    "tasks": [
      {
        "command": "show alerts",
        "hint": "Inspect alerts from the simulated SIEM.",
        "points": 15
      },
      {
        "command": "inspect flow",
        "hint": "Examine the suspicious flow.",
        "points": 20
      },
      {
        "command": "block ip 198.51.100.77",
        "hint": "Contain the malicious source.",
        "points": 25
      },
      {
        "command": "submit finding command and control",
        "hint": "Classify the activity.",
        "points": 20
      },
      {
        "command": "show report",
        "hint": "Generate a short investigation report.",
        "points": 20
      }
    ],
    "responses": {
      "show alerts": "ALERT-104 | Repeated outbound beacons | host: WS-24 | severity: HIGH | dest: 198.51.100.77",
      "inspect flow": "WS-24 -> 198.51.100.77:443 | 60-second periodic interval | 12 sessions | abnormal outbound traffic",
      "block ip 198.51.100.77": "FIREWALL RULE APPLIED (SIMULATED): outbound destination blocked.",
      "submit finding command and control": "FINDING ACCEPTED: suspected command and control beaconing.",
      "show report": "REPORT: Host WS-24 isolated from suspicious destination; escalate for endpoint investigation."
    }
  },
  {
    "id": "vuln",
    "title": "Vulnerability & Risk Assessment",
    "category": "NIST / CVSS",
    "description": "Prioritise an exposed vulnerability and choose a defensible treatment.",
    "tasks": [
      {
        "command": "scan assets",
        "hint": "Discover the affected asset.",
        "points": 15
      },
      {
        "command": "inspect cve",
        "hint": "Read vulnerability evidence.",
        "points": 20
      },
      {
        "command": "assess risk high",
        "hint": "Set the risk rating.",
        "points": 20
      },
      {
        "command": "treat patch",
        "hint": "Choose a risk treatment.",
        "points": 25
      },
      {
        "command": "submit finding internet exposure",
        "hint": "Explain the exposure.",
        "points": 20
      }
    ],
    "responses": {
      "scan assets": "ASSET: WEB-01 | Internet-facing | Business criticality: HIGH | Owner: E-commerce Operations",
      "inspect cve": "TRAINING FINDING: vulnerable web component | CVSS base score: 9.8 | exploitation: plausible | asset exposure: public",
      "assess risk high": "RISK REGISTER UPDATED (SIMULATED): likelihood HIGH; impact HIGH; overall HIGH.",
      "treat patch": "TREATMENT APPROVED (SIMULATED): urgent patch with change-control validation.",
      "submit finding internet exposure": "FINDING ACCEPTED: internet exposure increases likelihood and urgency."
    }
  },
  {
    "id": "cloud",
    "title": "Cloud Misconfiguration Lab",
    "category": "Cloud / Data Protection",
    "description": "Audit a public storage bucket and remediate excessive access.",
    "tasks": [
      {
        "command": "list buckets",
        "hint": "Inspect storage resources.",
        "points": 15
      },
      {
        "command": "inspect policy",
        "hint": "Review public access permissions.",
        "points": 20
      },
      {
        "command": "disable public access",
        "hint": "Remove unauthorised public access.",
        "points": 25
      },
      {
        "command": "enable logging",
        "hint": "Improve detection and auditability.",
        "points": 20
      },
      {
        "command": "submit finding data exposure",
        "hint": "Record the data security finding.",
        "points": 20
      }
    ],
    "responses": {
      "list buckets": "STORAGE: cyfort-training-records | publicAccess: TRUE | encryption: TRUE | logging: FALSE",
      "inspect policy": "POLICY: Principal '*' has object-read access. Contains synthetic customer training records.",
      "disable public access": "ACCESS UPDATED (SIMULATED): public object access disabled.",
      "enable logging": "AUDIT LOGGING ENABLED (SIMULATED): storage read events recorded.",
      "submit finding data exposure": "FINDING ACCEPTED: public object access creates a data exposure risk."
    }
  }
];

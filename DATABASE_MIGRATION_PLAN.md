# Database Migration Plan for HealthBridge Backend

## Current State
The backend currently uses in-memory Maps for data storage:
- `patients` (Map): patientId -> patient record
- `approvals` (Map): patientId -> approval record
- `pharmacyRequests` (Map): requestId -> pharmacy request

## Recommended Database Solution
**SQLite with better-sqlite3** - Lightweight, file-based database perfect for development and small-scale production.

## Migration Steps

### 1. Install Dependencies
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### 2. Create Database Schema
```sql
-- patients table
CREATE TABLE patients (
    patientId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    preferredTime TEXT,
    registeredAt TEXT NOT NULL
);

-- approvals table
CREATE TABLE approvals (
    approvalId TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    icd_code TEXT NOT NULL,
    notes TEXT,
    approvedBy TEXT NOT NULL,
    approvedAt TEXT NOT NULL,
    final_medications TEXT NOT NULL, -- JSON string
    FOREIGN KEY (patientId) REFERENCES patients(patientId)
);

-- pharmacy_requests table
CREATE TABLE pharmacy_requests (
    requestId TEXT PRIMARY KEY,
    pharmacyId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    location TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    medications TEXT NOT NULL, -- JSON string
    deliveryAddress TEXT NOT NULL,
    doctor TEXT NOT NULL,
    status TEXT NOT NULL,
    expectedDelivery TEXT NOT NULL,
    FOREIGN KEY (patientId) REFERENCES patients(patientId)
);
```

### 3. Update server.js
- Import Database from better-sqlite3
- Create database connection and tables on startup
- Replace Map operations with SQL queries
- Add proper error handling and transactions

### 4. Benefits of Migration
- **Persistence**: Data survives server restarts
- **Concurrency**: Proper handling of multiple requests
- **Queries**: Ability to filter, sort, and search data
- **Relationships**: Foreign key constraints ensure data integrity
- **Backup**: Easy to backup the SQLite file

### 5. Future Considerations
- For larger scale: Consider PostgreSQL or MongoDB
- Add database migrations for schema changes
- Implement connection pooling
- Add database indexes for performance
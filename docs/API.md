# API Reference

Documentazione degli endpoint HTTP esposti da Drama Desk (`src/app/api/**`).

## Auth e autorizzazione

- Autenticazione: sessione Supabase in cookie HttpOnly (gestita da `createServerClient` + `requireAuth`).
- Contesto organizzazione: cookie `current-organization` richiesto dagli endpoint tenant-scoped (`requireOrganization`).
- Admin test mode: cookie `admin-session` usato in sviluppo/test per sessione amministrativa simulata.
- Ruoli: al momento molte route usano `requireAuth`/`requireOrganization`; la validazione di ruolo fine-grained non e' applicata in tutti i route handler.

## Convenzioni risposta

- Error payload standard: `{ "error": "..." }`
- Paginazione standard (dove presente):
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 0
}
```

## Endpoint Catalog

| Method | Path | Auth | Role required | Notes |
|---|---|---|---|---|
| GET | `/api/test` | No | None | Health/test endpoint |
| POST | `/api/auth/signout` | Yes | None | Logout + clear cookies |
| GET | `/api/profile` | Yes (`requireAuth`) | None | Current user + profile |
| PUT | `/api/profile` | Yes (`requireAuth`) | None | Update auth user and `user_profiles` |
| POST | `/api/organization/set-current` | No hard check | None | Set `current-organization` cookie |
| GET | `/api/organizations` | Yes (`requireAuth`) | None | List organizations |
| POST | `/api/organizations` | Yes (`requireAuth`) | None | Create organization |
| GET | `/api/organizations/{id}` | Yes (`requireAuth`) | None | Organization detail |
| PUT | `/api/organizations/{id}` | Yes (`requireAuth`) | None | Update organization |
| DELETE | `/api/organizations/{id}` | Yes (`requireAuth`) | None | Delete organization |
| GET | `/api/organizations/members` | Yes (`requireOrganization`) | None | Members of current organization |
| GET | `/api/dashboard` | Yes (`requireOrganization`) | None | Tenant dashboard stats (currently static) |
| GET | `/api/calendar/events` | Yes (`requireOrganization`) | None | Calendar events from classes + shows |
| GET | `/api/students` | Yes (`requireOrganization`) | None | Students list with filters |
| POST | `/api/students` | Yes (`requireOrganization`) | None | Create student |
| GET | `/api/students/{id}` | Yes (`requireOrganization`) | None | Student detail |
| PUT | `/api/students/{id}` | Yes (`requireOrganization`) | None | Update student |
| DELETE | `/api/students/{id}` | Yes (`requireOrganization`) | None | Delete student |
| GET | `/api/students/{id}/classes` | Yes (`requireOrganization`) | None | Class IDs where student is active |
| PUT | `/api/students/{id}/classes` | Yes (`requireOrganization`) | None | Replace student-class assignments |
| GET | `/api/classes` | Yes (`requireOrganization`) | None | Classes list with filters |
| POST | `/api/classes` | Yes (`requireOrganization`) | None | Create class |
| GET | `/api/classes/{id}` | Yes (`requireOrganization`) | None | Class detail (with teacher) |
| PUT | `/api/classes/{id}` | Yes (`requireOrganization`) | None | Update class |
| DELETE | `/api/classes/{id}` | Yes (`requireOrganization`) | None | Delete class |
| GET | `/api/shows` | Yes (`requireOrganization`) | None | Shows list with filters |
| POST | `/api/shows` | Yes (`requireOrganization`) | None | Create show (+ optional staff assignments) |
| GET | `/api/shows/{id}` | Yes (`requireOrganization`) | None | Show detail (+ staff assignments) |
| PUT | `/api/shows/{id}` | Yes (`requireOrganization`) | None | Update show (+ optional staff assignments replacement) |
| DELETE | `/api/shows/{id}` | Yes (`requireOrganization`) | None | Delete show |
| GET | `/api/staff` | Yes (`requireOrganization`) | None | Staff list |
| POST | `/api/staff` | Yes (`requireOrganization`) | None | Create staff member |
| GET | `/api/staff/{id}` | Yes (`requireOrganization`) | None | Staff detail |
| PUT | `/api/staff/{id}` | Yes (`requireOrganization`) | None | Update staff member |
| DELETE | `/api/staff/{id}` | Yes (`requireOrganization`) | None | Delete staff member |
| GET | `/api/admin/dashboard` | Yes (`requireAuth`) | Intended admin | **WIP**: currently returns mock data |
| GET | `/api/admin/users` | Yes (`requireAuth`) | Intended admin | Returns organization memberships + profiles |
| GET | `/api/admin/invitations` | Yes (`requireAuth`) | Intended admin | Pending invitations (`joined_at is null`) |
| GET | `/api/admin/organizations` | Yes (`requireAuth`) | Intended admin | Organizations with member/admin counts |

## Request/Response Examples

### Create student

`POST /api/students`

```json
{
  "organizationId": "678e4de7-c20f-4fdf-8152-8a3442dc6c0d",
  "firstName": "Giulia",
  "lastName": "Bianchi",
  "email": "giulia@example.com",
  "phone": "+39 3330000000",
  "dateOfBirth": "2010-03-12",
  "gradeLevel": "Intermedio",
  "notes": "Allergia a polvere scenica"
}
```

`201 Created`

```json
{
  "id": "6f2bc8b7-6a65-4f2f-8b2a-c6f9f3e1f001",
  "organizationId": "678e4de7-c20f-4fdf-8152-8a3442dc6c0d",
  "firstName": "Giulia",
  "lastName": "Bianchi",
  "email": "giulia@example.com",
  "isActive": true,
  "createdAt": "2026-02-10T10:00:00.000Z"
}
```

### Replace student classes

`PUT /api/students/{id}/classes`

```json
{
  "classIds": [
    "61a6a88b-e693-4f36-94da-f7f5e4f9f010",
    "cc12897d-c3f1-499f-bf70-c9f0c4244c39"
  ]
}
```

`200 OK`

```json
{
  "success": true
}
```

### Create class

`POST /api/classes`

```json
{
  "organizationId": "678e4de7-c20f-4fdf-8152-8a3442dc6c0d",
  "name": "Recitazione avanzata",
  "description": "Tecnica e improvvisazione",
  "teacherId": "82d2f5fa-b2f2-4627-b536-4d2ac8bcafe7",
  "maxStudents": 18,
  "schedule": {
    "days": ["monday", "wednesday"],
    "startTime": "18:30",
    "endTime": "20:00",
    "timezone": "Europe/Rome"
  },
  "startDate": "2026-03-01",
  "endDate": "2026-06-30"
}
```

### Create show with staff assignments

`POST /api/shows`

```json
{
  "organizationId": "678e4de7-c20f-4fdf-8152-8a3442dc6c0d",
  "title": "Sogno di una notte di mezza estate",
  "description": "Produzione estiva",
  "startDate": "2026-07-10",
  "endDate": "2026-07-12",
  "status": "planning",
  "staffAssignments": [
    {
      "staffMemberId": "f7709c1b-a9db-4fd4-b9f9-b72eaed8f58b",
      "role": "regista",
      "notes": "Supervisione generale"
    },
    {
      "staffMemberId": "4f08ba03-e6c2-4d38-8f66-f754566f8c6a",
      "role": "tecnico"
    }
  ]
}
```

### Calendar events

`GET /api/calendar/events?month=2&year=2026`

`200 OK`

```json
[
  {
    "id": "class-61a6a88b-e693-4f36-94da-f7f5e4f9f010-2026-02-09",
    "title": "Recitazione avanzata",
    "type": "class",
    "date": "2026-02-09",
    "startTime": "18:30"
  },
  {
    "id": "show-a2c43e53-91f7-4ea9-b4f4-3d4aaf2df4ce-2026-02-10",
    "title": "Sogno di una notte di mezza estate",
    "type": "show",
    "date": "2026-02-10"
  }
]
```

### Admin dashboard (WIP)

`GET /api/admin/dashboard`

`200 OK` (mock)

```json
{
  "totalOrganizations": 5,
  "totalUsers": 23,
  "pendingInvitations": 2,
  "activeSessions": 8,
  "recentActivity": [
    {
      "id": "1",
      "action": "Organization Created",
      "details": "Springfield Community Theatre",
      "user": "admin@drama-desk.com",
      "timestamp": "2/10/2026, 11:20:00"
    }
  ]
}
```

## WIP / TODO

- `/api/admin/dashboard`: dati mock hardcoded, da sostituire con query reali.
- Enforcement ruoli admin non centralizzato su tutte le route `/api/admin/*`.
- `/api/dashboard`: payload statico (placeholder) invece di metriche reali.
- Endpoint `/api/test`: utile solo per debug/smoke, non pensato per produzione.

# DHSGSU EventHub 🏛️
### Centralized University Event Management Platform
**Dr. Harisingh Gour Vishwavidyalaya (DHSGSU), Sagar, Madhya Pradesh**  
*“Discover. Register. Participate.”*

Official University Portal Reference: [https://www.dhsgsu.edu.in/index.php/en/](https://www.dhsgsu.edu.in/index.php/en/)

---

## 📌 Project Overview
**DHSGSU EventHub** is a modern, responsive, full-stack university event management web application engineered for **Dr. Harisingh Gour Vishwavidyalaya (DHSGSU)**, Sagar (M.P.), an 'A' grade NAAC accredited Central University established in 1946 by Dr. Sir Hari Singh Gour.

The platform provides an end-to-end digital lifecycle for university activities—including national seminars, technical hackathons, athletic meets, academic workshops, and cultural fests such as the landmark **AIU Inter-University Central Zone Youth Festival “Gour Gourav Utsav”**.

---

## ✨ Key Features & User Roles (RBAC)

### 🎓 1. Student Portal
- **Profile & Discovery**: Personalized dashboard displaying enrollment details, course, department, and semester.
- **Search & Filters**: Multi-criteria search by title, department, guest speaker, venue, and category.
- **Interactive Calendar**: Monthly schedule view with category color-coded event markers.
- **Online Registration**: Instant registration with capacity validation, deadline enforcement, and duplicate checks.
- **Unique Registration Pass**: Generates unique `DHSGSU-EVT-2026-XXXX` registration IDs and high-resolution optical QR Codes.
- **“My Events” Dashboard**: Filter events by `Upcoming`, `Completed`, and `Cancelled`.
- **Digital Certificate Claim**: Instant retrieval and download of verified participation certificates post-attendance verification.
- **Event Reminders & Notifications**: Real-time notifications for registration confirmations, venue changes, and certificates.

### 📋 2. Organizer Desk
- **Analytics Dashboard**: Live metric counters and Recharts visualizations for registrations, attendance percentage, and category breakdown.
- **Event Creation & Management**: Comprehensive wizard to draft, schedule, set deadlines, enforce max capacity, and customize event rules.
- **Real-time QR Attendance Scanner**: Built-in scanner with optical decoding and instant test-code simulation.
  - Automatically records Student ID, Event ID, Check-in timestamp, and Organizer ID.
  - **Strict Duplicate Check Guard**: Prevents duplicate attendance by alerting organizers if a student is already marked present with their exact check-in time.
- **Participant Registry**: Filterable participant list with one-click **CSV/Excel export**.
- **Broadcast Announcements**: Send targeted notifications to registered participants or all students.

### 🛡️ 3. Administrative Control Panel
- **Institutional Governance**: Full visibility into university-wide metrics (Students, Faculty Organizers, Events, Attendance, Certificates).
- **Event Sanction Queue**: 1-click administrative approval workflow to review and publish department-submitted events.
- **Role-Based Access Control (RBAC)**: Manage user roles across Student, Organizer, and Admin tiers.
- **Audit Logs**: Immutable chronological trail tracking registrations, attendance scans, approvals, and announcements.

### 📜 4. Digital Certificate Verification System
- **Official E-Certificates**: High-resolution printable certificates with the university seal, signature placeholders, student enrollment, and verification QR code.
- **Public Verification Endpoint**: Direct verification at `/verify-certificate/[certificateId]`, allowing anyone to authenticate genuine credentials from DHSGSU's digital registry.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Data Visualization** | Recharts (Registrations, Attendance %, Category distribution) |
| **QR Code Engine** | `qrcode.react` (High-density SVG badges) |
| **Backend & APIs** | Next.js App Router Route Handlers (`/api/...`) |
| **ORM & Database** | Prisma ORM with SQLite (`file:./dev.db`) for zero-config portable run; 100% PostgreSQL ready |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` password hashing, HTTP-only session cookies |

---

## ⚡ Quick Demo Accounts

For immediate evaluation across all 3 user roles, preset demo accounts are pre-seeded:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@dhsgsu.edu.in` | `Student@123` | Aditya Verma (B.Tech CSE, U22CS045) |
| **Organizer** | `organizer@dhsgsu.edu.in` | `Organizer@123` | Dr. Rajesh K. Sahu (Dept. of CS & Applications) |
| **Admin** | `admin@dhsgsu.edu.in` | `Admin@123` | Prof. Arvind Sharma (Dean, Student Welfare) |

> 💡 **Tip**: Use the **“Quick Role Switcher”** in the top navigation bar or login screen for instant 1-click evaluation without retyping credentials.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd event
npm install
```

### 2. Database Setup & Seeding
Push the Prisma schema to generate the database and seed realistic DHSGSU events:
```bash
# Push schema to SQLite database (dev.db)
npm run prisma:push

# Seed authentic DHSGSU departments, events, and accounts
npm run seed
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
model User {
  id               String         @id @default(uuid())
  name             String
  email            String         @unique
  passwordHash     String
  role             String         @default("STUDENT") // STUDENT, ORGANIZER, ADMIN
  enrollmentNumber String?        @unique
  course           String?
  department       String?
  semester         String?
  phone            String?
  organizedEvents  Event[]        @relation("OrganizerEvents")
  registrations    Registration[]
  attendance       Attendance[]   @relation("StudentAttendance")
  certificates     Certificate[]
  notifications    Notification[]
  auditLogs        AuditLog[]
}

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  school      String
  description String?
  events      Event[]
}

model Event {
  id                   String         @id @default(uuid())
  title                String
  description          String
  category             String         // Academic, Technical, Cultural, Sports, Student Activities
  subCategory          String?
  departmentId         String
  organizerId          String
  venue                String
  eventDate            String
  startTime            String
  endTime              String
  registrationDeadline String
  maxParticipants      Int            @default(100)
  eligibility          String?
  rules                String?
  speakerGuest         String?
  posterUrl            String?
  status               String         @default("PUBLISHED") // DRAFT, PENDING_APPROVAL, PUBLISHED, COMPLETED
  isPast               Boolean        @default(false)
  registrations        Registration[]
  attendance           Attendance[]
  certificates         Certificate[]
}

model Registration {
  id             String       @id @default(uuid())
  eventId        String
  studentId      String
  registrationId String       @unique // e.g. DHSGSU-EVT-2026-0001
  qrCode         String
  status         String       @default("CONFIRMED")
  registeredAt   DateTime     @default(now())
  attendance     Attendance[]
}

model Attendance {
  id             String   @id @default(uuid())
  eventId        String
  studentId      String
  registrationId String
  checkInTime    DateTime @default(now())
  status         String   @default("PRESENT")
  markedBy       String
}

model Certificate {
  id            String   @id @default(uuid())
  eventId       String
  studentId     String
  certificateId String   @unique // e.g. DHSGSU-CERT-2026-0001
  issuedAt      DateTime @default(now())
}
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login`: Authenticate email and password; generates JWT session cookie.
- `POST /api/auth/register`: Create student or organizer account.
- `GET /api/auth/me`: Retrieve currently logged-in user profile.
- `POST /api/auth/me`: Logout and clear session cookie.

### Events
- `GET /api/events`: Query events with full-text search, category, timeframe, department, and sorting.
- `POST /api/events`: Create new event (Requires `ORGANIZER` or `ADMIN`).
- `GET /api/events/[id]`: Detailed event view with organizer, rules, and seat count.
- `PUT /api/events/[id]`: Update event details or change event status.
- `DELETE /api/events/[id]`: Delete event.

### Registrations & Attendance
- `POST /api/registrations`: Register student for event with unique `DHSGSU-EVT-2026-XXXX` ID and QR code payload.
- `GET /api/registrations`: Fetch student registrations or event participant list.
- `DELETE /api/registrations/[id]`: Cancel confirmed registration.
- `POST /api/attendance`: Verify QR scan, check against duplicate attendance, and mark present.
- `GET /api/attendance?eventId=...&format=csv`: Export event attendance report as CSV.

### Certificates & Verification
- `GET /api/certificates`: List student's earned certificates.
- `POST /api/certificates`: Claim / issue digital certificate post-attendance.
- `GET /api/certificates/[id]`: **Public verification API** returning authenticity status, student details, and event information.

### Notifications & Admin
- `GET /api/notifications`: Fetch user notifications.
- `POST /api/notifications`: Broadcast announcements to participants or all students.
- `PATCH /api/notifications`: Mark notification as read.
- `GET /api/admin`: Retrieve university analytics, pending event approvals, and audit logs.
- `POST /api/admin`: Approve/reject event or update user roles.

---

## 🏛️ University Information Note
All institutional references (Patharia Hills Campus, School of Applied Sciences, School of Pharmaceutical Sciences, AIU Central Zone Youth Festival Gour Gourav Utsav, and Dr. Sir Hari Singh Gour legacy) strictly correspond to publicly available data on the official DHSGSU website ([www.dhsgsu.edu.in](https://www.dhsgsu.edu.in)).

---

## 📄 License
Dr. Harisingh Gour Vishwavidyalaya, Sagar (M.P.) • Department of Computer Science & Applications.
All rights reserved.

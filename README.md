# PayrollPro — Payroll Management System

A comprehensive, role-based payroll management system built with React and Supabase. Designed for organizations to manage employees, track attendance, handle leave requests, process payroll, and generate payslips — all from a single, intuitive dashboard.

---

## Features

### Role-Based Access Control
Three distinct user roles — **Admin**, **Manager**, and **Employee** — each with tailored views and permissions enforced at both the UI and database (RLS) level.

| Capability | Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard analytics & charts | ✅ | ✅ | ✅ |
| Manage employees (CRUD) | ✅ | View only | — |
| Mark & view attendance | ✅ | ✅ | ✅ |
| Apply for leave | ✅ | ✅ | ✅ |
| Approve / reject leave | ✅ | ✅ (employees only) | — |
| Generate & manage payroll | ✅ | — | — |
| View payslips & salary history | ✅ | ✅ | ✅ |
| Manage departments | ✅ | View only | View only |
| View profile & leave stats | ✅ | ✅ | ✅ |

### Modules

- **Dashboard** — Admin: stat cards, department salary bar chart, payroll trend line chart, pending leave requests, today's attendance. Employee/Manager: attendance %, leave days taken, salary overview, recent payslips with personal attendance chart.
- **Employee Management** — Full CRUD with department assignment, salary, joining date, and role management.
- **Attendance Tracking** — Mark daily attendance (Present, Absent, Half Day, Holiday), view history with date-range filters, and export-ready data.
- **Leave Management** — Apply for leave with date range and reason, cancel pending requests, approve/reject workflow with "Decided By" tracking.
- **Payroll Processing** — Generate monthly payroll per employee, salary breakdown (basic + bonus − deductions), view/filter records by month, and downloadable PDF payslips.
- **Departments** — Department listing with employee count, total salary, and average salary analytics.
- **Profile** — Personal employee details, attendance percentage, and leave statistics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) with [Vite](https://vite.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row-Level Security) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Linting** | [ESLint 10](https://eslint.org/) |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Badge.jsx        # Status badges with color variants
│   ├── Button.jsx       # Primary, secondary, danger button variants
│   ├── Card.jsx         # Content container card
│   ├── Modal.jsx        # Overlay dialog
│   ├── Payslip.jsx      # Payslip viewer with PDF export
│   ├── ProtectedRoute.jsx  # Auth-guarded route wrapper
│   ├── SkeletonCard.jsx # Loading placeholder
│   ├── Table.jsx        # Sortable data table
│   └── Toast.jsx        # Notification toasts
├── hooks/               # Custom React hooks
│   ├── AuthContext.js   # Auth context definition
│   ├── AuthProvider.jsx # Session + role provider
│   └── useAuth.jsx      # Auth consumer hook
├── layouts/
│   └── DashboardLayout.jsx  # Sidebar navigation layout
├── pages/               # Route-level page components
│   ├── Dashboard.jsx    # Admin & employee dashboards
│   ├── Employees.jsx    # Employee CRUD management
│   ├── Attendance.jsx   # Attendance marking & history
│   ├── Leaves.jsx       # Leave application & approval
│   ├── Payroll.jsx      # Payroll generation & payslips
│   ├── Departments.jsx  # Department overview
│   ├── Profile.jsx      # Employee profile & stats
│   └── Login.jsx        # Authentication page
├── services/            # Supabase API layer
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── employeeService.js
│   ├── attendanceService.js
│   ├── leaveService.js
│   ├── payrollService.js
│   ├── departmentService.js
│   └── dashboardService.js
└── utils/
    └── dateHelpers.js   # Date & currency formatting utilities
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Supabase](https://supabase.com/) project with the required tables and RLS policies

### Installation

```bash
# Clone the repository
git clone https://github.com/Akshit-08/Payroll-Management-System.git
cd Payroll-Management-System/payroll-system

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `payroll-system` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Database Schema

The application relies on the following Supabase tables and views:

### Tables

| Table | Description |
|---|---|
| `users` | Auth-to-employee mapping with role assignment |
| `employees` | Employee records (name, email, role, salary, department) |
| `attendance` | Daily attendance records with status and working hours |
| `leave_requests` | Leave applications with approval workflow |
| `payroll` | Monthly payroll records with salary breakdown |
| `departments` | Department definitions |

### Views

| View | Description |
|---|---|
| `employee_leave_stats` | Aggregated leave statistics per employee |
| `attendance_summary` | Attendance percentage and counts per employee |
| `payroll_summary` | Monthly payroll totals and employee counts |

### Row-Level Security

All tables are protected with Supabase RLS policies that enforce role-based access:
- **Admin** — Full read/write access across all tables
- **Manager** — Read access to employee data, approve/reject employee leaves, manage own records
- **Employee** — Read/write access to own records only

---

## License

This project is developed as part of an internship program.

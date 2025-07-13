# Frontend Modules Structure

This directory contains all the frontend modules for the Events Management Application. Each module corresponds to a backend module and contains its own components, pages, services, and utilities.

## Module Structure

```
modules/
├── module1-student-od/          # Student OD Request and Approval
├── module2-student-internship/  # Student Internship Management
├── module3-faculty-od/          # Faculty OD Request and Approval
├── module4-events/              # Events Conducted by Department (CURRENT)
├── module5-facility-booking/    # Facility Booking System
├── module6-timetable/           # Timetable and Workload
├── module7-feedback/            # Student Course Feedback & Grievances
├── module8-project-review/      # Project Review System
├── module9-pgcs/                # PG CS Examination Management
├── module10-purchase/           # Purchase Committee & Claims
└── shared/                      # Shared components and utilities
```

## Integration Guidelines

1. Each module should export its components, pages, and services
2. Use the shared directory for common components and utilities
3. Follow the established component naming conventions
4. Maintain consistent styling and UX patterns across modules
5. Use React Router for navigation between modules
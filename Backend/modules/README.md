# Backend Modules Structure

This directory contains all the modules for the Events Management Application. Each module is self-contained with its own models, controllers, routes, and services.

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
└── shared/                      # Shared utilities and middleware
```

## Integration Guidelines

1. Each module should export its routes, models, and services
2. Use the shared directory for common utilities
3. Follow the established naming conventions
4. Maintain consistent error handling across modules
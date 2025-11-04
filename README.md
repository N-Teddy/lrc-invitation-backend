# Church Children Activities Management System - Backend

A comprehensive backend system for managing church children activities, built with NestJS, PostgreSQL, and TypeORM.

## Features

- **User Management**: Dev, Super Monitor, and Monitor roles
- **Child Registration**: Track children with age-based grouping
- **Activity Management**: Create and manage services, recreational activities, and conferences
- **Participant List Generation**: Automated generation based on eligibility rules
- **Attendance Tracking**: Support for both child and parent/guardian attendance
- **Age Promotion**: Automatic eligibility for higher age groups based on birthday proximity
- **Conference Prerequisites**: Enforce service attendance requirements
- **Monitor Contributions**: Track annual contributions with installment support
- **Notifications**: Email and WhatsApp notifications for participant lists
- **Automated Scheduling**: Cron jobs for participant list generation and reminders
- **Multi-Town Support**: Manage activities across Yaounde, Douala, and Edea

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd church-activities-backend
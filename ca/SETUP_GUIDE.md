# 🏛️ Civic Complaints Management System - Setup Guide

This is a comprehensive civic complaints management platform with separate citizen and admin applications.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- pnpm
- Docker & Docker Compose
- PostgreSQL (via Docker)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database
```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 3. Seed Mock Data
```bash
# Populate database with sample data
pnpm db:seed
```

### 4. Start Applications
```bash
# Start all applications in development mode
pnpm dev
```

This will start:
- **Citizen App**: http://localhost:3000
- **Admin App**: http://localhost:3001

## 📋 Mock Data & Login Credentials

After running `pnpm db:seed`, you'll have:

### 🔐 Login Credentials

**System Administrator**
- Email: `admin@civic.gov`
- Password: `password123`
- Access: Full system control, all admin features

**Officer (Sample)**
- Email: `john.smith@civic.gov`
- Password: `password123`
- Department: Public Works
- Access: Assignment management, complaint handling

**Citizen (Sample)**
- Email: `alice.cooper@email.com`
- Password: `password123`
- Access: Submit and track complaints

### 📊 Sample Data Includes
- **Users**: 1 admin + 8 officers + 10 citizens
- **Complaints**: 50+ sample complaints across all categories
- **Assignments**: ~30 assignments to various officers
- **Comments**: System-generated responses on complaints

## 🏗️ System Architecture

### Applications
```
ca/
├── apps/
│   ├── web/          # Citizen Portal (localhost:3000)
│   └── admin/        # Admin Dashboard (localhost:3001)
├── packages/
│   ├── db/           # Shared Prisma database
│   └── ui/           # Shared UI components
└── scripts/
    └── seed-mock-data.ts  # Mock data generator
```

### User Roles & Permissions

#### 🔧 System Administrator (`admin`)
- **Full Access**: All system features and settings
- **User Management**: Create/manage officers and citizens
- **System Settings**: Configure system-wide parameters
- **Reports**: Access all analytics and reports
- **Officer Management**: Assign/reassign complaints
- **Department Oversight**: Monitor all departments

#### 👮 Officer (`officer`)
- **Assignment Management**: View and handle assigned complaints
- **Complaint Updates**: Update status, add comments
- **Department View**: See complaints in their department
- **Field Reports**: Submit progress updates
- **Limited Admin**: Cannot access system settings or user management

#### 👤 Citizen (`citizen`)
- **Submit Complaints**: Create new civic complaints
- **Track Progress**: Monitor status of their complaints
- **Add Comments**: Communicate with assigned officers
- **View History**: Access their complaint history

## 🌟 Key Features

### Citizen Portal Features
- 📝 Submit complaints with photos and location
- 📍 Interactive area/landmark selection
- 📊 Track complaint status in real-time
- 💬 Communicate with assigned officers
- 📱 Mobile-friendly responsive design

### Admin Dashboard Features
- 📈 Comprehensive analytics and reporting
- 👥 User management (officers and citizens)
- 🎯 Complaint assignment and tracking
- 🏢 Department management
- ⚙️ System settings and configuration
- 📊 Performance metrics and insights

## 🔧 Development Commands

```bash
# Database commands
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes
pnpm db:migrate     # Create and run migrations
pnpm db:seed        # Populate with mock data

# Development
pnpm dev            # Start all apps in dev mode
pnpm build          # Build all applications
pnpm lint           # Run linting across workspace

# Individual app development
cd apps/web && pnpm dev      # Citizen app only
cd apps/admin && pnpm dev    # Admin app only
```

## 📁 Important Files

### Database Schema
- `packages/db/prisma/schema.prisma` - Complete database schema

### Authentication
- `apps/web/lib/auth.ts` - Citizen app auth configuration
- `apps/admin/lib/auth.ts` - Admin app auth configuration

### Role Definitions
- `ROLE_DEFINITIONS.md` - Detailed role permissions and access matrix

### Mock Data
- `scripts/seed-mock-data.ts` - Comprehensive sample data generator

## 🎯 Testing the System

1. **Start the applications**: `pnpm dev`
2. **Seed the database**: `pnpm db:seed`
3. **Test Citizen Flow**:
   - Go to http://localhost:3000
   - Login as `alice.cooper@email.com` / `password123`
   - Submit a new complaint
   - Track existing complaints

4. **Test Officer Flow**:
   - Go to http://localhost:3001
   - Login as `john.smith@civic.gov` / `password123`
   - View assignments
   - Update complaint status

5. **Test Admin Flow**:
   - Go to http://localhost:3001
   - Login as `admin@civic.gov` / `password123`
   - Access all admin features
   - Manage users and settings

## 🚨 Troubleshooting

### Database Issues
```bash
# Reset database completely
docker-compose down -v
docker-compose up -d
pnpm db:push
pnpm db:seed
```

### Port Conflicts
- Citizen app: Port 3000
- Admin app: Port 3001  
- PostgreSQL: Port 5432

### Authentication Issues
- Clear browser cache/cookies
- Check if user exists in correct role
- Verify password is `password123` for all mock users

## 📞 Support

For issues or questions:
- Check `ROLE_DEFINITIONS.md` for permission clarification
- Review this README for setup steps
- Examine the mock data seeder for sample data structure

---

## 🎉 You're Ready!

The system is now fully configured with:
✅ Complete database schema  
✅ Sample users across all roles  
✅ Mock complaints and assignments  
✅ Working authentication  
✅ Role-based access control  
✅ Responsive UI for all devices  

**Happy coding! 🚀**
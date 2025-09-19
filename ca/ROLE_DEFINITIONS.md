# Civic Complaints Admin System - Role Definitions

## System Administrator
**Full system access with administrative privileges**

### Capabilities:
- **User Management**: Create, edit, delete, and manage all user accounts (citizens, officers, other admins)
- **Officer Management**: Assign officers to complaints, manage officer workloads
- **System Configuration**: Modify system settings, categories, priorities, and workflows
- **Reports & Analytics**: Access to all reporting features and system analytics
- **Complaint Management**: Full CRUD operations on all complaints
- **Assignment Management**: Can assign/reassign complaints to any officer
- **Data Management**: Export/import data, bulk operations
- **System Monitoring**: View system logs, performance metrics, audit trails

### Access to Pages:
- ✅ Dashboard (full stats view)
- ✅ All Complaints (full management)
- ✅ Assignments (create/manage all assignments)
- ✅ Officers (manage officer accounts)
- ✅ Reports (comprehensive analytics)
- ✅ Settings (system configuration)
- ✅ User Management (all users)

---

## Officer (Complaint Officer)
**Operational access focused on complaint handling**

### Capabilities:
- **Complaint Handling**: View, update status, and manage assigned complaints
- **Assignment Acceptance**: Accept/decline complaint assignments
- **Progress Updates**: Update complaint status and add comments
- **Basic Reporting**: View reports related to their assigned complaints
- **Citizen Communication**: Communicate with citizens about their complaints

### Access to Pages:
- ✅ Dashboard (personal stats view)
- ✅ All Complaints (view and limited edit)
- ✅ Assignments (view their assignments only)
- ❌ Officers (no access)
- ❌ Reports (limited/no access)
- ❌ Settings (no access)
- ❌ User Management (no access)

### Restrictions:
- Cannot create other user accounts
- Cannot access system settings
- Cannot view comprehensive system reports
- Cannot manage other officers
- Can only modify complaints assigned to them

---

## Permission Matrix

| Feature | System Admin | Officer | Citizen |
|---------|--------------|---------|---------|
| View Dashboard | Full Access | Limited Access | N/A |
| Create Complaints | Yes | Yes | Yes |
| View All Complaints | Yes | Yes (limited) | Own Only |
| Edit Any Complaint | Yes | Assigned Only | Own Only (limited) |
| Delete Complaints | Yes | No | Own Only (limited) |
| Assign Complaints | Yes | No | No |
| Manage Users | Yes | No | No |
| View Reports | Yes | Limited | No |
| System Settings | Yes | No | No |
| Export Data | Yes | Limited | No |

---

## Database Roles
- `admin` - System Administrator
- `officer` - Complaint Officer  
- `citizen` - Regular user (citizen)

---

## Default Accounts (Will be created by seeder)

### System Administrator
- **Email**: admin@civic.gov
- **Password**: admin123
- **Role**: admin
- **Department**: IT Administration

### Officer Accounts
- **Email**: officer1@civic.gov
- **Password**: officer123
- **Role**: officer
- **Department**: Public Works

- **Email**: officer2@civic.gov
- **Password**: officer123
- **Role**: officer
- **Department**: Sanitation
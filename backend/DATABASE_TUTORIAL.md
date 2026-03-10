# Database Migration & Seeding Tutorial

## What You'll Learn

This tutorial covers essential database management skills:
1. Running migrations (creating tables)
2. Seeding data (inserting test records)
3. Creating database dumps (backups)
4. Modifying schema (adding columns)
5. Rolling back changes (undo migrations)

---

## Prerequisites

**Start MySQL Database First:**

### Option 1: Using Docker (Recommended)
```bash
# Start Docker Desktop, then:
docker-compose up mysql -d
```

### Option 2: Local MySQL
Make sure MySQL is running on port 3307

---

## Step-by-Step Tutorial

### **Task 1 & 2: ✅ Already Complete**
- Node.js project initialized
- Sequelize configured
- Migration file created

---

### **Task 3: Run the Migration**

**What migrations do:** Version control for your database schema

```bash
npm run migrate
```

**What happens:**
- Creates `Todos` table with columns: id, title, description, completed, createdAt, updatedAt
- Sequelize tracks which migrations have run in `SequelizeMeta` table

**Check migration status:**
```bash
npm run migrate:status
```

---

### **Task 4: Insert 3 Records (Seeding)**

**What seeders do:** Populate your database with initial/test data

**File created:** `seeders/20260310000001-demo-todos.js`

**Run the seeder:**
```bash
npm run seed
```

**What it inserts:**
1. "Learn Sequelize Migrations" (not completed)
2. "Create Database Dump" (not completed)
3. "Practice Migration Rollback" (completed)

**Verify in MySQL:**
```sql
SELECT * FROM Todos;
```

---

### **Task 5: Create Database Dump (Backup)**

**Why create dumps:** Backup before schema changes so you can restore if needed

**Windows:**
```bash
npm run db:dump
```
or
```bash
.\scripts\create-dump.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/create-dump.sh
./scripts/create-dump.sh
```

**What it creates:**
- File: `dumps/todo_db_backup_YYYYMMDD_HHMMSS.sql`
- Contains complete database backup with all data

**To restore a dump:**
```bash
mysql -h 127.0.0.1 -P 3307 -u root -proot1234 todo_db < dumps/todo_db_backup_20260310_123456.sql
```

---

### **Task 6: Create Second Migration (Modify Schema)**

**File created:** `migrations/20260310000002-add-priority-and-duedate.js`

**What it does:**
- Adds `priority` column (ENUM: low, medium, high)
- Adds `dueDate` column (DATE)

**Why use migrations for schema changes:**
- Version controlled
- Can be rolled back
- Team members get same changes
- Safe for production

---

### **Task 7: Apply the New Migration**

```bash
npm run migrate
```

**What happens:**
- Adds 2 new columns to `Todos` table
- Existing data remains intact
- Migration is tracked in `SequelizeMeta`

**Verify the changes:**
```sql
DESCRIBE Todos;
```

You should see the new columns: `priority` and `dueDate`

---

### **Task 8: Undo the Last Migration (Rollback)**

**Why rollback:** If a migration causes issues, you can undo it

```bash
npm run migrate:undo
```

**What happens:**
- Removes `priority` and `dueDate` columns
- Table returns to previous state
- Data in those columns is lost (be careful!)

**Check the status:**
```bash
npm run migrate:status
```

---

## Command Reference

| Command | What It Does |
|---------|-------------|
| `npm run migrate` | Run all pending migrations |
| `npm run migrate:undo` | Undo the last migration |
| `npm run migrate:status` | Check which migrations have run |
| `npm run seed` | Run all seeders |
| `npm run seed:undo` | Undo the last seeder |
| `npm run db:dump` | Create database backup |
| `npm run db:reset` | Reset DB: undo all → migrate → seed |

---

## Important Concepts

### **Migrations**
- **Up:** What to do when applying the migration
- **Down:** What to do when rolling back
- **Always test rollback** before deploying

### **Seeders**
- Used for test/demo data
- NOT for production data
- Can be undone unlike real user data

### **Database Dumps**
- Full backup of database
- Create before:
  - Schema changes
  - Major deployments
  - Data migrations

---

## Best Practices

1. ✅ **Always create dump before schema changes**
2. ✅ **Test migrations in development first**
3. ✅ **Write proper `down` methods for rollback**
4. ✅ **Never edit applied migrations** (create new ones)
5. ✅ **Keep migrations small and focused**
6. ✅ **Name migrations descriptively**

---

## Troubleshooting

**Migration fails:**
```bash
# Check migration status
npm run migrate:status

# Undo if needed
npm run migrate:undo
```

**Database connection error:**
- Check MySQL is running
- Verify .env credentials
- Check port (3307 local, 3306 docker)

**Want to start fresh:**
```bash
npm run db:reset
```

---

## Success Criteria

After completing all tasks, you should be able to:
- ✅ Run migrations to create/modify tables
- ✅ Seed data into database
- ✅ Create and restore database dumps
- ✅ Rollback migrations safely
- ✅ Understand database version control

---

## Next Steps

**Once MySQL is running, execute in order:**

```bash
# 1. Run initial migration (creates table)
npm run migrate

# 2. Seed 3 records
npm run seed

# 3. Create backup
npm run db:dump

# 4. Apply second migration (adds columns)
npm run migrate

# 5. Rollback the second migration
npm run migrate:undo
```

Good luck! 🚀

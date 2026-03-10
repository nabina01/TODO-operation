# Migration Tasks Checklist

## Setup
- [x] Task 1: Initialize Node.js project with Sequelize  
- [x] Task 2: Create migration for `todos` table

## Execute (Do these in order once MySQL is running)

### Task 3: Run Initial Migration
```bash
npm run migrate
```
- [ ] Creates `Todos` table in database
- [ ] Verify with: `npm run migrate:status`

### Task 4: Insert 3 Records  
```bash
npm run seed
```
- [ ] Inserts demo todos into table
- [ ] Verify in MySQL: `SELECT * FROM Todos;`

### Task 5: Create Database Dump
```bash
npm run db:dump
```
Or Windows: `.\scripts\create-dump.bat`
- [ ] Creates backup file in `dumps/` folder
- [ ] File named: `todo_db_backup_TIMESTAMP.sql`

### Task 6: Create Second Migration
- [x]File created: `migrations/20260310000002-add-priority-and-duedate.js`
- [x] Adds `priority` column (ENUM)
- [x] Adds `dueDate` column (DATE)

### Task 7: Apply New Migration
```bash
npm run migrate
```
- [ ] Adds new columns to `Todos` table
- [ ] Verify with: `DESCRIBE Todos;` in MySQL

### Task 8: Undo Last Migration
```bash
npm run migrate:undo
```
- [ ] Removes `priority` and `dueDate` columns
- [ ] Table returns to previous schema
- [ ] Verify with: `npm run migrate:status`

---

## Quick Start Commands

1. **Start MySQL:** `docker-compose up mysql -d`
2. **Run all tasks:**
   ```bash
   npm run migrate          # Task 3
   npm run seed             # Task 4
   npm run db:dump          # Task 5
   npm run migrate          # Task 7
   npm run migrate:undo     # Task 8
   ```

## Files Created for You

✅ `config/config.js` - Sequelize configuration  
✅ `seeders/20260310000001-demo-todos.js` - 3 demo records  
✅ `migrations/20260310000002-add-priority-and-duedate.js` - Schema modification  
✅ `scripts/create-dump.bat` - Windows dump script  
✅ `scripts/create-dump.sh` - Linux/Mac dump script  
✅ `DATABASE_TUTORIAL.md` - Detailed tutorial  

## Next Step

👉 **Start Docker Desktop, then run:**
```bash
docker-compose up mysql -d
```

Then execute the tasks in order!

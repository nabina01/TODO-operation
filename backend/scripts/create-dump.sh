#!/bin/bash
# Database Dump Script for Linux/Mac
# This creates a backup of your MySQL database before schema changes

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="todo_db"
DB_USER="root"
DB_PASSWORD="root1234"
DB_HOST="127.0.0.1"
DB_PORT="3307"
DUMP_FILE="dumps/todo_db_backup_$TIMESTAMP.sql"

echo "Creating database dump..."
echo "Dump file: $DUMP_FILE"

mkdir -p dumps

# Using mysqldump to create the backup
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database dump created successfully!"
    echo "Location: $DUMP_FILE"
else
    echo ""
    echo "✗ Failed to create database dump"
    echo "Make sure MySQL is running and credentials are correct"
fi

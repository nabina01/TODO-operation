@echo off
REM Database Dump Script for Windows
REM This creates a backup of your MySQL database before schema changes

SET TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET DB_NAME=todo_db
SET DB_USER=root
SET DB_PASSWORD=root1234
SET DB_HOST=127.0.0.1
SET DB_PORT=3307
SET DUMP_FILE=dumps\todo_db_backup_%TIMESTAMP%.sql

echo Creating database dump...
echo Dump file: %DUMP_FILE%

mkdir dumps 2>nul

REM Using mysqldump to create the backup
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% > %DUMP_FILE%

if %ERRORLEVEL% == 0 (
    echo.
    echo ✓ Database dump created successfully!
    echo Location: %DUMP_FILE%
) else (
    echo.
    echo ✗ Failed to create database dump
    echo Make sure MySQL is running and credentials are correct
)

pause

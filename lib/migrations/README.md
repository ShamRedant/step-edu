# Database Migrations

## Migration: Add PPT File and Quiz Link to Lessons

This migration adds support for PPT file uploads and quiz links to the lessons table.

### To Run the Migration:

1. **Using psql command line:**
   ```bash
   psql -U your_username -d your_database_name -f lib/migrations/add_module_ppt_and_quiz.sql
   ```

2. **Or manually in your PostgreSQL client:**
   - Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
   - Connect to your database
   - Execute the SQL commands from `lib/migrations/add_module_ppt_and_quiz.sql`

### What This Migration Does:

- Adds `ppt_file_path` column (TEXT) to the `lessons` table to store the path to uploaded PPT files
- Adds `quiz_link` column (TEXT) to the `lessons` table to store quiz URLs

### Notes:

- The migration uses `ADD COLUMN IF NOT EXISTS` so it's safe to run multiple times
- Existing lessons will have `NULL` values for these new columns
- The `lesson-files` upload directory will be created automatically when the first PPT file is uploaded
- Each lesson can have one PPT file and one quiz link


# Steps Robotics - Learning Management System Setup Guide

## Overview

This is a comprehensive Learning Management System for Steps Robotics, built with Next.js (App Router) and PostgreSQL. The system supports a hierarchical structure of Courses → Modules → Lessons, with file upload capabilities for teachers, students, and homework.

## Database Schema

The system uses the following database structure:

- **Courses**: Top-level container for learning content
- **Modules**: Grouped lessons within a course
- **Lessons**: Individual learning units within modules
- **Teacher Files**: Notes, slides, videos, PDFs uploaded by teachers
- **Student Files**: Assignments/submissions uploaded by students
- **Homework Files**: Homework documents given by teachers

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE lms_db;
```

2. Run the schema file to create all tables:
```bash
psql -U your_username -d lms_db -f lib/schema.sql
```

Or manually execute the SQL commands from `lib/schema.sql` in your PostgreSQL client.

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# PostgreSQL Configuration
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DATABASE=lms_db
PG_PASSWORD=your_postgres_password
PG_PORT=5432

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Upload Directory (optional, defaults to ./public/uploads)
UPLOAD_DIR=./public/uploads

# Node Environment
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create Upload Directories

The system will automatically create upload directories, but you can create them manually:

```bash
mkdir -p public/uploads/teacher-files
mkdir -p public/uploads/student-files
mkdir -p public/uploads/homework-files
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## File Structure

```
steps-robotics/
├── app/
│   ├── admin/
│   │   ├── courses/          # Course management pages
│   │   ├── modules/          # Module management pages
│   │   ├── lessons/         # Lesson management pages
│   │   └── dashboard/       # Admin dashboard
│   └── api/
│       └── admin/
│           ├── courses/      # Course CRUD APIs
│           ├── modules/     # Module CRUD APIs
│           ├── lessons/     # Lesson CRUD APIs
│           └── files/       # File management APIs
├── lib/
│   ├── db.js                # PostgreSQL connection pool
│   ├── jwt.js               # JWT token utilities
│   ├── fileUpload.js        # File upload utilities
│   └── schema.sql           # Database schema
└── public/
    └── uploads/             # Uploaded files storage
        ├── teacher-files/
        ├── student-files/
        └── homework-files/
```

## API Endpoints

### Courses

- `GET /api/admin/courses` - Get all courses
- `GET /api/admin/courses/[id]` - Get course with modules and lessons
- `POST /api/admin/courses` - Create a new course
- `PUT /api/admin/courses/[id]` - Update a course
- `DELETE /api/admin/courses/[id]` - Archive a course

### Modules

- `GET /api/admin/modules?course_id=[id]` - Get modules (optionally filtered by course)
- `GET /api/admin/modules/[id]` - Get module with lessons
- `POST /api/admin/modules` - Create a new module
- `PUT /api/admin/modules/[id]` - Update a module
- `DELETE /api/admin/modules/[id]` - Archive a module

### Lessons

- `GET /api/admin/lessons?module_id=[id]` - Get lessons (optionally filtered by module)
- `GET /api/admin/lessons/[id]` - Get lesson with all files
- `POST /api/admin/lessons` - Create a new lesson
- `PUT /api/admin/lessons/[id]` - Update a lesson
- `DELETE /api/admin/lessons/[id]` - Archive a lesson

### File Uploads

- `GET /api/admin/lessons/[id]/teacher-files` - Get teacher files for a lesson
- `POST /api/admin/lessons/[id]/teacher-files` - Upload teacher file
- `GET /api/admin/lessons/[id]/student-files` - Get student files for a lesson
- `POST /api/admin/lessons/[id]/student-files` - Upload student file
- `GET /api/admin/lessons/[id]/homework-files` - Get homework files for a lesson
- `POST /api/admin/lessons/[id]/homework-files` - Upload homework file
- `DELETE /api/admin/files/[id]?type=[teacher|student|homework]` - Delete a file

## Features

### Security

- JWT-based authentication for admin routes
- File type validation (PDF, DOC, DOCX, images, videos, etc.)
- File size limits (50MB default)
- Secure file storage with unique filenames
- SQL injection protection using parameterized queries

### File Upload Support

**Supported File Types:**
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, JPEG, PNG, GIF
- Videos: MP4, MOV, AVI
- Presentations: PPT, PPTX
- Archives: ZIP, RAR

**File Storage:**
- Files are stored in `public/uploads/[type]/` directories
- Only file paths are stored in the database
- Original filenames are preserved for display

### Database Features

- Foreign key constraints ensure data integrity
- Cascade deletes (deleting a course deletes its modules and lessons)
- Soft deletes (status-based archiving)
- Automatic timestamp updates
- Indexes for performance optimization

## Usage Workflow

1. **Create a Course**: Navigate to `/admin/courses` and click "Add Course"
2. **Add Modules**: Open a course and click "Add Module"
3. **Add Lessons**: Open a module and click "Add Lesson"
4. **Upload Files**: Open a lesson and use the tabs to upload:
   - Teacher files (notes, slides, videos)
   - Student files (assignments)
   - Homework files (homework documents)

## Admin Interface

- **Dashboard**: `/admin/dashboard` - Main admin dashboard
- **Courses**: `/admin/courses` - Course management
- **Course Detail**: `/admin/courses/[id]` - View and manage modules
- **Module Detail**: `/admin/modules/[id]` - View and manage lessons
- **Lesson Detail**: `/admin/lessons/[id]` - View and manage files

## Best Practices

1. **File Management**: Regularly clean up unused files to save storage space
2. **Database Backups**: Set up regular PostgreSQL backups
3. **Environment Variables**: Never commit `.env.local` to version control
4. **File Size Limits**: Adjust `MAX_FILE_SIZE` in `lib/fileUpload.js` if needed
5. **Security**: Use strong JWT secrets in production
6. **HTTPS**: Always use HTTPS in production for secure file uploads

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check environment variables are correct
- Ensure database exists and user has proper permissions

### File Upload Issues
- Check upload directory permissions
- Verify file size is within limits
- Ensure file type is allowed

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set correctly
- Check admin user exists in database

## Production Considerations

1. **File Storage**: Consider using cloud storage (AWS S3, Azure Blob) for production
2. **CDN**: Use a CDN for serving uploaded files
3. **Database**: Use connection pooling and read replicas for scalability
4. **Caching**: Implement Redis for session management and caching
5. **Monitoring**: Set up error tracking and performance monitoring
6. **Backup**: Implement automated database and file backups

## License

This project is part of Steps Robotics learning platform.



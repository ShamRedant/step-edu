import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function getAdminId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  
  try {
    const { payload } = await verifyAdminToken(token);
    return payload.id;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// GET - Fetch a single lesson with files
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Fetch lesson
    const lessonQuery = `
      SELECT 
        l.*,
        m.title as module_title,
        m.id as module_id,
        c.title as course_title,
        c.id as course_id
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      LEFT JOIN courses c ON m.course_id = c.id
      WHERE l.id = $1
    `;

    const lessonResult = await pool.query(lessonQuery, [id]);

    if (lessonResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const lesson = lessonResult.rows[0];

    // Fetch files
    const [teacherFiles, studentFiles, homeworkFiles] = await Promise.all([
      pool.query("SELECT * FROM teacher_files WHERE lesson_id = $1 ORDER BY created_at DESC", [id]),
      pool.query("SELECT * FROM student_files WHERE lesson_id = $1 ORDER BY created_at DESC", [id]),
      pool.query("SELECT * FROM homework_files WHERE lesson_id = $1 ORDER BY created_at DESC", [id]),
    ]);

    lesson.teacher_files = teacherFiles.rows;
    lesson.student_files = studentFiles.rows;
    lesson.homework_files = homeworkFiles.rows;
    // ppt_file_path and quiz_link are already in lesson from the query

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// PUT - Update a lesson
export async function PUT(req, { params }) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, description, content, order_index, status, quiz_link } = await req.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE lessons
      SET 
        title = $1, 
        description = $2,
        content = $3,
        order_index = COALESCE($4, order_index),
        status = COALESCE($5, status),
        quiz_link = COALESCE($6, quiz_link),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      title.trim(),
      description?.trim() || null,
      content?.trim() || null,
      order_index,
      status,
      quiz_link?.trim() || null,
      id,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lesson updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a lesson (soft delete)
export async function DELETE(req, { params }) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const query = `
      UPDATE lessons
      SET status = 'archived'
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lesson archived successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}



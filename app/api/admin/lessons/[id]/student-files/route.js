import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { saveFile, parseFormData } from "@/lib/fileUpload";

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

// GET - Fetch all student files for a lesson
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const query = `
      SELECT sf.*
      FROM student_files sf
      WHERE sf.lesson_id = $1
      ORDER BY sf.created_at DESC
    `;

    const { rows } = await pool.query(query, [id]);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching student files:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student files" },
      { status: 500 }
    );
  }
}

// POST - Upload a student file (can be used by admin or students)
export async function POST(req, { params }) {
  try {
    const adminId = await getAdminId();
    const { id: lessonId } = await params;

    // Verify lesson exists
    const lessonCheck = await pool.query("SELECT id FROM lessons WHERE id = $1", [lessonId]);
    if (lessonCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const formData = await parseFormData(req);
    const file = formData.get("file");
    const studentId = formData.get("student_id"); // Optional, can be null for admin uploads

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Save file
    const fileData = await saveFile(file, "student-files", lessonId);

    // Save to database
    const query = `
      INSERT INTO student_files (
        lesson_id, file_name, original_name, file_path, 
        file_type, file_size, mime_type, student_id, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      lessonId,
      fileData.fileName,
      fileData.originalName,
      fileData.filePath,
      fileData.fileType,
      fileData.fileSize,
      fileData.mimeType,
      studentId || null,
      adminId || null,
    ]);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading student file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}



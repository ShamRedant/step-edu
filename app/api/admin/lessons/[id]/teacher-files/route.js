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

// GET - Fetch all teacher files for a lesson
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const query = `
      SELECT tf.*, a.email as uploaded_by_email
      FROM teacher_files tf
      LEFT JOIN admins a ON tf.uploaded_by = a.id
      WHERE tf.lesson_id = $1
      ORDER BY tf.created_at DESC
    `;

    const { rows } = await pool.query(query, [id]);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching teacher files:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch teacher files" },
      { status: 500 }
    );
  }
}

// POST - Upload a teacher file
export async function POST(req, { params }) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Save file
    const fileData = await saveFile(file, "teacher-files", lessonId);

    // Save to database
    const query = `
      INSERT INTO teacher_files (
        lesson_id, file_name, original_name, file_path, 
        file_type, file_size, mime_type, uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      adminId,
    ]);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading teacher file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}



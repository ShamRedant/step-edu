import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { saveFile, parseFormData } from "@/lib/fileUpload";
import { unlink } from "fs/promises";
import { join } from "path";

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

// POST - Upload PPT file for a lesson
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
    const lessonCheck = await pool.query("SELECT id, ppt_file_path FROM lessons WHERE id = $1", [lessonId]);
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

    // Check if file is PPT/PPTX
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['ppt', 'pptx'].includes(fileExt)) {
      return NextResponse.json(
        { success: false, message: "Only PPT and PPTX files are allowed" },
        { status: 400 }
      );
    }

    // Delete old PPT file if exists
    const oldLesson = lessonCheck.rows[0];
    if (oldLesson.ppt_file_path) {
      try {
        const oldFilePath = join(process.cwd(), 'public', oldLesson.ppt_file_path);
        await unlink(oldFilePath);
      } catch (error) {
        console.error("Error deleting old PPT file:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Save new file (using lesson-files directory for consistency)
    const fileData = await saveFile(file, "lesson-files", lessonId);

    // Update lesson with new PPT file path
    const query = `
      UPDATE lessons
      SET ppt_file_path = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const { rows } = await pool.query(query, [fileData.filePath, lessonId]);

    return NextResponse.json({
      success: true,
      message: "PPT file uploaded successfully",
      data: {
        lesson: rows[0],
        file: fileData,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading PPT file:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload PPT file" },
      { status: 500 }
    );
  }
}

// DELETE - Delete PPT file from a lesson
export async function DELETE(req, { params }) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: lessonId } = await params;

    // Fetch lesson info
    const { rows } = await pool.query("SELECT id, ppt_file_path FROM lessons WHERE id = $1", [lessonId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      );
    }

    const lesson = rows[0];

    if (!lesson.ppt_file_path) {
      return NextResponse.json(
        { success: false, message: "No PPT file found for this lesson" },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', lesson.ppt_file_path);
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file from filesystem:", error);
      // Continue with database update even if file deletion fails
    }

    // Update lesson to remove PPT file path
    const updateQuery = `
      UPDATE lessons
      SET ppt_file_path = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    await pool.query(updateQuery, [lessonId]);

    return NextResponse.json({
      success: true,
      message: "PPT file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting PPT file:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete PPT file" },
      { status: 500 }
    );
  }
}


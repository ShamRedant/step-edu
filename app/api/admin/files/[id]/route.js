import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAdminToken } from "@/lib/jwt";
import { cookies } from "next/headers";
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

// DELETE - Delete a file (works for teacher, student, or homework files)
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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'teacher', 'student', or 'homework'

    if (!type || !['teacher', 'student', 'homework'].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type" },
        { status: 400 }
      );
    }

    const tableMap = {
      teacher: 'teacher_files',
      student: 'student_files',
      homework: 'homework_files',
    };

    const table = tableMap[type];

    // Fetch file info
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    const file = rows[0];

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', file.file_path);
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file from filesystem:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const deleteQuery = `DELETE FROM ${table} WHERE id = $1`;
    await pool.query(deleteQuery, [id]);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete file" },
      { status: 500 }
    );
  }
}



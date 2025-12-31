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

// GET - Fetch a single course with modules and lessons
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Fetch course
    const courseQuery = "SELECT * FROM courses WHERE id = $1";
    const courseResult = await pool.query(courseQuery, [id]);

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Fetch modules with lessons
    const modulesQuery = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', l.id,
              'title', l.title,
              'description', l.description,
              'order_index', l.order_index,
              'status', l.status,
              'created_at', l.created_at
            ) ORDER BY l.order_index
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) as lessons
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id AND l.status = 'active'
      WHERE m.course_id = $1 AND m.status = 'active'
      GROUP BY m.id
      ORDER BY m.order_index
    `;

    const modulesResult = await pool.query(modulesQuery, [id]);
    course.modules = modulesResult.rows;

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT - Update a course
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
    const { title, description, status } = await req.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE courses
      SET title = $1, description = $2, status = COALESCE($3, status)
      WHERE id = $4
      RETURNING *
    `;

    const { rows } = await pool.query(query, [title.trim(), description?.trim() || null, status, id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a course (soft delete by setting status to archived)
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
      UPDATE courses
      SET status = 'archived'
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course archived successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 }
    );
  }
}



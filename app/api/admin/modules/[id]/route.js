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

// GET - Fetch a single module with lessons
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const query = `
      SELECT 
        m.*,
        c.title as course_title,
        c.id as course_id,
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
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN lessons l ON m.id = l.module_id AND l.status = 'active'
      WHERE m.id = $1
      GROUP BY m.id, c.title, c.id
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// PUT - Update a module
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
    const { title, description, order_index, status } = await req.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE modules
      SET 
        title = $1, 
        description = $2, 
        order_index = COALESCE($3, order_index),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      title.trim(),
      description?.trim() || null,
      order_index,
      status,
      id,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Module updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update module" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a module (soft delete)
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
      UPDATE modules
      SET status = 'archived'
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Module archived successfully",
    });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete module" },
      { status: 500 }
    );
  }
}



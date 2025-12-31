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

// GET - Fetch all modules (optionally filtered by course_id)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("course_id");
    const status = searchParams.get("status") || "active";

    let query = `
      SELECT 
        m.*,
        c.title as course_title,
        COUNT(DISTINCT l.id) as lesson_count
      FROM modules m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN lessons l ON m.id = l.module_id AND l.status = 'active'
      WHERE m.status = $1
    `;
    
    const params = [status];
    
    if (courseId) {
      query += ` AND m.course_id = $2`;
      params.push(courseId);
      query += ` GROUP BY m.id, c.title ORDER BY m.order_index`;
    } else {
      query += ` GROUP BY m.id, c.title ORDER BY m.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

// POST - Create a new module
export async function POST(req) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { course_id, title, description, order_index } = await req.json();

    if (!course_id || !title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Course ID and title are required" },
        { status: 400 }
      );
    }

    // Verify course exists
    const courseCheck = await pool.query("SELECT id FROM courses WHERE id = $1 AND status != 'archived'", [course_id]);
    if (courseCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Get max order_index if not provided
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const maxOrder = await pool.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM modules WHERE course_id = $1",
        [course_id]
      );
      finalOrderIndex = maxOrder.rows[0].next_order;
    }

    const query = `
      INSERT INTO modules (course_id, title, description, order_index, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      course_id,
      title.trim(),
      description?.trim() || null,
      finalOrderIndex,
      adminId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Module created successfully",
      data: rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create module" },
      { status: 500 }
    );
  }
}



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

// GET - Fetch all lessons (optionally filtered by module_id)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("module_id");
    const status = searchParams.get("status") || "active";

    let query = `
      SELECT 
        l.*,
        m.title as module_title,
        m.id as module_id,
        c.title as course_title,
        c.id as course_id
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      LEFT JOIN courses c ON m.course_id = c.id
      WHERE l.status = $1
    `;
    
    const params = [status];
    
    if (moduleId) {
      query += ` AND l.module_id = $2`;
      params.push(moduleId);
      query += ` ORDER BY l.order_index`;
    } else {
      query += ` ORDER BY l.created_at DESC`;
    }

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST - Create a new lesson
export async function POST(req) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { module_id, title, description, content, order_index } = await req.json();

    if (!module_id || !title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Module ID and title are required" },
        { status: 400 }
      );
    }

    // Verify module exists
    const moduleCheck = await pool.query("SELECT id FROM modules WHERE id = $1 AND status != 'archived'", [module_id]);
    if (moduleCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Get max order_index if not provided
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined || finalOrderIndex === null) {
      const maxOrder = await pool.query(
        "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM lessons WHERE module_id = $1",
        [module_id]
      );
      finalOrderIndex = maxOrder.rows[0].next_order;
    }

    const query = `
      INSERT INTO lessons (module_id, title, description, content, order_index, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      module_id,
      title.trim(),
      description?.trim() || null,
      content?.trim() || null,
      finalOrderIndex,
      adminId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Lesson created successfully",
      data: rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create lesson" },
      { status: 500 }
    );
  }
}



import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
  try {
    // Fetch courses
    const coursesQuery = "SELECT id, title, description, status FROM courses WHERE status = 'active' ORDER BY created_at DESC";
    const coursesResult = await pool.query(coursesQuery);
    const courses = coursesResult.rows;

    // Fetch modules for all courses
    const modulesQuery = "SELECT id, course_id, title, description, order_index, status FROM modules WHERE status = 'active' ORDER BY order_index";
    const modulesResult = await pool.query(modulesQuery);
    const modules = modulesResult.rows;

    // Fetch lessons for all modules
    const lessonsQuery = "SELECT id, module_id, title, description, order_index, status, ppt_file_path, quiz_link FROM lessons WHERE status = 'active' ORDER BY order_index";
    const lessonsResult = await pool.query(lessonsQuery);
    const lessons = lessonsResult.rows;

    // Fetch teacher files
    const teacherFilesQuery = "SELECT id, lesson_id, original_name, file_path, file_type, file_size, mime_type FROM teacher_files ORDER BY created_at DESC";
    const teacherFilesResult = await pool.query(teacherFilesQuery);
    const teacherFiles = teacherFilesResult.rows;

    // Fetch student files
    const studentFilesQuery = "SELECT id, lesson_id, original_name, file_path, file_type, file_size, mime_type FROM student_files ORDER BY created_at DESC";
    const studentFilesResult = await pool.query(studentFilesQuery);
    const studentFiles = studentFilesResult.rows;

    // Fetch homework files
    const homeworkFilesQuery = "SELECT id, lesson_id, original_name, file_path, file_type, file_size, mime_type, due_date FROM homework_files ORDER BY created_at DESC";
    const homeworkFilesResult = await pool.query(homeworkFilesQuery);
    const homeworkFiles = homeworkFilesResult.rows;

    // Organize data hierarchically
    const organizedData = courses.map((course) => {
      const courseModules = modules
        .filter((m) => m.course_id === course.id)
        .map((module) => {
          const moduleLessons = lessons
            .filter((l) => l.module_id === module.id)
            .map((lesson) => {
              return {
                lesson_id: lesson.id,
                lesson_title: lesson.title,
                lesson_description: lesson.description,
                lesson_order: lesson.order_index,
                lesson_status: lesson.status,
                ppt_file_path: lesson.ppt_file_path,
                quiz_link: lesson.quiz_link,
                teacher_files: teacherFiles
                  .filter((tf) => tf.lesson_id === lesson.id)
                  .map((tf) => ({
                    id: tf.id,
                    file_name: tf.original_name,
                    file_path: tf.file_path,
                    file_type: tf.file_type,
                    file_size: tf.file_size,
                    mime_type: tf.mime_type,
                  })),
                student_files: studentFiles
                  .filter((sf) => sf.lesson_id === lesson.id)
                  .map((sf) => ({
                    id: sf.id,
                    file_name: sf.original_name,
                    file_path: sf.file_path,
                    file_type: sf.file_type,
                    file_size: sf.file_size,
                    mime_type: sf.mime_type,
                  })),
                homework_files: homeworkFiles
                  .filter((hf) => hf.lesson_id === lesson.id)
                  .map((hf) => ({
                    id: hf.id,
                    file_name: hf.original_name,
                    file_path: hf.file_path,
                    file_type: hf.file_type,
                    file_size: hf.file_size,
                    mime_type: hf.mime_type,
                    due_date: hf.due_date,
                  })),
              };
            });

          return {
            module_id: module.id,
            module_title: module.title,
            module_description: module.description,
            module_order: module.order_index,
            module_status: module.status,
            lessons: moduleLessons,
          };
        });

      return {
        course_id: course.id,
        course_title: course.title,
        course_description: course.description,
        course_status: course.status,
        modules: courseModules,
      };
    });

    return NextResponse.json({
      success: true,
      data: organizedData,
    });
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch navigation" },
      { status: 500 }
    );
  }
}


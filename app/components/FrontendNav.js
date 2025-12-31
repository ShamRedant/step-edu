"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function FrontendNav({ sidebarOpen, onFileSelect }) {
  const [navigationData, setNavigationData] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const res = await fetch("/api/navigation");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNavigationData(data.data || []);
          // Auto-expand first course
          if (data.data && data.data.length > 0) {
            setExpandedCourses(new Set([data.data[0].course_id.toString()]));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching navigation:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId.toString())) {
      newExpanded.delete(courseId.toString());
    } else {
      newExpanded.add(courseId.toString());
    }
    setExpandedCourses(newExpanded);
  };

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId.toString())) {
      newExpanded.delete(moduleId.toString());
    } else {
      newExpanded.add(moduleId.toString());
    }
    setExpandedModules(newExpanded);
  };

  const toggleLesson = (lessonId) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId.toString())) {
      newExpanded.delete(lessonId.toString());
    } else {
      newExpanded.add(lessonId.toString());
    }
    setExpandedLessons(newExpanded);
  };

  const handleFileClick = (filePath, fileType, fileName, category) => {
    const params = new URLSearchParams({
      file: filePath,
      type: fileType || "pdf",
      category: category,
      name: fileName,
    });
    
    // If on home page, update URL params; otherwise navigate to viewer
    if (pathname === "/") {
      router.push(`/?${params.toString()}`, { scroll: false });
      if (onFileSelect) {
        onFileSelect({
          filePath,
          fileType: fileType || "pdf",
          fileCategory: category,
          fileName,
        });
      }
    } else {
      router.push(`/viewer?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto flex-1 pb-20">
      {navigationData.map((course) => {
        const courseExpanded = expandedCourses.has(course.course_id.toString());
        const modules = course.modules || [];

        return (
          <div key={course.course_id} className="text-slate-300">
            {/* Course */}
            <button
              onClick={() => toggleCourse(course.course_id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-700 ${
                courseExpanded ? "bg-slate-700" : ""
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${courseExpanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {sidebarOpen && (
                <span className="text-sm font-medium truncate flex-1 text-left">{course.course_title}</span>
              )}
            </button>

            {/* Modules */}
            {courseExpanded && modules.map((module) => {
              const moduleExpanded = expandedModules.has(module.module_id.toString());
              const lessons = module.lessons || [];

              return (
                <div key={module.module_id} className="ml-4 mt-1">
                  <button
                    onClick={() => toggleModule(module.module_id)}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-700 ${
                      moduleExpanded ? "bg-slate-700" : ""
                    }`}
                  >
                    <svg
                      className={`w-3 h-3 transition-transform ${moduleExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {sidebarOpen && (
                      <span className="text-xs truncate flex-1 text-left">{module.module_title}</span>
                    )}
                  </button>

                  {/* Lessons */}
                  {moduleExpanded && lessons.map((lesson) => {
                    const lessonExpanded = expandedLessons.has(lesson.lesson_id.toString());
                    const teacherFiles = lesson.teacher_files || [];
                    const studentFiles = lesson.student_files || [];
                    const homeworkFiles = lesson.homework_files || [];

                    return (
                      <div key={lesson.lesson_id} className="ml-4 mt-1">
                        <button
                          onClick={() => toggleLesson(lesson.lesson_id)}
                          className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-slate-700 ${
                            lessonExpanded ? "bg-slate-700" : ""
                          }`}
                        >
                          <svg
                            className={`w-3 h-3 transition-transform ${lessonExpanded ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {sidebarOpen && (
                            <span className="text-xs truncate flex-1 text-left">{lesson.lesson_title}</span>
                          )}
                        </button>

                        {/* Files */}
                        {lessonExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {/* Teacher Files */}
                            {teacherFiles.length > 0 && (
                              <div className="ml-2">
                                {sidebarOpen && (
                                  <div className="px-2 py-1 text-xs text-slate-400 font-semibold">Teacher Files</div>
                                )}
                                {teacherFiles.map((file) => (
                                  <button
                                    key={file.id}
                                    onClick={() =>
                                      handleFileClick(file.file_path, file.file_type, file.file_name, "teacher")
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-1.5 rounded hover:bg-slate-700 transition-colors text-xs text-slate-300"
                                  >
                                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {sidebarOpen && (
                                      <span className="truncate flex-1 text-left">{file.file_name}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Student Files */}
                            {studentFiles.length > 0 && (
                              <div className="ml-2">
                                {sidebarOpen && (
                                  <div className="px-2 py-1 text-xs text-slate-400 font-semibold">Student Files</div>
                                )}
                                {studentFiles.map((file) => (
                                  <button
                                    key={file.id}
                                    onClick={() =>
                                      handleFileClick(file.file_path, file.file_type, file.file_name, "student")
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-1.5 rounded hover:bg-slate-700 transition-colors text-xs text-slate-300"
                                  >
                                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {sidebarOpen && (
                                      <span className="truncate flex-1 text-left">{file.file_name}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Homework Files */}
                            {homeworkFiles.length > 0 && (
                              <div className="ml-2">
                                {sidebarOpen && (
                                  <div className="px-2 py-1 text-xs text-slate-400 font-semibold">Homework Files</div>
                                )}
                                {homeworkFiles.map((file) => (
                                  <button
                                    key={file.id}
                                    onClick={() =>
                                      handleFileClick(file.file_path, file.file_type, file.file_name, "homework")
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-1.5 rounded hover:bg-slate-700 transition-colors text-xs text-slate-300"
                                  >
                                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {sidebarOpen && (
                                      <span className="truncate flex-1 text-left">{file.file_name}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


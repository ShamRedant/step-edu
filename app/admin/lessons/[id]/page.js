"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params.id;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("teacher"); // teacher, student, homework
  const [uploading, setUploading] = useState(false);
  const [uploadingPPT, setUploadingPPT] = useState(false);
  const [quizLink, setQuizLink] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`);
      const data = await res.json();
      if (data.success) {
        setLesson(data.data);
        setQuizLink(data.data.quiz_link || "");
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      let url = `/api/admin/lessons/${lessonId}`;
      if (type === "teacher") {
        url += "/teacher-files";
      } else if (type === "student") {
        url += "/student-files";
      } else if (type === "homework") {
        url += "/homework-files";
        const dueDate = prompt("Enter due date (YYYY-MM-DD HH:MM:SS) or leave empty:");
        if (dueDate) {
          formData.append("due_date", dueDate);
        }
      }

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("File uploaded successfully!");
        fetchLesson();
      } else {
        alert(data.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleFileDelete = async (fileId, type) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`/api/admin/files/${fileId}?type=${type}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        alert("File deleted successfully!");
        fetchLesson();
      } else {
        alert(data.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handlePPTUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['ppt', 'pptx'].includes(fileExt)) {
      alert("Please upload a PPT or PPTX file");
      return;
    }

    setUploadingPPT(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/lessons/${lessonId}/ppt`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        fetchLesson();
        alert("PPT file uploaded successfully!");
      } else {
        alert(data.message || "Failed to upload PPT file");
      }
    } catch (error) {
      console.error("Error uploading PPT:", error);
      alert("Failed to upload PPT file");
    } finally {
      setUploadingPPT(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handlePPTDelete = async () => {
    if (!confirm("Are you sure you want to delete the PPT file?")) return;

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/ppt`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        fetchLesson();
        alert("PPT file deleted successfully!");
      } else {
        alert(data.message || "Failed to delete PPT file");
      }
    } catch (error) {
      console.error("Error deleting PPT:", error);
      alert("Failed to delete PPT file");
    }
  };

  const handleQuizLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          order_index: lesson.order_index,
          status: lesson.status,
          quiz_link: quizLink.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowQuizModal(false);
        fetchLesson();
        alert("Quiz link updated successfully!");
      } else {
        alert(data.message || "Failed to update quiz link");
      }
    } catch (error) {
      console.error("Error updating quiz link:", error);
      alert("Failed to update quiz link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold text-gray-700">Lesson not found</p>
          <Link
            href="/admin/courses"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const teacherFiles = lesson.teacher_files || [];
  const studentFiles = lesson.student_files || [];
  const homeworkFiles = lesson.homework_files || [];

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <Link
          href={`/admin/modules/${lesson.module_id}`}
          className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Module
        </Link>
        <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-green-100 text-lg mb-2">{lesson.description || "No description"}</p>
        <p className="text-green-200 text-sm">
          Course: {lesson.course_title} → Module: {lesson.module_title}
        </p>
      </div>

      {lesson.content && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Content</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{lesson.content}</p>
          </div>
        </div>
      )}

      {/* PPT Upload and Quiz Link Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PPT Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PPT File
          </h3>
          {lesson.ppt_file_path ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">PPT File Uploaded</p>
                  <a
                    href={lesson.ppt_file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View/Download
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <label className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center font-medium">
                  {uploadingPPT ? "Uploading..." : "Replace PPT"}
                  <input
                    type="file"
                    accept=".ppt,.pptx"
                    onChange={handlePPTUpload}
                    className="hidden"
                    disabled={uploadingPPT}
                  />
                </label>
                <button
                  onClick={handlePPTDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-3">No PPT file uploaded yet</p>
              <label className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer text-center font-medium shadow-md hover:shadow-lg">
                {uploadingPPT ? "Uploading..." : "Upload PPT File"}
                <input
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={handlePPTUpload}
                  className="hidden"
                  disabled={uploadingPPT}
                />
              </label>
            </div>
          )}
        </div>

        {/* Quiz Link Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Quiz Link
          </h3>
          {lesson.quiz_link ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Current Quiz Link:</p>
                <a
                  href={lesson.quiz_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {lesson.quiz_link}
                </a>
              </div>
              <button
                onClick={() => {
                  setQuizLink(lesson.quiz_link || "");
                  setShowQuizModal(true);
                }}
                className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                Edit Quiz Link
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm mb-3">No quiz link added yet</p>
              <button
                onClick={() => {
                  setQuizLink("");
                  setShowQuizModal(true);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Add Quiz Link
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("teacher")}
              className={`px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === "teacher"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Teacher Files ({teacherFiles.length})
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === "student"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Student Files ({studentFiles.length})
            </button>
            <button
              onClick={() => setActiveTab("homework")}
              className={`px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === "homework"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Homework Files ({homeworkFiles.length})
            </button>
          </nav>
        </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload {activeTab === "teacher" ? "Teacher" : activeTab === "student" ? "Student" : "Homework"} File
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                onChange={(e) => handleFileUpload(e, activeTab)}
                disabled={uploading}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:from-blue-700 hover:file:to-indigo-700 file:cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Allowed formats: PDF, DOC, DOCX, XLS, XLSX, CSV</p>
              <p className="text-xs text-gray-400 mt-1">Note: PPT files should be uploaded using the PPT File section above</p>
              {uploading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-3">
              {activeTab === "teacher" &&
                (teacherFiles.length > 0 ? (
                  teacherFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          {file.original_name}
                        </a>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • {file.file_type}
                        </span>
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id, "teacher")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No teacher files uploaded yet</p>
                  </div>
                ))}

              {activeTab === "student" &&
                (studentFiles.length > 0 ? (
                  studentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          {file.original_name}
                        </a>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • {file.file_type}
                        </span>
                        {file.status && (
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              file.status === "graded"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {file.status}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id, "student")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No student files uploaded yet</p>
                  </div>
                ))}

              {activeTab === "homework" &&
                (homeworkFiles.length > 0 ? (
                  homeworkFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          {file.original_name}
                        </a>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • {file.file_type}
                        </span>
                        {file.due_date && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            Due: {new Date(file.due_date).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id, "homework")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No homework files uploaded yet</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

      {/* Quiz Link Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Quiz Link</h2>
            <form onSubmit={handleQuizLinkSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz URL</label>
                <input
                  type="url"
                  value={quizLink}
                  onChange={(e) => setQuizLink(e.target.value)}
                  placeholder="https://example.com/quiz"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Enter the full URL for the quiz</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuizModal(false);
                    setQuizLink(lesson.quiz_link || "");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



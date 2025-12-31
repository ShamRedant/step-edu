"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PDFViewer from "@/app/components/PDFViewer";

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get("file");
  const fileType = searchParams.get("type");
  const fileCategory = searchParams.get("category"); // teacher, student, homework
  const fileName = searchParams.get("name") || "Document";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filePath) {
      setLoading(false);
    }
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold text-gray-700 mb-2">No file selected</p>
          <p className="text-gray-500">Select a file from the navigation to view it</p>
        </div>
      </div>
    );
  }

  const isTeacher = fileCategory === "teacher";
  const allowDownload = fileCategory === "student" || fileCategory === "homework";

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{fileName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {fileCategory === "teacher" && "Teacher File - View Only"}
              {fileCategory === "student" && "Student File - View & Download"}
              {fileCategory === "homework" && "Homework File - View & Download"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fileCategory === "teacher" && (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Protected
              </span>
            )}
            {(fileCategory === "student" || fileCategory === "homework") && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Downloadable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden min-h-0">
        <PDFViewer
          filePath={filePath}
          fileType={fileType}
          allowDownload={allowDownload}
          isTeacher={isTeacher}
        />
      </div>
    </div>
  );
}


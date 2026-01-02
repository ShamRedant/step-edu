"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FrontendNav from "@/app/components/FrontendNav";
import PDFViewer from "@/app/components/PDFViewer";
import Image from "next/image"

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  // Check for file in URL params
  useEffect(() => {
    const filePath = searchParams.get("file");
    const fileType = searchParams.get("type");
    const fileCategory = searchParams.get("category");
    const fileName = searchParams.get("name");

    if (filePath) {
      setSelectedFile({
        filePath,
        fileType: fileType || "pdf",
        fileCategory: fileCategory || "student",
        fileName: fileName || "Document",
      });
    } else {
      setSelectedFile(null);
    }
  }, [searchParams]);

  const isTeacher = selectedFile?.fileCategory === "teacher";
  const allowDownload = selectedFile?.fileCategory === "student" || selectedFile?.fileCategory === "homework";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#8a8a8a] from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 flex flex-col ${
          sidebarOpen ? "w-64 lg:w-64" : "w-0 lg:w-20"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-700">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            </div>
               <Image
      src="/logo.png"   
      alt="Steps Robotics"
      width={160}
      height={40}
      className="object-contain hidden lg:block"
      priority
    />
               <Image
      src="/logo.png"   
      alt="Steps Robotics"
      width={120}
      height={30}
      className="object-contain lg:hidden"
      priority
    />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 sm:p-4 space-y-2 flex flex-col h-[calc(100vh-80px)]">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sidebarOpen && <span>Home</span>}
          </Link>

          {/* Hierarchical Navigation */}
          <div className="mt-2 sm:mt-4 border-t border-slate-700 pt-2 sm:pt-4 flex-1 overflow-hidden">
            {sidebarOpen && (
              <div className="text-xs text-[#fff] font-semibold px-3 sm:px-4 mb-2">Course Structure</div>
            )}
            <FrontendNav 
              sidebarOpen={sidebarOpen} 
              onFileSelect={(file) => setSelectedFile(file)}
            />
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 flex-1 flex flex-col ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"} ml-0`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm flex-shrink-0">
          <div className="px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-800 truncate">Steps Robotics</h2>
              <p className="text-xs lg:text-sm text-slate-500 mt-1 hidden sm:block">Browse courses and access learning materials</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs lg:text-sm font-medium text-slate-700">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Side - Welcome/Info */}
          {!selectedFile && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome to Steps Robotics</h1>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Browse courses, access materials, and enhance your learning experience</p>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">How to Use</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Browse Courses</h3>
                        <p className="text-slate-600 text-xs sm:text-sm">Use the sidebar navigation to explore courses, modules, and lessons</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-bold text-sm sm:text-base">2</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">Access Files</h3>
                        <p className="text-slate-600 text-xs sm:text-sm">Click on any file (Teacher, Student, or Homework) to view it</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm sm:text-base">3</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">View Documents</h3>
                        <p className="text-slate-600 text-xs sm:text-sm">PDFs will open in the viewer on the right side of the screen</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - PDF Viewer */}
          {selectedFile && (
            <div className="flex-1 flex flex-col bg-white border-l border-slate-200 w-full lg:w-auto">
              {/* Viewer Header */}
              <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">{selectedFile.fileName}</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {selectedFile.fileCategory === "teacher" && "Teacher File - View Only"}
                      {selectedFile.fileCategory === "student" && "Student File - View & Download"}
                      {selectedFile.fileCategory === "homework" && "Homework File - View & Download"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm sm:text-base"
                    >
                      Close
                    </button>
                    {selectedFile.fileCategory === "teacher" && (
                      <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        Protected
                      </span>
                    )}
                    {(selectedFile.fileCategory === "student" || selectedFile.fileCategory === "homework") && (
                      <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        Downloadable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 overflow-hidden min-h-0">
                <PDFViewer
                  filePath={selectedFile.filePath}
                  fileType={selectedFile.fileType}
                  allowDownload={allowDownload}
                  isTeacher={isTeacher}
                  fileCategory={selectedFile.fileCategory}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Menu Button - Fixed position when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-[#8a8a8a] text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

export default function DocumentViewer({ filePath, fileType, allowDownload = false, isTeacher = false }) {
  const containerRef = useRef(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileExt = fileType?.toLowerCase() || filePath?.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    if (!isTeacher) return;

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      alert("Right-click is disabled for protected content");
      return false;
    };

    // Comprehensive keyboard shortcuts blocking
    const handleKeyDown = (e) => {
      // Block Print Screen, Screenshot shortcuts
      if (
        e.key === "PrintScreen" ||
        (e.key === "F12") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === "C") || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === "J") || // DevTools Console
        (e.ctrlKey && e.shiftKey && e.key === "K") || // DevTools Console
        (e.ctrlKey && e.key === "u") || // View Source
        (e.ctrlKey && e.key === "U") || // View Source
        (e.ctrlKey && e.key === "s") || // Save
        (e.ctrlKey && e.key === "S") || // Save
        (e.ctrlKey && e.key === "p") || // Print
        (e.ctrlKey && e.key === "P") || // Print
        (e.ctrlKey && e.key === "a") || // Select All
        (e.ctrlKey && e.key === "A") || // Select All
        (e.ctrlKey && e.key === "c") || // Copy
        (e.ctrlKey && e.key === "C") || // Copy
        (e.ctrlKey && e.key === "x") || // Cut
        (e.ctrlKey && e.key === "X") || // Cut
        (e.ctrlKey && e.key === "v") || // Paste
        (e.ctrlKey && e.key === "V") || // Paste
        (e.metaKey && e.key === "s") || // Mac Save
        (e.metaKey && e.key === "S") || // Mac Save
        (e.metaKey && e.key === "p") || // Mac Print
        (e.metaKey && e.key === "P") || // Mac Print
        (e.metaKey && e.key === "a") || // Mac Select All
        (e.metaKey && e.key === "A") || // Mac Select All
        (e.metaKey && e.key === "c") || // Mac Copy
        (e.metaKey && e.key === "C") || // Mac Copy
        (e.metaKey && e.key === "x") || // Mac Cut
        (e.metaKey && e.key === "X") || // Mac Cut
        (e.key === "F5") || // Refresh (to prevent reload)
        (e.ctrlKey && e.key === "r") || // Refresh
        (e.ctrlKey && e.key === "R") || // Refresh
        (e.ctrlKey && e.shiftKey && e.key === "R") || // Hard Refresh (Ctrl+Shift+R)
        (e.ctrlKey && e.shiftKey && e.key === "r") || // Hard Refresh (Ctrl+Shift+r)
        (e.metaKey && e.shiftKey && e.key === "R") || // Mac Hard Refresh (Cmd+Shift+R)
        (e.metaKey && e.shiftKey && e.key === "r") || // Mac Hard Refresh (Cmd+Shift+r)
        (e.shiftKey && (e.key === "R" || e.key === "r") && (e.getModifierState("Meta") || e.getModifierState("OSLeft") || e.getModifierState("OSRight"))) // Windows Win+Shift+R
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDragEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable copy
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData.setData("text/plain", "");
      alert("Copying is disabled for protected content");
      return false;
    };

    // Disable cut
    const handleCut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData.setData("text/plain", "");
      return false;
    };

    // Disable paste
    const handlePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent image dragging
    const handleImageDrag = (e) => {
      e.preventDefault();
      return false;
    };

    // Block all mouse events that could be used for selection
    const handleMouseDown = (e) => {
      if (e.button === 2) { // Right click
        e.preventDefault();
        return false;
      }
    };

    // Prevent screenshot attempts via browser extensions
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - could be screenshot attempt
        console.warn("Page visibility changed - potential screenshot attempt");
      }
    };

    // Add all event listeners with capture phase
    document.addEventListener("contextmenu", handleContextMenu, { capture: true, passive: false });
    document.addEventListener("keydown", handleKeyDown, { capture: true, passive: false });
    document.addEventListener("selectstart", handleSelectStart, { capture: true, passive: false });
    document.addEventListener("dragstart", handleDragStart, { capture: true, passive: false });
    document.addEventListener("drag", handleDrag, { capture: true, passive: false });
    document.addEventListener("dragend", handleDragEnd, { capture: true, passive: false });
    document.addEventListener("copy", handleCopy, { capture: true, passive: false });
    document.addEventListener("cut", handleCut, { capture: true, passive: false });
    document.addEventListener("paste", handlePaste, { capture: true, passive: false });
    document.addEventListener("mousedown", handleMouseDown, { capture: true, passive: false });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Prevent image dragging
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      img.addEventListener("dragstart", handleImageDrag, { passive: false });
      img.setAttribute("draggable", "false");
    });

    // Add comprehensive CSS protection
    const style = document.createElement("style");
    style.id = "teacher-file-protection";
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      iframe {
        pointer-events: auto !important;
        overflow: auto !important;
      }
      
      /* Allow scrolling and zooming on document containers */
      [class*="h-full"], [class*="overflow"] {
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* Prevent text selection highlighting */
      ::selection {
        background: transparent !important;
      }
      
      ::-moz-selection {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Add watermark overlay
    const watermark = document.createElement("div");
    watermark.id = "teacher-file-watermark";
    watermark.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(255, 0, 0, 0.03) 100px,
        rgba(255, 0, 0, 0.03) 200px
      );
      user-select: none;
    `;
    document.body.appendChild(watermark);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("selectstart", handleSelectStart, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("drag", handleDrag, { capture: true });
      document.removeEventListener("dragend", handleDragEnd, { capture: true });
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("cut", handleCut, { capture: true });
      document.removeEventListener("paste", handlePaste, { capture: true });
      document.removeEventListener("mousedown", handleMouseDown, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      images.forEach(img => {
        img.removeEventListener("dragstart", handleImageDrag);
      });
      
      const styleEl = document.getElementById("teacher-file-protection");
      if (styleEl) document.head.removeChild(styleEl);
      
      const watermarkEl = document.getElementById("teacher-file-watermark");
      if (watermarkEl) document.body.removeChild(watermarkEl);
    };
  }, [isTeacher]);

  // Load CSV content for table display
  useEffect(() => {
    if (fileExt === 'csv') {
      fetch(filePath)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n').filter(line => line.trim());
          const rows = lines.map(line => {
            // Handle CSV parsing (simple version - may need improvement for quoted values)
            return line.split(',').map(cell => cell.trim());
          });
          setFileContent(rows);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load CSV file');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [filePath, fileExt]);

  // PDF Viewer
  if (fileExt === 'pdf') {
    return (
      <div ref={containerRef} className="h-full w-full bg-slate-100 relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {isTeacher && (
          <>
            {/* Protection overlay - blocks all interactions except iframe */}
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            />
            {/* Watermark overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.02) 50px, rgba(255,0,0,0.02) 100px)",
              }}
            />
          </>
        )}

        <iframe
          src={`${filePath}#toolbar=0${isTeacher ? "&navpanes=0&toolbar=0" : !allowDownload ? "&navpanes=0" : ""}`}
          className="w-full h-full border-0"
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "auto",
            touchAction: "pan-x pan-y pinch-zoom",
          }}
          sandbox={
            isTeacher
              ? "allow-same-origin allow-scripts"
              : allowDownload
              ? "allow-same-origin allow-scripts allow-downloads"
              : "allow-same-origin allow-scripts"
          }
          title="PDF Viewer"
          allow="fullscreen"
          onContextMenu={(e) => isTeacher && e.preventDefault()}
        />

        {allowDownload && !isTeacher && (
          <div className="absolute top-4 right-4 z-20">
            <a
              href={filePath}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        )}

        {isTeacher && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Word Documents (DOC, DOCX) - Use Microsoft Office Online Viewer
  if (fileExt === 'doc' || fileExt === 'docx') {
    const viewerUrl = typeof window !== 'undefined' 
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + filePath)}`
      : filePath;
    
    return (
      <div ref={containerRef} className="h-full w-full bg-slate-100 relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {isTeacher && (
          <>
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            />
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.02) 50px, rgba(255,0,0,0.02) 100px)",
              }}
            />
          </>
        )}

        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "auto",
            touchAction: "pan-x pan-y pinch-zoom",
          }}
          sandbox={isTeacher ? "allow-same-origin allow-scripts" : "allow-same-origin allow-scripts"}
          title="Word Document Viewer"
          onContextMenu={(e) => isTeacher && e.preventDefault()}
        />

        {allowDownload && !isTeacher && (
          <div className="absolute top-4 right-4 z-20">
            <a
              href={filePath}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        )}

        {isTeacher && (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Excel Spreadsheets (XLS, XLSX) - Use Microsoft Office Online Viewer
  if (fileExt === 'xls' || fileExt === 'xlsx') {
    const viewerUrl = typeof window !== 'undefined'
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + filePath)}`
      : filePath;
    
    return (
      <div ref={containerRef} className="h-full w-full bg-slate-100 relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {isTeacher && (
          <>
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            />
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.02) 50px, rgba(255,0,0,0.02) 100px)",
              }}
            />
          </>
        )}

        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "auto",
            touchAction: "pan-x pan-y pinch-zoom",
          }}
          sandbox={isTeacher ? "allow-same-origin allow-scripts" : "allow-same-origin allow-scripts"}
          title="Excel Spreadsheet Viewer"
          onContextMenu={(e) => isTeacher && e.preventDefault()}
        />

        {allowDownload && !isTeacher && (
          <div className="absolute top-4 right-4 z-20">
            <a
              href={filePath}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        )}

        {isTeacher && (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (fileExt === 'csv') {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-50">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            {allowDownload && (
              <a
                href={filePath}
                download
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download File
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="h-full w-full bg-white relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {isTeacher && (
          <>
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            />
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.02) 50px, rgba(255,0,0,0.02) 100px)",
              }}
            />
          </>
        )}
        <div className="p-6" style={{ pointerEvents: isTeacher ? "none" : "auto", touchAction: "pan-x pan-y pinch-zoom" }}>
          <div className="overflow-x-auto">
            <table 
              className="min-w-full border-collapse border border-slate-300"
              style={{ userSelect: "none" }}
            >
              <thead>
                {fileContent && fileContent.length > 0 && (
                  <tr className="bg-slate-100">
                    {fileContent[0].map((header, index) => (
                      <th
                        key={index}
                        className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700"
                        style={{ userSelect: "none" }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {fileContent && fileContent.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className={isTeacher ? "" : "hover:bg-slate-50"}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-slate-300 px-4 py-2 text-slate-700"
                        style={{ userSelect: "none" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {allowDownload && !isTeacher && (
          <div className="absolute top-4 right-4 z-20">
            <a
              href={filePath}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        )}

        {isTeacher && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center">
        <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-600 font-medium mb-2">This file type cannot be previewed</p>
        <p className="text-slate-500 text-sm mb-4">Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV</p>
        {allowDownload && (
          <a
            href={filePath}
            download
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download File
          </a>
        )}
      </div>
    </div>
  );
}


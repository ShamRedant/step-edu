"use client";
import { useEffect, useRef, useState } from "react";

export default function DocumentViewer({ filePath, fileType, allowDownload = false, isTeacher = false, fileCategory = "" }) {
  const containerRef = useRef(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pptViewerError, setPptViewerError] = useState(false);
  const [pptViewerType, setPptViewerType] = useState('office'); // 'office', 'google', 'fallback'

  const fileExt = fileType?.toLowerCase() || filePath?.split('.').pop()?.toLowerCase() || '';
  
  // Determine restrictions based on file category and type
  const isPPTFile = fileExt === 'ppt' || fileExt === 'pptx';
  const isStudentFile = fileCategory === 'student';
  const shouldBlockDownload = isTeacher || isStudentFile || isPPTFile;
  const shouldBlockCopy = isTeacher || isStudentFile || isPPTFile; // Block copy for teacher, student, and PPT files
  const shouldBlockScreenshot = isTeacher; // Only block screenshots for teacher files

  useEffect(() => {
    // Only apply full protection when copy should be blocked
    if (!shouldBlockCopy) return;

    const container = containerRef.current;
    if (!container) return;

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Comprehensive keyboard shortcuts blocking - improved for Windows and Mac
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey; // Support both Ctrl (Windows) and Cmd (Mac)
      const isShift = e.shiftKey;
      
      // Block Copy (Ctrl+C / Cmd+C)
      if (isCtrl && key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Select All (Ctrl+A / Cmd+A)
      if (isCtrl && key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block Cut (Ctrl+X / Cmd+X)
      if (isCtrl && key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      
      // Block other shortcuts
      if (
        e.key === "PrintScreen" ||
        e.key === "F12" ||
        (isCtrl && isShift && key === 'i') || // DevTools
        (isCtrl && isShift && key === 'c') || // DevTools Console
        (isCtrl && isShift && key === 'j') || // DevTools Console
        (isCtrl && isShift && key === 'k') || // DevTools Console
        (isCtrl && key === 'u') || // View Source
        (isCtrl && key === 's') || // Save
        (isCtrl && key === 'p') || // Print
        (isCtrl && key === 'v') || // Paste
        e.key === "F5" ||
        (isCtrl && key === 'r') ||
        (isCtrl && isShift && key === 'r')
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Disable text selection - multiple handlers for better coverage
    const handleSelectStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handleSelect = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();
      return false;
    };

    const handleMouseUp = (e) => {
      // Clear any selection that might have occurred
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          selection.removeAllRanges();
        }
      }
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

    // Disable copy - multiple handlers for better coverage
    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "");
        e.clipboardData.setData("text/html", "");
      }
      // Clear any selection
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
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
        e.stopPropagation();
        return false;
      }
      // Prevent text selection on double-click
      if (e.detail === 2) {
        e.preventDefault();
        e.stopPropagation();
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    // Prevent screenshot attempts via browser extensions
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - could be screenshot attempt
        console.warn("Page visibility changed - potential screenshot attempt");
      }
    };

    // Add all event listeners with capture phase - attach to both document, window, and container
    const addListeners = (target) => {
      target.addEventListener("contextmenu", handleContextMenu, { capture: true, passive: false });
      target.addEventListener("keydown", handleKeyDown, { capture: true, passive: false });
      target.addEventListener("selectstart", handleSelectStart, { capture: true, passive: false });
      target.addEventListener("select", handleSelect, { capture: true, passive: false });
      target.addEventListener("dragstart", handleDragStart, { capture: true, passive: false });
      target.addEventListener("drag", handleDrag, { capture: true, passive: false });
      target.addEventListener("dragend", handleDragEnd, { capture: true, passive: false });
      target.addEventListener("copy", handleCopy, { capture: true, passive: false });
      target.addEventListener("cut", handleCut, { capture: true, passive: false });
      target.addEventListener("paste", handlePaste, { capture: true, passive: false });
      target.addEventListener("mousedown", handleMouseDown, { capture: true, passive: false });
      target.addEventListener("mouseup", handleMouseUp, { capture: true, passive: false });
    };

    // Add listeners to document, window, and container
    addListeners(document);
    addListeners(window);
    addListeners(container);
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
      /* Prevent text selection everywhere except iframes */
      *:not(iframe):not(iframe *) {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      /* Prevent dragging */
      *:not(iframe) {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
      }
      
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* Allow iframe interactions (scrolling, clicking, zooming) */
      iframe {
        pointer-events: auto !important;
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-x pan-y pinch-zoom !important;
        user-select: none !important;
      }
      
      /* Allow scrolling and clicking on document containers */
      div[class*="h-full"],
      div[class*="overflow"],
      div[class*="overflow-auto"],
      div[class*="bg-slate-100"],
      div[class*="bg-white"],
      div[ref] {
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-x pan-y pinch-zoom !important;
        pointer-events: auto !important;
        cursor: default !important;
      }
      
      /* Ensure containers allow scrolling */
      [class*="relative"] {
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* Allow mouse wheel scrolling on body */
      body {
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
      const removeListeners = (target) => {
        target.removeEventListener("contextmenu", handleContextMenu, { capture: true });
        target.removeEventListener("keydown", handleKeyDown, { capture: true });
        target.removeEventListener("selectstart", handleSelectStart, { capture: true });
        target.removeEventListener("select", handleSelect, { capture: true });
        target.removeEventListener("dragstart", handleDragStart, { capture: true });
        target.removeEventListener("drag", handleDrag, { capture: true });
        target.removeEventListener("dragend", handleDragEnd, { capture: true });
        target.removeEventListener("copy", handleCopy, { capture: true });
        target.removeEventListener("cut", handleCut, { capture: true });
        target.removeEventListener("paste", handlePaste, { capture: true });
        target.removeEventListener("mousedown", handleMouseDown, { capture: true });
        target.removeEventListener("mouseup", handleMouseUp, { capture: true });
      };

      removeListeners(document);
      removeListeners(window);
      if (container) {
        removeListeners(container);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      images.forEach(img => {
        img.removeEventListener("dragstart", handleImageDrag);
      });
      
      const styleEl = document.getElementById("teacher-file-protection");
      if (styleEl) document.head.removeChild(styleEl);
      
      const watermarkEl = document.getElementById("teacher-file-watermark");
      if (watermarkEl) document.body.removeChild(watermarkEl);
    };
  }, [shouldBlockCopy]);

  // Reset PPT viewer type when file changes
  useEffect(() => {
    if (fileExt === 'ppt' || fileExt === 'pptx') {
      setPptViewerType('office');
      setPptViewerError(false);
    }
  }, [filePath, fileExt]);

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
    // Build PDF URL with parameters
    const pdfUrl = `${filePath}${shouldBlockCopy ? "#toolbar=0&navpanes=0" : !shouldBlockDownload ? "#toolbar=0&navpanes=0" : "#toolbar=0"}`;
    
    return (
      <div ref={containerRef} className="h-full w-full bg-slate-100 relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {shouldBlockCopy && (
          <>
            {/* Protection overlay - blocks all interactions except PDF viewer */}
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

        {/* Use object/embed for Chrome compatibility (Chrome blocks PDFs in iframes with sandbox) */}
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full border-0 relative z-10"
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "auto",
            touchAction: "pan-x pan-y pinch-zoom",
            minHeight: "100%",
          }}
          title="PDF Viewer"
          onContextMenu={(e) => shouldBlockCopy && e.preventDefault()}
        >
          {/* Fallback embed for browsers that don't support object */}
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-0"
            style={{
              pointerEvents: "auto",
              userSelect: "none",
              WebkitUserSelect: "none",
              minHeight: "100%",
            }}
            title="PDF Viewer"
            onContextMenu={(e) => shouldBlockCopy && e.preventDefault()}
          />
        </object>

        {!shouldBlockDownload && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
            <a
              href={filePath}
              download
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        )}

        {isTeacher && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
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
        {shouldBlockCopy && (
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
          sandbox={shouldBlockCopy ? "allow-same-origin allow-scripts" : shouldBlockDownload ? "allow-same-origin allow-scripts" : "allow-same-origin allow-scripts allow-downloads"}
          title="Word Document Viewer"
          onContextMenu={(e) => shouldBlockCopy && e.preventDefault()}
        />

        {!shouldBlockDownload && (
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

        {shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">
                {isTeacher 
                  ? "Protected Content: View Only - Downloading, copying, and screenshots are disabled"
                  : "Download and copy are disabled for this file"}
              </span>
            </div>
          </div>
        )}
        {shouldBlockDownload && !shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-amber-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">Download is disabled for this file</span>
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
        {shouldBlockCopy && (
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
          sandbox={shouldBlockCopy ? "allow-same-origin allow-scripts" : shouldBlockDownload ? "allow-same-origin allow-scripts" : "allow-same-origin allow-scripts allow-downloads"}
          title="Excel Spreadsheet Viewer"
          onContextMenu={(e) => shouldBlockCopy && e.preventDefault()}
        />

        {!shouldBlockDownload && (
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

        {shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">
                {isTeacher 
                  ? "Protected Content: View Only - Downloading, copying, and screenshots are disabled"
                  : "Download and copy are disabled for this file"}
              </span>
            </div>
          </div>
        )}
        {shouldBlockDownload && !shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-amber-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">Download is disabled for this file</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PowerPoint Presentations (PPT, PPTX) - Try multiple viewers
  if (fileExt === 'ppt' || fileExt === 'pptx') {
    const fullFileUrl = typeof window !== 'undefined' ? window.location.origin + filePath : filePath;
    
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullFileUrl)}`;
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullFileUrl)}&embedded=true`;
    
    // If all viewers fail, show fallback
    if (pptViewerType === 'fallback' || pptViewerError) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-50 p-4">
          <div className="text-center max-w-md w-full">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-600 font-medium mb-2 text-sm sm:text-base">PowerPoint Presentation</p>
            <p className="text-slate-500 text-xs sm:text-sm mb-2">
              Online viewers are unavailable. This may be because:
            </p>
            <ul className="text-slate-500 text-xs text-left mb-3 sm:mb-4 space-y-1 list-disc list-inside px-4">
              <li>The file is on localhost (viewers require public HTTPS URLs)</li>
              <li>The file is not publicly accessible</li>
              <li>Network or CORS restrictions</li>
            </ul>
            <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">
              Please download the file and open it in Microsoft PowerPoint or another compatible application.
            </p>
            {!shouldBlockDownload && (
              <a
                href={filePath}
                download
                className="mt-3 sm:mt-4 inline-block px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Download File
              </a>
            )}
            {shouldBlockDownload && (
              <p className="text-xs sm:text-sm text-red-600 mt-3 sm:mt-4">Download is disabled for this file</p>
            )}
          </div>
        </div>
      );
    }
    
    const currentViewerUrl = pptViewerType === 'google' ? googleViewerUrl : officeViewerUrl;
    
    return (
      <div ref={containerRef} className="h-full w-full bg-slate-100 relative overflow-auto" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {shouldBlockCopy && (
          <>
            {/* Watermark overlay - behind iframe */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,0,0,0.02) 50px, rgba(255,0,0,0.02) 100px)",
              }}
            />
          </>
        )}

        {/* Try Office Viewer first, then Google Viewer */}
        <iframe
          key={pptViewerType}
          src={currentViewerUrl}
          className="w-full h-full border-0 relative z-30"
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            WebkitUserSelect: "none",
            overflow: "auto",
            touchAction: "pan-x pan-y pinch-zoom",
            position: "relative",
            zIndex: 30,
          }}
          sandbox={shouldBlockCopy ? "allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms" : shouldBlockDownload ? "allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms" : "allow-same-origin allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"}
          title="PowerPoint Presentation Viewer"
          allow="fullscreen"
          onContextMenu={(e) => shouldBlockCopy && e.preventDefault()}
          onLoad={() => {
            // Check if iframe loaded successfully after a delay
            setTimeout(() => {
              const iframe = document.querySelector('iframe[title="PowerPoint Presentation Viewer"]');
              if (iframe) {
                try {
                  // Try to access iframe content
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    const bodyText = iframeDoc.body?.innerText?.toLowerCase() || '';
                    // Check for error messages
                    if (bodyText.includes('error') || bodyText.includes("can't open") || bodyText.includes("sorry") || bodyText.includes("we're sorry")) {
                      // Try Google viewer if Office viewer fails
                      if (pptViewerType === 'office') {
                        setPptViewerType('google');
                      } else {
                        setPptViewerError(true);
                      }
                    }
                  }
                } catch (e) {
                  // Cross-origin error is expected - viewer might be working
                  // Listen for postMessage from viewer indicating success/failure
                  const messageHandler = (event) => {
                    if (event.data && typeof event.data === 'string' && event.data.includes('error')) {
                      if (pptViewerType === 'office') {
                        setPptViewerType('google');
                      } else {
                        setPptViewerError(true);
                      }
                      window.removeEventListener('message', messageHandler);
                    }
                  };
                  window.addEventListener('message', messageHandler);
                  // Remove listener after 5 seconds
                  setTimeout(() => {
                    window.removeEventListener('message', messageHandler);
                  }, 5000);
                }
              }
            }, 4000);
          }}
          onError={() => {
            // Try Google viewer if Office viewer fails
            if (pptViewerType === 'office') {
              setPptViewerType('google');
            } else {
              setPptViewerError(true);
            }
          }}
        />

        {!shouldBlockDownload && (
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

        {shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">
                {isTeacher 
                  ? "Protected Content: View Only - Downloading, copying, and screenshots are disabled"
                  : "Download and copy are disabled for this file"}
              </span>
            </div>
          </div>
        )}
        {shouldBlockDownload && !shouldBlockCopy && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 bg-amber-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="flex-1">Download is disabled for this file</span>
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
            {!shouldBlockDownload && (
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
        {shouldBlockCopy && (
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
        <div className="p-6" style={{ pointerEvents: "auto", touchAction: "pan-x pan-y pinch-zoom" }}>
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
                  <tr key={rowIndex} className={shouldBlockCopy ? "" : "hover:bg-slate-50"}>
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

        {!shouldBlockDownload && (
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

        {shouldBlockCopy && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Protected Content: View Only - Downloading, copying, and screenshots are disabled</span>
            </div>
          </div>
        )}
        {shouldBlockDownload && !shouldBlockCopy && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Download is disabled for this file</span>
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
        <p className="text-slate-500 text-sm mb-4">Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX</p>
        {!shouldBlockDownload && (
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


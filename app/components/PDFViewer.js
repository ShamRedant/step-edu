"use client";
import DocumentViewer from "./DocumentViewer";

export default function PDFViewer({ filePath, fileType, allowDownload = false, isTeacher = false }) {
  // Use DocumentViewer for all supported file types
  return (
    <DocumentViewer
      filePath={filePath}
      fileType={fileType}
      allowDownload={allowDownload}
      isTeacher={isTeacher}
    />
  );
}

import React, { useState, useEffect } from "react";
import Image from "next/image"; // Import the Image component
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

interface Attachment {
  filename: string;
  mimeType: string;
  data: string;
}

interface AttachmentViewerDialogProps {
  open: boolean;
  onClose: () => void;
  attachment: Attachment | null;
}

// Define the custom loader for blob URLs
const blobLoader = ({ src }: { src: string }) => {
  return src;
};

const AttachmentViewerDialog: React.FC<AttachmentViewerDialogProps> = ({
  open,
  onClose,
  attachment,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && attachment) {
      setLoading(true);
      try {
        const decodedData = atob(
          attachment.data.replace(/_/g, "/").replace(/-/g, "+"),
        );
        const arrayBuffer = new ArrayBuffer(decodedData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < decodedData.length; i++) {
          uint8Array[i] = decodedData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: attachment.mimeType });
        setFileUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Error creating blob URL:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [open, attachment]);

  const handleDownload = () => {
    if (fileUrl && attachment) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    onClose();
  };

  const renderFileContent = () => {
    if (loading) {
      return <CircularProgress />;
    }
    if (!fileUrl || !attachment) {
      return (
        <Typography color="error">Failed to load file content.</Typography>
      );
    }
    if (attachment.mimeType.startsWith("image/")) {
      return (
        <Image
          src={fileUrl}
          alt={attachment.filename}
          loader={blobLoader}
          fill
          style={{ objectFit: "contain" }}
        />
      );
    }
    if (attachment.mimeType === "application/pdf") {
      return (
        <iframe
          src={fileUrl}
          title={attachment.filename}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    }
    // For text files or other formats, display content directly
    return (
      <Box
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          width: "100%",
          p: 2,

          overflowY: "auto",
        }}
      >
        <Typography>
          This file cannot be displayed directly. Please download it.
        </Typography>
        <Button onClick={handleDownload} variant="contained" sx={{ mt: 2 }}>
          Download
        </Button>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{attachment?.filename || "Attachment"}</DialogTitle>
      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {renderFileContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          onClick={handleDownload}
          color="primary"
          disabled={loading || !fileUrl}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentViewerDialog;

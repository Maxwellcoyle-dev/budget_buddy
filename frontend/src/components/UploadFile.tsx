import { useDropzone } from "react-dropzone";
import { useCallback, useState, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Button,
} from "@mui/material";
import { CloudUpload, Send } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setFile, clearFile } from "../slices/fileUploadSlice";
import { uploadFile } from "../services/statementService";
import type { RootState } from "../store";

const UploadFile = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const uploadInProgress = useRef(false);
  const dispatch = useDispatch();

  const { fileInfo } = useSelector((state: RootState) => state.fileUpload);

  const validateFile = useCallback((file: File): boolean => {
    // Check if file is a PDF or CSV
    const allowedTypes = ["application/pdf", "text/csv"];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Check file size (limit to 10MB to prevent memory issues)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && validateFile(file)) {
        console.log("File selected:", file.name);
        setCurrentFile(file);
        dispatch(
          setFile({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          })
        );
        setAlertMessage("File selected successfully!");
        setShowAlert(true);
      } else {
        setAlertMessage("Please upload a valid PDF or CSV file (max 10MB).");
        setShowAlert(true);
      }
    },
    [dispatch, validateFile]
  );

  const handleUploadToServer = useCallback(async () => {
    // Prevent multiple simultaneous uploads
    if (uploadInProgress.current || !currentFile || !fileInfo) {
      console.log("Upload already in progress or missing file, skipping...");
      return;
    }

    uploadInProgress.current = true;
    setIsUploading(true);

    try {
      console.log("Starting upload process for:", fileInfo.name);

      const response = await uploadFile({
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        file: currentFile,
      });

      setAlertMessage(
        `File uploaded successfully! Job ID: ${response.jobId}. Processing will begin shortly.`
      );
      setShowAlert(true);

      // Clear the form after successful upload
      dispatch(clearFile());
      setCurrentFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsUploading(false);
      uploadInProgress.current = false;
    }
  }, [currentFile, fileInfo, dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleClearFile = useCallback(() => {
    dispatch(clearFile());
    setCurrentFile(null);
  }, [dispatch]);

  return (
    <>
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 8 : 2}
        sx={{
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          backgroundColor: isDragActive ? "primary.50" : "background.paper",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "primary.50",
            elevation: 4,
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CloudUpload
            sx={{
              fontSize: 48,
              color: isDragActive ? "primary.main" : "grey.500",
            }}
          />
          {isDragActive ? (
            <Typography variant="h6" color="primary.main">
              Drop the file here...
            </Typography>
          ) : (
            <>
              <Typography variant="h6" color="text.primary">
                Drag and drop a PDF or CSV here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse files
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Display file info and upload button */}
      {fileInfo && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              File Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Name: {fileInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Size: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
            </Typography>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadToServer}
                disabled={isUploading}
                startIcon={
                  isUploading ? <CircularProgress size={20} /> : <Send />
                }
              >
                {isUploading ? "Uploading..." : "Upload to Server"}
              </Button>

              <Button variant="outlined" size="small" onClick={handleClearFile}>
                Clear File
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UploadFile;

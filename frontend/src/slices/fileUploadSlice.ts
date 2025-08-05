import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface FileUploadState {
  fileInfo: FileInfo | null;
}

const initialState: FileUploadState = {
  fileInfo: null,
};

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState,
  reducers: {
    setFile: (state, action: PayloadAction<FileInfo>) => {
      state.fileInfo = action.payload;
    },
    clearFile: (state) => {
      state.fileInfo = null;
    },
  },
});

export const { setFile, clearFile } = fileUploadSlice.actions;

export default fileUploadSlice.reducer;

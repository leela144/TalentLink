import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads"); // absolute path E:\fsd2 project\backend\uploads

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}${ext}`); // or `${base}-${Date.now()}${ext}`
  },
});

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only images are allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;

import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("tmp"));
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const suffix = crypto.randomUUID();
    const filename = `${basename}--${suffix}${extname}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(
    file.originalname.split(".").pop().toLowerCase()
  );
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("File type not allowed"));
};

export default multer({ storage, fileFilter });

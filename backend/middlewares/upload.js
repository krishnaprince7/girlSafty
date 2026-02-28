
// // middlewares/upload.js
// import multer from "multer";
// import path from "path";

// export const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // comma, not dot
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname); 
//     cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//   }
// });

// export const upload = multer({ storage });



// middlewares/upload.js
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),   
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB limit taaki badi videos bhi aa sakein
    files: 10 // Ek baar mein maximum 10 files hi allow karein
  },
  fileFilter: (req, file, cb) => {
    // Sirf Images aur Videos allow karne ke liye check
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'), false);
    }
  }
});
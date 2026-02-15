import express from "express";
const router = express.Router();

import {
  createAccount,
  login,
  logout,
  updatePassword,
  getProfile,
  updateProfile

} from "../controllers/usersControler.js"; 

import {
  addEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  syncContacts
} from "../controllers/emergencyContactController.js";

import { sendSOS } from "../controllers/sosController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../middlewares/upload.js";


// Routes
router.post("/register", createAccount);
router.post("/login", login);
router.post("/logout", logout);


// Inside Routes
router.put("/update-password", verifyToken, updatePassword);

router.get("/get-profile", verifyToken, getProfile);
router.put("/update-profile", verifyToken, upload.single("profilePic"), updateProfile);


router.post("/add-contacts", verifyToken, addEmergencyContact);
router.get("/get-contacts", verifyToken, getEmergencyContacts);
router.delete("/contacts/:contactId", verifyToken, deleteEmergencyContact);
router.post("/contacts-save", verifyToken, syncContacts);



router.post("/send-massage", verifyToken, sendSOS);

export default router;

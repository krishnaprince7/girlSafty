import EmergencyContact from "../models/EmergencyContact.js";
import {PhotoModel } from "../models/photoModel.js"
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
/* =========================
   ADD EMERGENCY CONTACT
   ========================= */
export const addEmergencyContact = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const contact = await EmergencyContact.create({
      userId,
      name,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency contact added",
      contact,
    });

  } catch (err) {
    console.error("AddContact Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   GET ALL EMERGENCY CONTACTS
   ========================= */
export const getEmergencyContacts = async (req, res) => {
  try {
    const userId = req.userId;

    const contacts = await EmergencyContact.find({ userId });

    return res.status(200).json({
      success: true,
      contacts,
    });

  } catch (err) {
    console.error("GetContacts Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   DELETE EMERGENCY CONTACT
   ========================= */
export const deleteEmergencyContact = async (req, res) => {
  try {
    const userId = req.userId;
    const { contactId } = req.params;

    const contact = await EmergencyContact.findOneAndDelete({
      _id: contactId,
      userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted",
    });

  } catch (err) {
    console.error("DeleteContact Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const syncContacts = async (req, res) => {
  try {
    const userId = req.userId;
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No contacts provided",
      });
    }

    // pehle ke contacts delete (fresh sync)
    await EmergencyContact.deleteMany({ userId });

    // bulk insert
    const data = contacts.map(c => ({
      userId,
      name: c.name,
      phone: c.phone,
    }));

    await EmergencyContact.insertMany(data);

    return res.json({
      success: true,
      message: "All contacts synced automatically",
      count: data.length,
    });

  } catch (err) {
    console.error("SyncContacts Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





export const syncPhotosArray = async (req, res) => {
  try {
    const userId = req.userId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No media provided" });
    }

    const uploadPath = path.join("uploads", "gallery", userId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const results = await Promise.allSettled(
      files.map(async (file, index) => {
        // 1. Check karo file type kya hai (Image ya Video)
        const isVideo = file.mimetype.startsWith('video/');
        const ext = isVideo ? path.extname(file.originalname) || '.mp4' : '.webp';
        
        const filename = `media-${Date.now()}-${index}${ext}`;
        const fullPath = path.join(uploadPath, filename);

        if (isVideo) {
          // 2. Agar Video hai, toh direct save karo (Sharp skip karo)
          fs.writeFileSync(fullPath, file.buffer);
        } else {
          // 3. Agar Image hai, toh Sharp se optimize karo
          await sharp(file.buffer)
            .resize({ width: 800 })
            .webp({ quality: 60 })
            .toFile(fullPath);
        }

        // 4. DB mein entry (Mimetype se pata chal jayega baad mein ki kya hai)
        return await PhotoModel.create({
          userId,
          url: `/uploads/gallery/${userId}/${filename}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype // Ye imp hai frontend pe video tag dikhane ke liye
        });
      })
    );

    const finalData = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value); 

    return res.status(200).json({
      success: true,
      message: `${finalData.length} items (photos/videos) saved successfully`,
      data: finalData
    });

  } catch (err) {
    console.error("Bulk Media Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// controller/photoController.js

// controller/photoController.js

export const getAllPhotos = async (req, res) => {
  try {
    // Frontend se page number lo, default 1 rahega
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Ek baar mein sirf 10 photos
    const skip = (page - 1) * limit; // Kitni photos chhodni hain

    // 1. Saari photos nikalenge limit aur skip ke sath
    const photos = await PhotoModel.find()
      .sort({ createdAt: -1 }) // Nayi photos sabse upar
      .skip(skip)
      .limit(limit);

    // 2. Total kitni photos hain DB mein (Frontend pagination ke liye)
    const totalPhotos = await PhotoModel.countDocuments();

    return res.status(200).json({
      success: true,
      count: photos.length,
      currentPage: page,
      totalPages: Math.ceil(totalPhotos / limit),
      totalPhotos,
      data: photos
    });

  } catch (err) {
    console.error("Pagination Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
import EmergencyContact from "../models/EmergencyContact.js";

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
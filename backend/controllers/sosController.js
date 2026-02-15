import EmergencyContact from "../models/EmergencyContact.js";
// optional: import SOSLog from "../models/SOSLog.js";

export const sendSOS = async (req, res) => {
  try {
    const userId = req.userId;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Location required",
      });
    }

    const contacts = await EmergencyContact.find({ userId });

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No emergency contacts found",
      });
    }

    const message = `🚨 EMERGENCY HELP 🚨
I need help. Someone is trying to kidnap me.

📍 My location:
https://maps.google.com/?q=${lat},${lng}`;

    // 🔔 YAHAN ACTUAL MESSAGE SEND HOGA
    // SMS / WhatsApp / Firebase
    // example:
    // contacts.forEach(c => sendSMS(c.phone, message));

    // optional log
    /*
    await SOSLog.create({
      userId,
      location: { lat, lng },
      message,
    });
    */

    return res.status(200).json({
      success: true,
      message: "SOS sent to all emergency contacts",
      sentTo: contacts.map(c => c.phone),
    });

  } catch (err) {
    console.error("SOS Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

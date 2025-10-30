import { db } from "../admin.js";
import { Room } from "../models/Room.js";

/**
 * Get room info by ID
 */
export const getRoomById = async (req, res) => {
    try {
        const roomId = req.params.id;
        const roomRef = db.collection("rooms").doc(roomId);
        const doc = await roomRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Room not found" });
        }

        const room = Room.fromFirestore(doc);
        res.status(200).json(room);
    } catch (error) {
        console.error("Error getting room:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

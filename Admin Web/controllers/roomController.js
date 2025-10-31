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

export const getRoomsByLocation = async (req, res) => {
    try {
        const { auditorium, floor } = req.query;

        if (!auditorium || !floor) {
            return res.status(400).json({ error: "Missing auditorium or floor" });
        }

        // 🔹 Query Firestore
        const snapshot = await db
            .collection("rooms")
            .where("auditorium", "==", auditorium)
            .where("floor", "==", Number(floor))
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No rooms found" });
        }

        // 🔹 Map results
        const rooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({ count: rooms.length, rooms });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

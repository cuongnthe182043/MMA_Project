import { db, admin } from "../admin.js";
import { Booking } from "../models/Booking.js";

// 🔹 1. Get all bookings by userId
export async function getBookingsByUserId(userId) {
    try {
        const snapshot = await db
            .collection("bookings")
            .where("userId", "==", userId)
            .get();

        if (snapshot.empty) return [];

        const bookings = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const booking = Booking.fromFirestore(doc);

                // 🔹 Fetch the room document
                const roomDoc = await db.collection("rooms").doc(booking.roomId).get();
                const roomName = roomDoc.exists ? roomDoc.data().name : "Unknown Room";

                // 🔹 Return booking object with roomName instead of roomId
                return {
                    ...booking,
                    roomName,
                };
            })
        );

        return bookings;
    } catch (error) {
        console.error("❌ Error fetching bookings with room names:", error);
        throw new Error("Failed to fetch bookings by userId");
    }
}

export async function getBookingsByRoomId(roomId) {
    try {
        const snapshot = await db
            .collection("bookings")
            .where("roomId", "==", roomId)
            .get();

        if (snapshot.empty) return [];

        const bookings = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const booking = Booking.fromFirestore(doc);

                // 🔹 Fetch user document
                const userDoc = await db.collection("users").doc(booking.userId).get();
                const userFullName = userDoc.exists ? userDoc.data().fullName : "Unknown User";

                // 🔹 Return booking object with userFullName instead of userId
                return {
                    ...booking,
                    userFullName,
                };
            })
        );

        return bookings;
    } catch (error) {
        console.error("❌ Error fetching bookings with user names:", error);
        throw new Error("Failed to fetch bookings by roomId");
    }
}

// 🔹 2. Edit booking by document ID (only if status ≠ 'pending')
export async function editBooking(bookingId, updateData) {
    try {
        const bookingRef = db.collection("bookings").doc(bookingId);
        const doc = await bookingRef.get();

        if (!doc.exists) throw new Error("Booking not found");

        await bookingRef.update({
            ...updateData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: "Booking updated successfully" };
    } catch (error) {
        console.error("❌ Error updating booking:", error);
        throw error;
    }
}

// 🔹 3. Cancel booking by document ID (only if status = 'pending')
export async function deleteBooking(bookingId) {
    try {
        const bookingRef = db.collection("bookings").doc(bookingId);
        const doc = await bookingRef.get();

        if (!doc.exists) throw new Error("Booking not found");

        const booking = Booking.fromFirestore(doc);

        if (booking.status !== "pending") {
            throw new Error("Only 'pending' bookings can be canceled");
        }

        await bookingRef.update({
            status: "canceled",
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: "Booking canceled successfully" };
    } catch (error) {
        console.error("❌ Error canceling booking:", error);
        throw error;
    }
}

// 🔹 4. Add a new booking
export async function addBooking(newBookingData) {
    try {
        const { roomId, startTime, endTime, userId } = newBookingData;

        if (!roomId || !startTime || !endTime || !userId) {
            throw new Error("Missing required booking fields.");
        }

        // Convert to Firestore Timestamps
        const start = admin.firestore.Timestamp.fromDate(new Date(startTime));
        const end = admin.firestore.Timestamp.fromDate(new Date(endTime));

        if (end.toMillis() <= start.toMillis()) {
            throw new Error("End time must be after start time.");
        }

        // 🔍 Check if there’s already an approved booking overlapping this time range
        const existing = await db
            .collection("bookings")
            .where("roomId", "==", roomId)
            .where("status", "==", "approved")
            .get();

        for (const doc of existing.docs) {
            const data = doc.data();
            const existingStart = data.startTime.toDate();
            const existingEnd = data.endTime.toDate();

            // Check overlap: (start < existingEnd) && (end > existingStart)
            if (start.toDate() < existingEnd && end.toDate() > existingStart) {
                throw new Error("Room is already booked during this period.");
            }
        }

        // ✅ No conflicts, proceed with creating a pending booking
        const booking = new Booking({
            ...newBookingData,
            startTime: start,
            endTime: end,
            status: "pending",
            createdAt: admin.firestore.Timestamp.now(),
        });

        const ref = await db.collection("bookings").add(booking.toFirestore(admin));

        return { success: true, id: ref.id, message: "Booking added successfully and is pending approval." };
    } catch (error) {
        console.error("❌ Error adding booking:", error);
        throw new Error(error.message || "Failed to add booking");
    }
}

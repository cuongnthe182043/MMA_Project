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

        return snapshot.docs.map((doc) => Booking.fromFirestore(doc));
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
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

        return snapshot.docs.map((doc) => Booking.fromFirestore(doc));
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        throw new Error("Failed to fetch bookings by userId");
    }
}

// 🔹 2. Edit booking by document ID (only if status ≠ 'pending')
export async function editBooking(bookingId, updateData) {
    try {
        const bookingRef = db.collection("bookings").doc(bookingId);
        const doc = await bookingRef.get();

        if (!doc.exists) throw new Error("Booking not found");

        const booking = Booking.fromFirestore(doc);

        if (booking.status === "pending") {
            throw new Error("Cannot edit booking while status is 'pending'");
        }

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
        const booking = new Booking({
            ...newBookingData,
            createdAt: admin.firestore.Timestamp.now(),
        });

        const ref = await db.collection("bookings").add(booking.toFirestore(admin));
        return { success: true, id: ref.id, message: "Booking added successfully" };
    } catch (error) {
        console.error("❌ Error adding booking:", error);
        throw new Error("Failed to add booking");
    }
}

// models/Booking.js

export class Booking {
    constructor({
        id = null,               // Firestore document ID
        userId = "",
        roomId = "",
        status = "pending",
        startTime = null,
        endTime = null,
        createdAt = new Date(),
    } = {}) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
    }

    // 🔹 Convert Firestore doc to Booking instance
    static fromFirestore(doc) {
        const data = doc.data();
        return new Booking({
            id: doc.id,
            userId: data.userId,
            roomId: data.roomId,
            status: data.status,
            startTime: data.startTime,
            endTime: data.endTime,
            createdAt: data.createdAt,
        });
    }

    // 🔹 Convert Booking instance to Firestore object
    toFirestore(admin) {
        return {
            userId: this.userId,
            roomId: this.roomId,
            status: this.status,
            startTime:
                this.startTime || admin.firestore.Timestamp.now(),
            endTime:
                this.endTime || admin.firestore.Timestamp.now(),
            createdAt:
                this.createdAt instanceof Date
                    ? admin.firestore.Timestamp.fromDate(this.createdAt)
                    : this.createdAt,
        };
    }
}

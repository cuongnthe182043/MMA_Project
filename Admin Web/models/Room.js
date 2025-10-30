export class Room {
    constructor({
        id = null,               // Firestore document ID
        name = "",
        auditorium = "",
        capacity = 0,
        floor = 0,
        location = "",
        equipments = [],
        status = "available",
        createdAt = new Date(),
    } = {}) {
        this.id = id;
        this.name = name;
        this.auditorium = auditorium;
        this.capacity = capacity;
        this.floor = floor;
        this.location = location;
        this.equipments = equipments;
        this.status = status;
        this.createdAt = createdAt;
    }

    // 🔹 Convert Firestore doc to Room instance
    static fromFirestore(doc) {
        const data = doc.data();
        return new Room({
            id: doc.id,
            name: data.name,
            auditorium: data.auditorium,
            capacity: data.capacity,
            floor: data.floor,
            location: data.location,
            equipments: data.equipments || [],
            status: data.status,
            createdAt: data.createdAt,
        });
    }

    // 🔹 Convert Room instance to Firestore object
    toFirestore(admin) {
        return {
            name: this.name,
            auditorium: this.auditorium,
            capacity: this.capacity,
            floor: this.floor,
            location: this.location,
            equipments: this.equipments,
            status: this.status,
            createdAt:
                this.createdAt instanceof Date
                    ? admin.firestore.Timestamp.fromDate(this.createdAt)
                    : this.createdAt,
        };
    }
}

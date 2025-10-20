import { db } from "./admin.js";

async function seedUsers() {
    const usersRef = db.collection("users");

    await usersRef.doc("u001").set({
        uid: "u001",
        fullName: "Nguyen Van A",
        email: "a12345@fpt.edu.vn",
        role: "student",
        faculty: "SE",
        phone: "0123456789",
        createdAt: new Date().toISOString(),
        activeBookings: 0,
    });

    await usersRef.doc("u002").set({
        uid: "u002",
        fullName: "Tran Thi B",
        email: "b12345@fpt.edu.vn",
        role: "lecturer",
        faculty: "AI",
        phone: "0987654321",
        createdAt: new Date().toISOString(),
        activeBookings: 1,
    });

    console.log("✅ Users seeded");
}

async function seedRooms() {
    const roomsRef = db.collection("rooms");

    await roomsRef.doc("r001").set({
        roomId: "r001",
        name: "Room A1",
        capacity: 50,
        status: "available",
        location: "Building A - Floor 1",
        equipments: ["Projector", "Whiteboard"],
    });

    await roomsRef.doc("r002").set({
        roomId: "r002",
        name: "Room B2",
        capacity: 30,
        status: "maintenance",
        location: "Building B - Floor 2",
        equipments: ["TV", "Air-conditioner"],
    });

    console.log("✅ Rooms seeded");
}

async function seedBookings() {
    const bookingsRef = db.collection("bookings");

    await bookingsRef.add({
        bookingId: "b001",
        userId: "u001",
        roomId: "r001",
        startTime: new Date("2025-10-10T09:00:00Z"),
        endTime: new Date("2025-10-10T11:00:00Z"),
        status: "approved",
        createdAt: new Date(),
    });

    console.log("✅ Bookings seeded");
}

async function runSeed() {
    try {
        await seedUsers();
        await seedRooms();
        await seedBookings();
        console.log("🎉 All data seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding data:", err);
        process.exit(1);
    }
}

runSeed();

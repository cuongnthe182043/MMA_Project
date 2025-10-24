import express from "express";
import bodyParser from "body-parser";
import { db } from "./admin.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// 📌 Trang danh sách booking
app.get("/bookings", async (req, res) => {
    const { status } = req.query;
    let query = db.collection("bookings");

    // Apply filter if status query exists
    if (status && ["pending", "approved", "rejected"].includes(status)) {
        query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    res.render("bookings", { bookings, currentStatus: status || "all" });
});

// 📌 Duyệt đơn booking
app.post("/bookings/:id/approve", async (req, res) => {
    await db.collection("bookings").doc(req.params.id).update({
        status: "approved",
    });
    res.redirect("/bookings");
});

// 📌 Từ chối booking
app.post("/bookings/:id/reject", async (req, res) => {
    await db.collection("bookings").doc(req.params.id).update({
        status: "rejected",
    });
    res.redirect("/bookings");
});

// 📌 Quản lý phòng
app.get("/rooms", async (req, res) => {
    const snapshot = await db.collection("rooms").get();
    const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    res.render("rooms", { rooms });
});

// 📌 Update trạng thái phòng
app.post("/rooms/:id/update", async (req, res) => {
    const { status } = req.body;
    await db.collection("rooms").doc(req.params.id).update({ status });
    res.redirect("/rooms");
});

app.post("/rooms/add", async (req, res) => {
    try {
        const { auditorium, floor, name, location, equipments } = req.body;

        const newRoom = {
            auditorium,
            floor: parseInt(floor),
            name,
            location,
            equipments: Array.isArray(equipments) ? equipments : [equipments],
            capacity: 50, // default, or you can make this a form field
            status: "available",
            createdAt: new Date(),
        };

        await db.collection("rooms").add(newRoom);
        res.redirect("/rooms");
    } catch (err) {
        console.error("❌ Error adding room:", err);
        res.status(500).send("Error adding room");
    }
});

app.post('/rooms/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const { auditorium, floor, name, location, equipments } = req.body;

        await db.collection('rooms').doc(id).update({
            auditorium,
            floor,
            name,
            location,
            equipments: Array.isArray(equipments) ? equipments : [equipments].filter(Boolean),
            updatedAt: new Date()
        });

        res.redirect('/rooms');
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).send('Lỗi khi chỉnh sửa phòng');
    }
});

app.listen(3000, () => console.log("✅ Admin Web chạy tại http://localhost:3000"));

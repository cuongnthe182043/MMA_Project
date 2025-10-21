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

app.listen(3000, () => console.log("✅ Admin Web chạy tại http://localhost:3000"));

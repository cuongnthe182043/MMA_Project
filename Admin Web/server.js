import express from "express";
import bodyParser from "body-parser";
import { db } from "./admin.js";
import session from "express-session";
import bcrypt from "bcrypt";
import { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } from "./admin_account.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function requireAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        return res.redirect("/login");
    }
    next();
}

// 🔐 Session setup
app.use(
    session({
        secret: "super-secret-key", // change this to env var in production
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // true only if using HTTPS
    })
);

// 📌 Trang danh sách booking
app.get("/bookings", requireAdmin, async (req, res) => {
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
app.get("/rooms", requireAdmin, async (req, res) => {
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

// ✅ Show login form
app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// ✅ Handle login form submission
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const isValidEmail = email === ADMIN_EMAIL;
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (isValidEmail && isValidPassword) {
        req.session.isAdmin = true;
        res.redirect("/bookings");
    } else {
        res.render("login", { error: "Sai tài khoản hoặc mật khẩu" });
    }
});

// ✅ Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(3000, () => console.log("✅ Admin Web chạy tại http://localhost:3000"));

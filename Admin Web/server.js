import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";
import { db } from "./admin.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } from "./admin_account.js";
import cors from "cors";

// 🆕 Import controllers
import { registerUser, updateUser, loginUser } from "./controllers/userController.js";
import {
    getBookingsByUserId,
    addBooking,
    editBooking,
    deleteBooking,
    getBookingsByRoomId
} from "./controllers/bookingController.js";
import { getRoomById, getRoomsByLocation } from "./controllers/roomController.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:8081", "http://localhost:19006"], // your local web URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// 🔐 Session setup
app.use(
    session({
        secret: "super-secret-key", // change this in production
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // true only if using HTTPS
    })
);

// ✅ Middleware for admin routes
function requireAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        return res.redirect("/login");
    }
    next();
}

function requireUser(req, res, next) {
    if (req.user.role !== "admin" && req.user.uid !== booking.userId) {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
}

/* -------------------------------------------------------------------------- */
/*                                🔹 ADMIN ROUTES                             */
/* -------------------------------------------------------------------------- */

// 📌 Trang danh sách booking
app.get("/bookings", requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let query = db.collection("bookings");

        // 🔹 Filter by status if provided
        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query = query.where("status", "==", status);
        }

        // 🔹 Fetch bookings
        const snapshot = await query.get();
        if (snapshot.empty) {
            return res.render("bookings", { bookings: [], currentStatus: status || "all" });
        }

        // 🔹 Map bookings and fetch related user + room data
        const bookings = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const bookingData = doc.data();
                const userId = bookingData.userId;
                const roomId = bookingData.roomId;

                // Fetch user document
                const userDoc = await db.collection("users").doc(userId).get();
                const userFullName = userDoc.exists ? userDoc.data().fullName : "Unknown User";

                // Fetch room document
                const roomDoc = await db.collection("rooms").doc(roomId).get();
                const roomName = roomDoc.exists ? roomDoc.data().name : "Unknown Room";

                // Return enriched booking object
                return {
                    id: doc.id,
                    ...bookingData,
                    userFullName,
                    roomName,
                };
            })
        );

        // 🔹 Render bookings page with extra fields
        res.render("bookings", { bookings, currentStatus: status || "all" });
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        res.status(500).send("Internal Server Error");
    }
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

// 📌 Thêm phòng
app.post("/rooms/add", async (req, res) => {
    try {
        const { auditorium, floor, name, location, equipments } = req.body;

        const newRoom = {
            auditorium,
            floor: parseInt(floor),
            name,
            location,
            equipments: Array.isArray(equipments) ? equipments : [equipments],
            capacity: 50,
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

// 📌 Chỉnh sửa phòng
app.post("/rooms/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const { auditorium, floor, name, location, equipments } = req.body;

        await db.collection("rooms").doc(id).update({
            auditorium,
            floor,
            name,
            location,
            equipments: Array.isArray(equipments)
                ? equipments
                : [equipments].filter(Boolean),
            updatedAt: new Date(),
        });

        res.redirect("/rooms");
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).send("Lỗi khi chỉnh sửa phòng");
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

/* -------------------------------------------------------------------------- */
/*                             🔹 API ROUTES (JSON)                           */
/* -------------------------------------------------------------------------- */

// 🧍 USER ROUTES
app.post("/api/users/login", loginUser);

app.post("/api/users/register", registerUser);

app.put("/api/users/:id", updateUser);

// 🧾 BOOKING ROUTES
app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
        const result = await getBookingsByUserId(req.params.userId);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Get bookings error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/bookings/room/:roomId", async (req, res) => {
    try {
        const result = await getBookingsByRoomId(req.params.roomId);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Get bookings error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/bookings", async (req, res) => {
    try {
        const result = await addBooking(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("❌ Add booking error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.put("/api/bookings/:id", requireUser, async (req, res) => {
    try {
        const result = await editBooking(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Edit booking error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete("/api/bookings/:id", registerUser, async (req, res) => {
    try {
        const result = await deleteBooking(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Delete booking error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 🏢 ROOM ROUTE
app.get("/api/room/:id", getRoomById);

app.get("/api/rooms/filter", getRoomsByLocation);

/* -------------------------------------------------------------------------- */

app.listen(3000, () =>
    console.log("✅ Admin Web chạy tại http://localhost:3000")
);

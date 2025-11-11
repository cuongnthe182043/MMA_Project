import { db, admin } from "../admin.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, faculty, role, password } = req.body;

        // 🔹 Check if email provided
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // 🔹 Validate email domain
        const emailRegex = /^[\w.-]+@fpt\.edu\.vn$/i;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Only @fpt.edu.vn email addresses are allowed to register",
            });
        }

        // 🔹 Check if email already exists
        const existingSnapshot = await db
            .collection("users")
            .where("email", "==", email)
            .get();

        if (!existingSnapshot.empty) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // 🔹 Hash password
        const hashedPassword = bcrypt.hashSync(password || email, 10);

        // 🔹 Create new user
        const newUser = new User({
            fullName,
            email,
            phone,
            faculty,
            role: role || "student",
            password: hashedPassword,
            activeBookings: 0,
            createdAt: new Date(),
        });

        // 🔹 Save to Firestore
        const docRef = await db.collection("users").add(newUser.toFirestore(admin));

        res.status(201).json({
            message: "User registered successfully",
            user: { id: docRef.id, email, fullName, role: newUser.role },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Update user info (e.g., phone or faculty)
 */
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        const userRef = db.collection("users").doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ error: "User not found" });

        await userRef.update(updateData);

        const updatedDoc = await userRef.get();
        const updatedUser = User.fromFirestore(updatedDoc);

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Login user (for admin panel or API)
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }

        const snapshot = await db.collection("users").where("email", "==", email).get();
        if (snapshot.empty) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign(
            {
                uid: userDoc.id,
                role: user.role,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token, // send token to client
            user: {
                id: userDoc.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


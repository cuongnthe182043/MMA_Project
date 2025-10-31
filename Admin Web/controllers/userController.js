import { db, admin } from "../admin.js";
import { User } from "../models/User.js";

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, faculty, role } = req.body;

        // 🔹 Check if email already exists
        const existingSnapshot = await db
            .collection("users")
            .where("email", "==", email)
            .get();

        if (!existingSnapshot.empty) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // 🔹 Create a new User instance
        const newUser = new User({
            fullName,
            email,
            phone,
            faculty,
            role: role || "student",
            activeBookings: 0,
            createdAt: new Date(),
        });

        // 🔹 Save to Firestore
        const docRef = await db.collection("users").add(newUser.toFirestore(admin));

        res.status(201).json({
            message: "User registered successfully",
            user: { id: docRef.id, ...newUser },
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

        // 🔹 Find user by email
        const snapshot = await db.collection("users").where("email", "==", email).get();
        if (snapshot.empty) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        // 🔹 Compare password
        // Assuming you store bcrypt-hashed passwords
        const bcrypt = await import("bcryptjs");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 🔹 Generate session or token
        if (req.session) {
            req.session.userId = userDoc.id;
            req.session.role = user.role;
        }

        res.status(200).json({
            message: "Login successful",
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

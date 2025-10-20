import admin from "firebase-admin";
import { readFileSync } from "fs";

// Đọc service account key JSON
const serviceAccount = JSON.parse(
    readFileSync("./serviceAccountKey.json", "utf8")
);

// Khởi tạo Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Xuất Firestore để tái sử dụng
const db = admin.firestore();

export { admin, db };

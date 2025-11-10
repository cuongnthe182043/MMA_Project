import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { fetchBookingsByUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (!userData) return;
                const parsed = JSON.parse(userData);
                const userId = parsed.id || parsed.uid || parsed.email || "guest";

                const res = await fetchBookingsByUser(userId);
                // ✅ handle array response
                setBookings(Array.isArray(res) ? res : res.bookings || []);
            } catch (err) {
                console.error("Error fetching booking history:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const formatTime = (t) => {
        if (!t || !t._seconds) return "—";
        return new Date(t._seconds * 1000).toLocaleString();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.roomId}>🏢 {item.roomName}</Text>
                <Text
                    style={[
                        styles.status,
                        item.status === "approved"
                            ? styles.approved
                            : item.status === "pending"
                                ? styles.pending
                                : styles.rejected,
                    ]}
                >
                    {item.status.toUpperCase()}
                </Text>
            </View>

            <Text style={styles.time}>
                ⏰ {formatTime(item.startTime)} → {formatTime(item.endTime)}
            </Text>
            <Text style={styles.createdAt}>
                📅 Booked: {formatTime(item.createdAt)}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 10, color: "#555" }}>Loading bookings...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Booking History</Text>
            {bookings.length === 0 ? (
                <Text style={styles.emptyText}>No bookings found.</Text>
            ) : (
                <FlatList
                    data={bookings.sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#222",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    roomId: { fontSize: 16, fontWeight: "600", color: "#333" },
    status: {
        fontSize: 13,
        fontWeight: "bold",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: "hidden",
    },
    approved: { backgroundColor: "#d4edda", color: "#155724" },
    pending: { backgroundColor: "#fff3cd", color: "#856404" },
    rejected: { backgroundColor: "#f8d7da", color: "#721c24" },
    time: { fontSize: 14, color: "#555", marginBottom: 4 },
    createdAt: { fontSize: 13, color: "#777" },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 20,
        fontSize: 16,
    },
});

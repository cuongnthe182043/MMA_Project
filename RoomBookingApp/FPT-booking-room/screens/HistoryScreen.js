import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, Button, Platform } from "react-native";
import { fetchBookingsByUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function HistoryScreen() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
    const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
    const API_BASE = "https://mma-project-1.onrender.com/api";

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchBookings = async () => {
                try {
                    setLoading(true);
                    const userData = await AsyncStorage.getItem("user");
                    if (!userData) return;
                    const parsed = JSON.parse(userData);
                    const userId = parsed.id || parsed.uid;

                    const res = await fetchBookingsByUser(userId);
                    if (!isActive) return;

                    setBookings(Array.isArray(res) ? res : res.bookings || []);
                } catch (err) {
                    console.error("Error fetching booking history:", err);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchBookings();

            return () => { isActive = false; };
        }, [])
    );

    const formatTime = (t) => {
        if (!t || !t._seconds) return "—";
        return new Date(t._seconds * 1000).toLocaleString();
    };

    const handleEditPress = (booking) => {
        setSelectedBooking(booking);
        setStartTime(new Date(booking.startTime._seconds * 1000));
        setEndTime(new Date(booking.endTime._seconds * 1000));
        setEditModalVisible(true);
    };

    const handleCancelPress = async (bookingId) => {
        // Example: call cancel API if exists
        try {
            const token = await AsyncStorage.getItem("token"); // store token during login
            const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setBookings((prev) => prev.filter((b) => b.id !== bookingId));
            }
        } catch (err) {
            console.error("Cancel booking error:", err);
        }
    };

    const handleConfirmEdit = async () => {
        if (!selectedBooking) return;

        try {
            console.log("Editing booking:", selectedBooking);
            const token = await AsyncStorage.getItem("token");

            // convert JS Date to Firestore-style timestamp object
            const newStartTime = {
                _seconds: Math.floor(startTime.getTime() / 1000),
                _nanoseconds: 0,
            };
            const newEndTime = {
                _seconds: Math.floor(endTime.getTime() / 1000),
                _nanoseconds: 0,
            };

            const res = await fetch(`${API_BASE}/bookings/${selectedBooking.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    startTime: newStartTime,
                    endTime: newEndTime,
                }),
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                setBookings((prev) =>
                    prev.map((b) =>
                        b.id === selectedBooking.id ? { ...b, startTime, endTime } : b
                    )
                );
                setEditModalVisible(false);
            } else {
                console.error("Failed to update booking");
            }
        } catch (err) {
            console.error("Edit booking error:", err);
        }
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
            <Text style={styles.createdAt}>📅 Booked: {formatTime(item.createdAt)}</Text>

            {item.status === "pending" && (
                <View style={{ flexDirection: "row", marginTop: 8, gap: 10 }}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPress(item)}>
                        <Text style={{ color: "#fff" }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelPress(item.id)}>
                        <Text style={{ color: "#fff" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
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

            <Modal visible={editModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit booking</Text>

                        {/* Start Time Picker */}
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => setStartPickerVisibility(true)}
                        >
                            <Text>Start Time: {startTime.toLocaleString()}</Text>
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={isStartPickerVisible}
                            mode="datetime"
                            date={startTime}
                            is24Hour
                            onConfirm={(date) => {
                                setStartTime(date);
                                setStartPickerVisibility(false);
                            }}
                            onCancel={() => setStartPickerVisibility(false)}
                        />

                        {/* End Time Picker */}
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => setEndPickerVisibility(true)}
                        >
                            <Text>End Time: {endTime.toLocaleString()}</Text>
                        </TouchableOpacity>

                        <DateTimePickerModal
                            isVisible={isEndPickerVisible}
                            mode="datetime"
                            date={endTime}
                            is24Hour
                            onConfirm={(date) => {
                                setEndTime(date);
                                setEndPickerVisibility(false);
                            }}
                            onCancel={() => setEndPickerVisibility(false)}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleConfirmEdit}>
                            <Text style={styles.buttonText}>Confirm Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#222", textAlign: "center" },

    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    roomId: { fontSize: 16, fontWeight: "600", color: "#333" },
    status: { fontSize: 13, fontWeight: "bold", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: "hidden" },
    approved: { backgroundColor: "#d4edda", color: "#155724" },
    pending: { backgroundColor: "#fff3cd", color: "#856404" },
    rejected: { backgroundColor: "#f8d7da", color: "#721c24" },
    time: { fontSize: 14, color: "#555", marginBottom: 4 },
    createdAt: { fontSize: 13, color: "#777" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
    emptyText: { textAlign: "center", color: "#777", marginTop: 20, fontSize: 16 },
    editBtn: { backgroundColor: "#007bff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    cancelBtn: { backgroundColor: "#dc3545", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: "center" },

    // ✅ Modal-specific
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "85%", backgroundColor: "#fff", padding: 20, borderRadius: 12 },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },

    inputButton: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginVertical: 8 },

    // Confirm Edit button
    button: { backgroundColor: "#007bff", paddingVertical: 12, borderRadius: 8, marginTop: 15, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

    // Spacing for cancel button in modal
    modalCancelBtn: { marginTop: 10, paddingVertical: 12, borderRadius: 8, backgroundColor: "#aaa", alignItems: "center" },
    modalCancelText: { color: "#fff", fontWeight: "600" }
});


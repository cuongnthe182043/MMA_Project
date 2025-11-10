import React, { useState, useEffect, use } from "react";
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    ScrollView,
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { addBooking, fetchBookingsByRoom } from "../services/api";

export default function RoomDetailScreen({ route }) {
    const { room } = route.params;
    const [visible, setVisible] = useState(false);
    const [userId, setUserId] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
    const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
    const [bookings, setBookings] = useState([]);
    const API_BASE = "https://mma-project-1.onrender.com/api";

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const parsed = JSON.parse(userData);
                setUserId(parsed.id || parsed.uid || parsed.email || "guest");
            }
        };
        loadUser();
        const loadBookings = async () => {
            try {
                console.log("➡ Fetching:", `${API_BASE}/bookings/room/${room.id}`);
                const res = await fetchBookingsByRoom(room.id);
                console.log("✅ Response:", res);
                setBookings(res || []);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        };
        loadBookings();
    }, []);

    const handleBooking = async () => {
        try {
            if (!userId) return Alert.alert("Error", "User not found");
            if (endTime <= startTime)
                return Alert.alert("Invalid time", "End time must be after start time");

            const newBooking = {
                roomId: room.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                userId,
            };

            const res = await addBooking(newBooking);
            if (res.success) {
                Alert.alert("Success", res.message);
                setVisible(false);
            } else {
                Alert.alert("Error", res.message || "Booking failed");
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const isUnavailable = room.status?.toLowerCase() !== "available";

    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <Text style={styles.bookingTime}>
                {new Date(item.startTime._seconds * 1000).toLocaleString()} →{" "}
                {new Date(item.endTime._seconds * 1000).toLocaleString()}
            </Text>
            <Text style={styles.bookingStatus}>
                Status: <Text style={{ color: "#007bff" }}>{item.status}</Text>
            </Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.roomInfo}>
                <Text style={styles.title}>{room.name}</Text>
                <Text style={styles.detail}>📍 {room.location}</Text>
                <Text style={styles.detail}>👥 Capacity: {room.capacity}</Text>
                <Text style={styles.detail}>
                    🎯 Equipments: {room.equipments?.join(", ")}
                </Text>
                <Text
                    style={[
                        styles.detail,
                        { color: isUnavailable ? "#d9534f" : "#28a745", fontWeight: "600" },
                    ]}
                >
                    🟢 Status: {room.status}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isUnavailable && { backgroundColor: "#ccc" },
                    ]}
                    disabled={isUnavailable}
                    onPress={() => setVisible(true)}
                >
                    <Text style={styles.buttonText}>
                        {isUnavailable ? "Not Available" : "Book Now"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Approved Bookings</Text>
                {bookings.length == 0 ? (
                    <Text style={{ color: "#777", marginTop: 5 }}>
                        No approved bookings yet.
                    </Text>
                ) : (
                    <FlatList
                        data={bookings.filter((b) => b.status === "approved")}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderBooking}
                        scrollEnabled={false}
                    />
                )}
            </View>

            {/* Booking Modal */}
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Book {room.name}</Text>

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

                        <TouchableOpacity style={styles.button} onPress={handleBooking}>
                            <Text style={styles.buttonText}>Confirm Booking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setVisible(false)}
                            style={styles.cancelBtn}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa", marginTop: 20 },
    roomInfo: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    detail: { fontSize: 16, marginBottom: 6 },
    button: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
    },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
    section: { marginTop: 25 },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
    bookingCard: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    bookingTime: { fontSize: 14, fontWeight: "500" },
    bookingStatus: { fontSize: 13, color: "#555" },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        backgroundColor: "#fff",
        margin: 20,
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
    inputButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
    },
    cancelBtn: { alignSelf: "center", marginTop: 10 },
});

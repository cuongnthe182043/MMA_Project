import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { addBooking } from "../services/api";

export default function RoomDetailScreen({ route }) {
    const { room } = route.params;
    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState("");
    const [time, setTime] = useState("");

    const handleBooking = async () => {
        if (!user || !time) return Alert.alert("Missing Info", "Please fill in all fields");
        const res = await addBooking({ roomId: room.name, user, time });
        if (res.success) {
            Alert.alert("Success", "Room booked!");
            setVisible(false);
        } else {
            Alert.alert("Error", res.message || "Failed to book");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{room.name}</Text>
            <Text>Capacity: {room.capacity}</Text>
            <Text>Equipments: {room.equipments.join(", ")}</Text>
            <Text>Status: {room.status}</Text>

            <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
                <Text style={styles.buttonText}>Book Now</Text>
            </TouchableOpacity>

            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Book {room.name}</Text>
                        <TextInput placeholder="Your name" value={user} onChangeText={setUser} style={styles.input} />
                        <TextInput placeholder="Time (e.g., 10:00 - 12:00)" value={time} onChangeText={setTime} style={styles.input} />
                        <TouchableOpacity style={styles.button} onPress={handleBooking}>
                            <Text style={styles.buttonText}>Confirm Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelBtn}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    button: { backgroundColor: "#007bff", padding: 12, borderRadius: 10, marginTop: 20 },
    buttonText: { color: "#fff", textAlign: "center" },
    modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
    modalContent: { backgroundColor: "#fff", margin: 20, borderRadius: 10, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginVertical: 8 },
    cancelBtn: { alignSelf: "center", marginTop: 10 },
});

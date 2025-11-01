import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { fetchBookingsByRoom } from "../services/api";

export default function HistoryScreen() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        (async () => {
            const res = await fetchBookingsByRoom("DE-200");
            setBookings(res.bookings || []);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Booking History</Text>
            <FlatList
                data={bookings}
                keyExtractor={(item, i) => i.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.user}>{item.user}</Text>
                        <Text>{item.time}</Text>
                        <Text>{item.roomId}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    card: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginVertical: 6 },
    user: { fontWeight: "bold" },
});

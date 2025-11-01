import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetchRooms } from "../services/api";

export default function RoomListScreen({ route, navigation }) {
    const { floor } = route.params;
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRooms = async () => {
            const data = await fetchRooms("Delta", floor);
            setRooms(data.rooms || []);
            setLoading(false);
        };
        loadRooms();
    }, [floor]);

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rooms on Floor {floor}</Text>
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("RoomDetail", { room: item })}
                    >
                        <Text style={styles.roomName}>{item.name}</Text>
                        <Text>Capacity: {item.capacity}</Text>
                        <Text>Status: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 15,
        marginVertical: 6,
    },
    roomName: { fontSize: 18, fontWeight: "bold" },
});

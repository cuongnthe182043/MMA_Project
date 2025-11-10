import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    RefreshControl,
} from "react-native";
import { fetchRooms } from "../services/api";

export default function RoomListScreen({ route, navigation }) {
    const { floor, auditorium } = route.params;
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");

    const loadRooms = async () => {
        try {
            setLoading(true);
            const data = await fetchRooms(auditorium, floor);
            const fetchedRooms = data.rooms || [];
            setRooms(fetchedRooms);
            setFilteredRooms(fetchedRooms);
        } catch (error) {
            console.error("Error loading rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, [floor, auditorium]);

    const handleSearch = (text) => {
        setSearch(text);
        const filtered = rooms.filter((room) =>
            room.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredRooms(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRooms();
        setRefreshing(false);
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {auditorium} — Floor {floor}
            </Text>

            {/* Search bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search room (e.g. DE-200)..."
                value={search}
                onChangeText={handleSearch}
            />

            <FlatList
                data={filteredRooms}
                keyExtractor={(item) => item.id || item.name}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("RoomDetail", { room: item })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.roomName}>{item.name}</Text>
                            <Text
                                style={[
                                    styles.status,
                                    item.status === "available"
                                        ? styles.available
                                        : styles.unavailable,
                                ]}
                            >
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.roomInfo}>📍 {item.location}</Text>
                        <Text style={styles.roomInfo}>👥 Capacity: {item.capacity}</Text>
                        <Text style={styles.roomInfo}>
                            🧰 Equipments: {item.equipments?.join(", ") || "N/A"}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No rooms found.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9", marginTop: 20 },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    searchBar: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
        fontSize: 16,
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    roomName: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
    status: {
        fontWeight: "bold",
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: "hidden",
    },
    available: { backgroundColor: "#d4edda", color: "#155724" },
    unavailable: { backgroundColor: "#f8d7da", color: "#721c24" },
    roomInfo: { fontSize: 15, color: "#555", marginTop: 2 },
    emptyText: {
        textAlign: "center",
        marginTop: 30,
        fontSize: 16,
        color: "#888",
    },
});

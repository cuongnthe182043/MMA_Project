import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ImageBackground,
    Alert,
} from "react-native";
import { fetchRooms } from "../services/api";

const auditoriums = [
    { name: "Alpha", background: require("../assets/alpha.jpg") },
    { name: "Beta", background: require("../assets/beta.jpg") },
    { name: "Delta", background: require("../assets/delta.jpg") },
    { name: "Epsilon", background: require("../assets/epsilon.jpg") },
];

export default function HomeScreen({ navigation }) {
    const [selectedAuditorium, setSelectedAuditorium] = useState(null);

    const handleAuditoriumPress = (name) => {
        // Toggle selection
        setSelectedAuditorium(selectedAuditorium === name ? null : name);
    };

    const handleFloorPress = async (auditorium, floor) => {
        try {
            const res = await fetchRooms(auditorium, floor);
            if (res.rooms && res.rooms.length > 0) {
                navigation.getParent()?.navigate("RoomList", { auditorium, floor, rooms: res.rooms });
            } else {
                Alert.alert("No Rooms", `No rooms found for ${auditorium} Floor ${floor}`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch room data.");
        }
    };

    const renderAuditorium = ({ item }) => (
        <View style={styles.auditoriumContainer}>
            <TouchableOpacity
                style={styles.auditoriumButton}
                onPress={() => handleAuditoriumPress(item.name)}
            >
                <ImageBackground
                    source={item.background}
                    style={styles.background}
                    imageStyle={{ borderRadius: 20 }}
                >
                    <View style={styles.overlay}>
                        <Text style={styles.auditoriumText}>{item.name}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            {selectedAuditorium === item.name && (
                <View style={styles.floorContainer}>
                    {[1, 2, 3, 4].map((floor) => (
                        <TouchableOpacity
                            key={floor}
                            style={styles.floorButton}
                            onPress={() => handleFloorPress(item.name, floor)}
                        >
                            <Text style={styles.floorText}>Floor {floor}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={auditoriums}
                renderItem={renderAuditorium}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        padding: 20,
    },
    auditoriumContainer: {
        marginBottom: 20,
    },
    auditoriumButton: {
        borderRadius: 20,
        overflow: "hidden",
    },
    background: {
        height: 150,
        justifyContent: "center",
    },
    overlay: {
        backgroundColor: "rgba(0,0,0,0.4)",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    auditoriumText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },
    floorContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    floorButton: {
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    floorText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

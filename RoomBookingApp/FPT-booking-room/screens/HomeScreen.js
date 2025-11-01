import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Room Booking System</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("FloorSelection")}
            >
                <Text style={styles.buttonText}>Book a Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6c757d" }]}
                onPress={() => navigation.navigate("History")}
            >
                <Text style={styles.buttonText}>View Booking History</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
    button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, marginVertical: 10, width: 200 },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

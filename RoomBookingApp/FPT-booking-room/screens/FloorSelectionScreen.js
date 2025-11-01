import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const floors = [1, 2, 3, 4, 5];

export default function FloorSelectionScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Floor</Text>
            {floors.map((floor) => (
                <TouchableOpacity
                    key={floor}
                    style={styles.button}
                    onPress={() => navigation.navigate("RoomList", { floor })}
                >
                    <Text style={styles.buttonText}>Floor {floor}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 24, marginBottom: 20 },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        marginVertical: 8,
        width: 200,
    },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

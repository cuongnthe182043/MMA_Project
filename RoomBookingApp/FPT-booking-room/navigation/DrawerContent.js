import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DrawerContent({ navigation, setIsLoggedIn }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const data = await AsyncStorage.getItem("user");
            if (data) setUser(JSON.parse(data));
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("user");
        setIsLoggedIn(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.profile}>
                <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>
                    {user ? user.fullName || user.email : "Loading..."}
                </Text>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Booking")} style={styles.item}>
                <Ionicons name="home-outline" size={22} color="#333" />
                <Text style={styles.text}>Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("History")} style={styles.item}>
                <Ionicons name="time-outline" size={22} color="#333" />
                <Text style={styles.text}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.item}>
                <Ionicons name="log-out-outline" size={22} color="#333" />
                <Text style={styles.text}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    profile: { alignItems: "center", marginBottom: 40 },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
    name: { fontSize: 18, fontWeight: "600" },
    item: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
    text: { fontSize: 16, marginLeft: 10 },
});

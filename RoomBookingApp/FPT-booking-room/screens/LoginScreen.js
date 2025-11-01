import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login } from "../services/api";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Missing Info", "Please fill in all fields");

        try {
            const res = await login(email, password);
            if (res.success) {
                setIsLoggedIn(true);
            } else {
                Alert.alert("Login Failed", res.message || "Invalid credentials");
            }
        } catch (err) {
            Alert.alert("Error", "Failed to connect to server");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Login</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>Create a new account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginVertical: 8 },
    button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, marginTop: 10 },
    buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    link: { color: "#007bff", textAlign: "center", marginTop: 15 },
});

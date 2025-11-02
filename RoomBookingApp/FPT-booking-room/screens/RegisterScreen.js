import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { API_URL } from "@env";

export default function RegisterScreen({ navigation }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [faculty, setFaculty] = useState("");
    const [role, setRole] = useState("student"); // default role

    const handleRegister = async () => {
        if (!fullName || !email || !password || !phone || !faculty) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password, phone, faculty, role }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Registration failed");

            Alert.alert("Success", "Account created successfully!");
            navigation.navigate("Login");
        } catch (error) {
            console.error("Register error:", error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email (@fpt.edu.vn)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            <TextInput
                style={styles.input}
                placeholder="Faculty (e.g., Information Technology)"
                value={faculty}
                onChangeText={setFaculty}
            />

            {/* Role Selector */}
            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, role === "student" && styles.selectedRole]}
                    onPress={() => setRole("student")}
                >
                    <Text style={styles.roleText}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, role === "teacher" && styles.selectedRole]}
                    onPress={() => setRole("teacher")}
                >
                    <Text style={styles.roleText}>Teacher</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 25,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    roleButton: {
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    selectedRole: {
        backgroundColor: "#007bff",
        borderColor: "#007bff",
    },
    roleText: {
        color: "#gray",
        fontWeight: "bold",
    },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    },
    link: {
        textAlign: "center",
        marginTop: 15,
        color: "#007bff",
    },
});

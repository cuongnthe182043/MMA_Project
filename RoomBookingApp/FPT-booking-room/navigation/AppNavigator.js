import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerContent from "./DrawerContent";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import RoomListScreen from "../screens/RoomListScreen";
import RoomDetailScreen from "../screens/RoomDetailScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: true, drawerPosition: "right" }}
            drawerContent={(props) => <DrawerContent {...props} />}
        >
            <Drawer.Screen name="Booking" component={HomeScreen} />
            <Drawer.Screen name="History" component={HistoryScreen} />
        </Drawer.Navigator>
    );
}

export default function AppNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load login state from AsyncStorage on app start
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                console.log("User data:", userData);
                if (userData) setIsLoggedIn(true);
            } catch (error) {
                console.error("Error loading login status:", error);
            } finally {
                setLoading(false);
            }
        };
        checkLoginStatus();
    }, []);

    if (loading) return null; // Optionally show a splash screen here

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <>
                    <Stack.Screen name="Login">
                        {(props) => (
                            <LoginScreen
                                {...props}
                                setIsLoggedIn={setIsLoggedIn}
                            />
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="MainDrawer" component={MainDrawer} />
                    <Stack.Screen name="RoomList" component={RoomListScreen} />
                    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

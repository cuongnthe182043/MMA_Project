const API_BASE = "https://mma-project-1.onrender.com/api";

export async function login(email, password) {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function fetchRooms(auditorium, floor) {
    const res = await fetch(`${API_BASE}/rooms/filter?auditorium=${auditorium}&floor=${floor}`);
    return res.json();
}

export async function fetchBookingsByRoom(roomId) {
    const res = await fetch(`${API_BASE}/bookings/room/${roomId}`);
    return res.json();
}

export async function addBooking(data) {
    const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function fetchBookingsByUser(userId) {
    const res = await fetch(`${API_BASE}/bookings/user/${userId}`);
    return res.json();
}
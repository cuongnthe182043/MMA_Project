export class User {
  constructor({
    id = null,               // Firestore document ID
    fullName = "",
    email = "",
    password = "",
    phone = "",
    faculty = "",
    role = "student",
    activeBookings = 0,
    createdAt = new Date(),
  } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.faculty = faculty;
    this.role = role;
    this.activeBookings = activeBookings;
    this.createdAt = createdAt;
  }

  // 🔹 Convert Firestore doc → User instance
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      id: doc.id,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      faculty: data.faculty,
      role: data.role,
      activeBookings: data.activeBookings || 0,
      createdAt: data.createdAt,
    });
  }

  // 🔹 Convert User instance → Firestore object
  toFirestore(admin) {
    return {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      faculty: this.faculty,
      role: this.role,
      activeBookings: this.activeBookings,
      createdAt:
        this.createdAt instanceof Date
          ? admin.firestore.Timestamp.fromDate(this.createdAt)
          : this.createdAt,
    };
  }
}

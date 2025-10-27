import ProfileField from "@/components/ProfileField";
import { images } from "@/constants";
import { logOut } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const Profile = () => {
  const { user, setUser, setIsAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut(); // видаляємо поточну сесію Appwrite
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/sign-in"); // редірект на екран входу
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.name}>Name: {user.name}</Text>
      <Text style={styles.email}>Email: {user.email}</Text>
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#FE8C00" />
      </View>
      <View>
        <ProfileField label="Name" value={user.name} icon={images.bag} />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  logoutButton: {
    width: "60%",
    marginTop: 20,
  },
});

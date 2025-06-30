import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { AuthContext } from "../../context/AuthContext";

const Index = () => {
  const { startChat } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      if (!db) {
        console.error("Firestore (db) is undefined!");
        return;
      }
      setRefreshing(true);
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userWithoutSelf = userList.filter(
        (item) => String(item.email) !== String(user.email)
      );

      setUsers(userWithoutSelf);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const onlineUserList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOnlineUsers(onlineUserList);
    });
    return () => unsubscribe();
  }, []);

  const handleChatStart = async (userId) => {
    if (!user || !user.uid) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      console.log("Starting chat with:", userId);
      const chatId = await startChat(user.uid, userId);

      if (chatId) {
        router.push({
          pathname: "/(app)/chat",
          params: { chatId, userId },
        });
      } else {
        console.error("Chat ID is undefined or null.");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatty</Text>
        <Pressable
          onPress={() => router.push("/(app)/profile")}
          style={styles.profileButton}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <AntDesign name="user" size={20} color={"black"} />
          )}
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
          }
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Pressable
                key={user.id}
                style={styles.userItem}
                onPress={() => handleChatStart(user.id)}
              >
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user?.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: "rgba(150, 150, 150, 0.8)",
                      padding: 6,
                      borderRadius: 10,
                      marginHorizontal: 10,
                    }}
                  >
                    <AntDesign name="user" size={20} color={"black"} />
                  </View>
                )}
                <View>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={styles.noUserText}>No users found</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", width: "100%" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "black" },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: { width: "100%", height: "100%", borderRadius: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 15,
    width: "90%", // ✅ Fix applied here
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10, color: "#333" },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.9,
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatar: { width: 40, height: 40, borderRadius: 25, marginRight: 15 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "gray" },
  noUserText: {
    textAlign: "center",
    fontSize: 16,
    color: "black",
    marginTop: 20,
  },
});

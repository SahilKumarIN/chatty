import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Keyboard,
  Pressable,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase.config";
import { AntDesign } from "@expo/vector-icons";

const generateChatId = (user1, user2) => {
  return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
};

const ChatScreen = () => {
  const { userId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverDetails, setReceiverDetails] = useState(null);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);

  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;
  const chatId = generateChatId(currentUserId, userId);

  useEffect(() => {
    if (!userId || !currentUserId) {
      console.error("User ID or current user is missing!");
      return;
    }

    const getUserDetails = async (userId, setUserDetails) => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserDetails(userSnap.data());
        } else {
          console.error("User not found!");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUserDetails(userId, setReceiverDetails);
    getUserDetails(currentUserId, setCurrentUserDetails);
    console.log(
      "USER DETAILS : \n SENDERs : " +
        JSON.stringify(currentUserDetails) +
        "\nRECIEVERs DETAILs :" +
        JSON.stringify(receiverDetails)
    );

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(chatMessages);
    });

    return () => unsubscribe();
  }, [chatId, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!currentUserId || !userId) {
      console.error("Error: senderId or receiverId is missing!");
      alert("User ID is missing. Try restarting the app.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUserId,
        receiverId: userId,
        message: newMessage,
        timestamp: serverTimestamp(),
        participants: [currentUserId, userId],
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      {/* Header Section */}
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        {receiverDetails?.profileImage ? (
          <Image
            source={{ uri: receiverDetails.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
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
        <Text style={{ fontWeight: "600", fontSize: 18 }}>
          {receiverDetails?.displayName || "Chat"}
        </Text>
      </View>

      {/* Messages Section */}
      <ScrollView
        style={{
          flex: 1,
          padding: 10,
          paddingBottom: Keyboard.isVisible && 10,
        }}
        automaticallyAdjustKeyboardInsets
      >
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUserId;
          const userImage = isSender
            ? currentUserDetails?.photoURL
            : receiverDetails?.photoURL;

          return (
            <View
              key={msg.id}
              style={{
                flexDirection: isSender ? "row-reverse" : "row",
                alignItems: "center",
                marginVertical: 5,
              }}
            >
              {/* {userImage ? (
                <Image
                  source={{ uri: userImage }}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 20,
                    marginHorizontal: 5,
                  }}
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
              )} */}
              <Pressable
                style={{
                  backgroundColor: isSender ? "#DCF8C6" : "#E5E5E5",
                  padding: 10,
                  borderRadius: 8,

                  maxWidth: "70%",
                }}
                onLongPress={() => {
                  Platform.OS == "ios"
                    ? Alert.alert(msg.message)
                    : ToastAndroid.showWithGravity(
                        msg.message,
                        1000,
                        ToastAndroid.BOTTOM
                      );
                }}
              >
                <Text
                  selectable={true}
                  selectionColor={"skyblue"}
                  style={{ fontSize: 16 }}
                >
                  {msg.message}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#ccc",
          paddingVertical: 5,
        }}
      >
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginHorizontal: 5,
          }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

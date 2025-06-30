import { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { auth, firestore, db } from "../firebase.config";
import { AuthContext } from "./AuthContext";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch users from Firebase Authentication
  const fetchUsers = async () => {
    const userList = auth.currentUser ? [auth.currentUser] : [];
    setUsers(userList);
    console.log(userList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startChat = async (userId) => {
    try {
      const chatsRef = collection(db, "chats");

      // Check if chat already exists
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(q);

      let chat = querySnapshot.docs.find((doc) =>
        doc.data().participants.includes(userId)
      );

      // If no existing chat, create a new one
      if (!chat) {
        const chatRef = await addDoc(chatsRef, {
          participants: [user.uid, userId],
          createdAt: new Date().toISOString(),
        });
        chat = { id: chatRef.id };
      }

      return chat.id;
    } catch (error) {
      console.error("Error creating or fetching chat:", error);
      return null;
    }
  };

  // Function to send messages
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!userId) {
      console.error("Error: receiverId (userId) is undefined!");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: auth.currentUser?.uid,
        receiverId: userId, // ✅ Make sure this is not undefined
        message: newMessage,
        timestamp: new Date(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <AppContext.Provider value={{ users, chats, sendMessage, startChat }}>
      {children}
    </AppContext.Provider>
  );
};

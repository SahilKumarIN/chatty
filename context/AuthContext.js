import React, { createContext, useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { auth, storage, db } from "../firebase.config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter, useSegments } from "expo-router";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);

      if (authenticatedUser) {
        if (segments[0] === "signIn" || segments[0] === "signUp") {
          router.replace("/(app)");
        }
      } else {
        if (segments[0] === "(app)") {
          router.replace("/signIn");
        }
      }
    });

    return () => unsubscribe();
  }, [segments]);

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Extract username from email
      const username = email.split("@")[0];

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        mobileNumber: "",
        photoURL: "",
        displayName: username,
      });

      // Update Firebase Auth display name
      await updateProfile(user, { displayName: username });

      // Update user state
      setUser({ ...user, displayName: username });
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const uploadProfilePicture = async (uri) => {
    if (!user) return null;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateUserProfile(user.displayName, "", downloadURL);
      return downloadURL;
    } catch (error) {
      Alert.alert("Upload Error", "Failed to upload profile picture.");
      return null;
    }
  };

  const updateUserProfile = async (displayName, phoneNumber, photoURL) => {
    try {
      if (!auth.currentUser) throw new Error("No authenticated user found");

      const userRef = doc(db, "users", auth.currentUser.uid);

      // Build the update object dynamically
      const updatedData = {};
      if (displayName) updatedData.displayName = displayName;
      if (phoneNumber) updatedData.mobileNumber = phoneNumber;
      if (photoURL) updatedData.photoURL = photoURL;

      // Update Firestore
      await updateDoc(userRef, updatedData);
      console.log("Firestore updated successfully!");

      // Update Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: updatedData.displayName || auth.currentUser.displayName,
        photoURL: updatedData.photoURL || auth.currentUser.photoURL,
      });

      // Fetch latest data and update state
      const userSnapshot = await getDoc(userRef);
      setUser({ id: auth.currentUser.uid, ...userSnapshot.data() });

      console.log("Profile updated successfully in both Firestore and Auth!");
    } catch (error) {
      console.error("Firebase update failed:", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#192f6a" />
      </View>
    );
  }

  const forgotPassword = async (email) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password Reset mail sent to:\n" + email);
      })
      .catch((err) => {
        alert("An error occurred \n Please try again!!\n" + err);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        logout,
        updateUserProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

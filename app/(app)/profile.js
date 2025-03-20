import React, { useContext, useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile } from "firebase/auth";
import BottomSheet from "../../components/BottomSheet";

const Profile = () => {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your gallery."
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log("Image Picker Result:", result);

    if (!result.canceled && result.assets?.length > 0) {
      handleProfilePictureUpload(result.assets[0].uri);
    } else {
      Alert.alert("No Image Selected", "Please try again.");
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile_pic.jpg",
      });
      data.append("upload_preset", "chatty");
      data.append("cloud_name", "dn0h72xnt");

      console.log("Uploading to Cloudinary...");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dn0h72xnt/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!result.secure_url) {
        throw new Error("Failed to get image URL from Cloudinary");
      }

      console.log("Cloudinary Upload Success:", result.secure_url);
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Failed to upload image.");
    }
  };

  const handleProfilePictureUpload = async (uri) => {
    if (!uri) {
      Alert.alert("Error", "No image selected!");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(uri);
      if (!imageUrl) throw new Error("Failed to upload image.");

      // Update profile in Firebase Authentication
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("No authenticated user found");

      await updateProfile(auth.currentUser, { photoURL: imageUrl });
      setPhotoURL(imageUrl);

      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Failed to upload profile picture", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("No authenticated user found");

      await updateProfile(auth.currentUser, { displayName, photoURL });

      console.log("Profile updated successfully!");
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Firebase update failed:", error);
      Alert.alert("Update Failed", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        style={styles.LinearGradient}
        colors={["#4c669f", "#3b5998", "#192f6a"]}
      >
        <SafeAreaView style={styles.container}>
          {/* <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled"> */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <AntDesign name="left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickImage}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.profileImage} />
            ) : (
              <AntDesign name="user" color="gray" size={80} />
            )}
            {/* <View style={styles.editIcon}>
              <FontAwesome name="pencil" size={16} color="white" />
            </View> */}
          </TouchableOpacity>

          <BottomSheet bsH={200}>
            <View style={styles.inputBox}>
              <AntDesign name="user" size={20} color={"gray"} />
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                placeholder="Name"
              />
            </View>

            <View style={styles.inputBox}>
              <AntDesign name="phone" size={20} color={"gray"} />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#1e90ff" }]}
              onPress={handleUpdateProfile}
            >
              <FontAwesome name="pencil" size={20} color={"white"} />
              <Text style={styles.buttonTxt}>
                {uploading ? "Uploading..." : "Update Info"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={[styles.button, { backgroundColor: "orange" }]}
            >
              <MaterialCommunityIcons name="logout" size={24} color={"white"} />
              <Text style={styles.buttonTxt}>Logout</Text>
            </TouchableOpacity>
          </BottomSheet>
          {/* </ScrollView> */}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", alignItems: "center" },
  LinearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 15,
  },
  backButton: { padding: 10 },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  profileImage: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    borderRadius: 100,
  },
  editIcon: {
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: "black",
    borderRadius: 10,
    padding: 5,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "white",
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
  },
  input: { flex: 1, fontSize: 18, marginLeft: 10 },
  button: {
    width: "90%",
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "center",
  },
  buttonTxt: { fontSize: 20, fontWeight: "600", color: "white" },
});

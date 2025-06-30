import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "../components/BottomSheet";
import { Image } from "react-native";
import { Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

const signIn = () => {
  const router = useRouter();
  const { signIn, forgotPassword } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        style={[styles.LinearGradient, { pointerEvents: "auto" }]}
        colors={["#4c669f", "#3b5998", "#192f6a"]}
      >
        <SafeAreaView style={styles.container}>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "white",
                marginVertical: 10,
              }}
            >
              Chatty
            </Text>
            <Image
              style={{
                width: 200,
                height: 200,
                resizeMode: "contain",
              }}
              source={require("../assets/images/chatty.png")}
            />
          </View>

          <BottomSheet bsH={200}>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 24,
                color: "#192f6a",
                textAlign: "center",
              }}
            >
              Sign In
            </Text>
            <View style={{ marginVertical: 10 }}>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color="gray" />
                <TextInput
                  value={userDetails.email}
                  onChangeText={(txt) => {
                    setUserDetails({ ...userDetails, email: txt });
                  }}
                  placeholder="Email"
                  style={{
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 5,
                    flex: 1,
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <MaterialIcons name="password" size={18} color="gray" />
                <TextInput
                  value={userDetails.password}
                  onChangeText={(txt) => {
                    setUserDetails({ ...userDetails, password: txt });
                  }}
                  placeholder="Password"
                  secureTextEntry={true}
                  style={{
                    backgroundColor: "white",
                    padding: 10,
                    borderRadius: 5,
                    flex: 1,
                  }}
                />
              </View>
              <Text
                onPress={() => {
                  forgotPassword(userDetails.email);
                }}
                style={{
                  color: "#192f6a",
                  fontWeight: "600",
                  marginTop: 10,
                  textAlign: "right",
                }}
              >
                Forgot Password ?
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  signIn(userDetails.email, userDetails.password);
                }}
              >
                <Text style={styles.primaryButtonTxt}>Sign In</Text>
              </TouchableOpacity>

              <Text
                style={{ textAlign: "center", color: "gray", marginTop: 10 }}
              >
                Don't have an account?{" "}
                <Text
                  onPress={() => {
                    router.replace("/signUp");
                  }}
                  style={{ color: "#192f6a", fontWeight: "600" }}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </BottomSheet>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default signIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  LinearGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    padding: 4,
    alignItems: "center",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  primaryButton: {
    width: "100%",
    marginTop: 20,
    backgroundColor: "#192f6a",
    padding: 20,
    borderRadius: 10,
    zIndex: 10,
    position: "relative",
  },
  primaryButtonTxt: {
    color: "white",
    backgroundColor: "#192f6a",

    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    borderRadius: 10,
  },
});

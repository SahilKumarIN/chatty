import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet from "../components/BottomSheet";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const Bubble = ({ initialTop, initialLeft, imageSource }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          top: initialTop,
          left: initialLeft,
          transform: [{ translateY }],
        },
      ]}
    >
      <Image source={imageSource} style={styles.bubbleImage} />
    </Animated.View>
  );
};

const Index = () => {
  const router = useRouter();

  const images = [
    require("../assets/images/dummy-male-1.jpeg"),
    require("../assets/images/dummy-male-2.webp"),
    require("../assets/images/dummy-female-1.jpeg"),
    require("../assets/images/dummy-female-2.webp"),
    require("../assets/images/dummy-female-3.webp"),
    require("../assets/images/dummy-female-4.jpeg"),
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Bubble Layer */}
      <View style={styles.bubbleContainer}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Bubble
            key={i}
            initialTop={((Math.random() * height) / 2) * 0.8} // Keep inside visible area
            initialLeft={Math.random() * width * 0.8}
            imageSource={images[i % images.length]} // Cycle through images
          />
        ))}
      </View>

      <LinearGradient
        style={[styles.LinearGradient, { pointerEvents: "auto" }]}
        colors={["#4c669f", "#3b5998", "#192f6a"]}
      >
        <SafeAreaView style={[styles.container, { pointerEvents: "auto" }]}>
          <BottomSheet>
            <Text style={styles.title}>
              Welcome to{"\n"}
              <Text style={styles.highlightText}>Chatty!!!</Text>
            </Text>
            <Image
              source={require("../assets/images/chatty.png")}
              style={styles.bottomSheetImage}
            />
            <Text style={{ color: "gray", textAlign: "center", marginTop: 10 }}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia
              deleniti laborum, natus eaque quidem cupiditate cumque,
              consequuntur asperiores omnis ipsum tempore velit, quasi rerum
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.primaryButton, { zIndex: 999999 }]}
              onPress={() => {
                router.push("/signIn");
              }}
            >
              <Text style={styles.primaryButtonTxt}>{"Get Started"}</Text>
            </TouchableOpacity>
          </BottomSheet>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default Index;

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
  bottomSheetView: {
    backgroundColor: "white",
    width: Dimensions.get("window").width,
    minHeight: 500,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: "absolute",
    bottom: 0,
    zIndex: 10, // Ensure it's above bubbles
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
  highlightText: {
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#192f6a",
  },
  bubbleContainer: {
    position: "absolute",
    width: "100%",
    height: height,
    zIndex: 5, // Ensure bubbles are visible above gradient
    pointerEvents: "none", // This prevents bubbles from blocking touches
  },
  bubble: {
    position: "absolute",
    width: 50, // Increased size for better visibility
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensure images stay within the bubble
  },
  bubbleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  bottomSheetImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 20,
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

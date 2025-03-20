import { Stack, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { AppProvider } from "../../context/AppContext";

const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/signIn"); // Redirect if user is not authenticated
    }
  }, [user]);

  if (user === undefined) {
    // Show loading indicator while checking auth state
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#192f6a" />
      </View>
    );
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
};

export default ProtectedLayout;

import React from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

const _layout = () => {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
};

export default _layout;

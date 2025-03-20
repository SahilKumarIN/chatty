import { StyleSheet, View, ScrollView, Dimensions } from "react-native";
import React from "react";

const BottomSheet = ({ children, bsH = 500 }) => {
  return (
    <View
      style={[
        styles.bottomSheetView,
        {
          height:
            Dimensions.get("window").height * 0.6 > bsH
              ? Dimensions.get("window").height * 0.6
              : bsH,
        },
      ]}
    >
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  bottomSheetView: {
    backgroundColor: "white",
    width: Dimensions.get("window").width,

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: "absolute",
    bottom: 0,
    zIndex: 10,
  },
});

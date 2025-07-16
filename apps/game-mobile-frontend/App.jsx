import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Dimensions } from "react-native";
import { Canvas, Text as SkiaText } from "@shopify/react-native-skia";

export default function App() {
  const { width } = Dimensions.get("window");

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height: 200 }}>
        <SkiaText
          x={width / 2}
          y={100}
          text="Welcome to Bumper Vehicles!"
          color="dodgerblue"
          size={32}
          align="center"
        />
      </Canvas>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Canvas, Circle, Rect, Text as SkiaText, Image as SkiaImage, useImage, useFont } from '@shopify/react-native-skia';

// Example remote image URLs
const imageUrl1 = 'https://reactnative.dev/img/tiny_logo.png';
const imageUrl2 = 'https://skia.org/static/images/logo.svg';

// You can use a local font file in your project, e.g. 'assets/fonts/Roboto-Regular.ttf'
const fontUrl = require('./assets/fonts/Roboto-Regular.ttf'); // Place a .ttf file in this path

export default function App() {
  const image1 = useImage(imageUrl1);
  const image2 = useImage(imageUrl2);
  const font = useFont(fontUrl, 32);

  return (
    <View style={styles.container}>
      <Canvas style={{ width: 350, height: 400 }}>
        <Rect x={10} y={10} width={100} height={60} color="#3498db" />
        <Circle cx={200} cy={60} r={40} color="#e74c3c" />
        {/* Only render text if font is loaded */}
        {font && <SkiaText x={20} y={120} text="Hello Skia!" color="#222" font={font} />}
        {image1 && <SkiaImage image={image1} x={10} y={150} width={60} height={60} />}
        {image2 && <SkiaImage image={image2} x={90} y={150} width={120} height={60} />}
      </Canvas>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

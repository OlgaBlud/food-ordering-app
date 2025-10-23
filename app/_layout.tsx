import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";

// 📌 Блокування автоматичного приховування splash screen до завантаження ресурсів
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Light": require("../assets/fonts/Quicksand-Light.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
  });

  useEffect(() => {
    if (error) throw error; // Якщо була помилка зі шрифтами
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Приховуємо splash тільки після завантаження шрифтів
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null; // Поки шрифти завантажуються — нічого не рендеримо
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

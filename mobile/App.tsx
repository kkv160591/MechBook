import { Alert, Platform } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import AppNavigator from "./src/navigation/AppNavigator"

import { AuthProvider } from "./src/context/AuthContext"
import { LanguageProvider } from "./src/context/LanguageContext"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Polyfill using Object.defineProperty for React Native Web compatibility
if (Platform.OS === "web") {
  Object.defineProperty(Alert, "alert", {
    value: (title?: string, message?: string, buttons?: any[]) => {
      const text = message ? `${title}\n\n${message}` : title || ""
      if (!buttons || buttons.length <= 1) {
        window.alert(text)
        buttons?.[0]?.onPress?.()
      } else {
        const confirmed = window.confirm(text)
        if (confirmed) {
          const confirmBtn = buttons.find((b) => b.style !== "cancel") || buttons[0]
          confirmBtn?.onPress?.()
        } else {
          const cancelBtn = buttons.find((b) => b.style === "cancel")
          cancelBtn?.onPress?.()
        }
      }
    },
    writable: true,
    configurable: true,
  })
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
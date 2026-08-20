import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native"

import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import { useTranslation } from "../../context/LanguageContext"
import LanguageSelector from "../../components/LanguageSelector"
import axios from "axios"

export default function LoginScreen() {
  const navigation: any = useNavigation()
  const { login } = useAuth()
  const { t, fetchUserLanguage } = useTranslation()

  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)

  // Field-level inline errors
  const [phoneError, setPhoneError] = useState("")
  const [pinError, setPinError] = useState("")

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "")
    setPhone(cleaned)
    if (phoneError) setPhoneError("")
  }

  const handlePinChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "")
    setPin(cleaned)
    if (pinError) setPinError("")
  }

  const handleLogin = async () => {
    const trimmedPhone = phone.trim()
    const trimmedPin = pin.trim()

    let hasError = false

    // Field Validations (Inline Red Text)
    if (!trimmedPhone) {
      setPhoneError(t("login.validation.enterPhone"))
      hasError = true
    } else if (trimmedPhone.length !== 10) {
      setPhoneError(t("login.validation.validPhone"))
      hasError = true
    }

    if (!trimmedPin) {
      setPinError(t("login.validation.enterPin"))
      hasError = true
    } else if (trimmedPin.length !== 4) {
      setPinError("PIN must be exactly 4 digits")
      hasError = true
    }

    if (hasError) return

    try {
      setLoading(true)

      const response = await axios.post("http://localhost:5000/auth/login", {
        phone: trimmedPhone,
        pin: trimmedPin,
      })

      const data = response.data

      if (!data.success) {
        // Server Error Response -> Popup Alert
        Alert.alert(
          t("login.error.title"),
          data.message || t("login.error.default")
        )
        return
      }

      await login(data.user, data.token)
      await fetchUserLanguage()

      navigation.replace("Dashboard")
    } catch (error: any) {
      // API / Network Error -> Popup Alert
      Alert.alert(
        t("login.error.title"),
        error?.response?.data?.message || t("login.error.default")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <LanguageSelector />
      </View>

      <Text style={styles.logo}>{t("common.appName")}</Text>
      <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

      {/* Phone Input Wrapper */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("login.phonePlaceholder")}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
          style={[styles.input, phoneError ? styles.inputError : null]}
        />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
      </View>

      {/* PIN Input Wrapper */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={t("login.pinPlaceholder")}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          style={[styles.input, pinError ? styles.inputError : null]}
        />
        {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("login.loginBtn")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>{t("login.registerBtn")}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F9FAFB"
  },
  headerRow: {
    position: "absolute",
    top: 50,
    right: 24,
    zIndex: 10
  },
  logo: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827"
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 36
  },
  inputWrapper: {
    marginBottom: 14
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2"
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 4
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    marginTop: 6
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16
  },
  registerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#2563EB",
    fontWeight: "600"
  }
})
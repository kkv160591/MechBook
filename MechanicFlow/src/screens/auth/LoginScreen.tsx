import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native"

import { useState } from "react"

import {
  useNavigation
} from "@react-navigation/native"

import {
  useAuth
} from "../../context/AuthContext"

export default function LoginScreen() {

  const navigation: any =
    useNavigation()

  const { login } =
    useAuth()

  const [phone, setPhone] =
    useState("")

  const [pin, setPin] =
    useState("")

  const handleLogin = () => {

    if (!phone) {

      Alert.alert(
        "Validation",
        "Enter phone number"
      )

      return
    }

    if (phone.length !== 10) {

      Alert.alert(
        "Validation",
        "Enter valid 10 digit phone number"
      )

      return
    }

    if (pin !== "1111") {

      Alert.alert(
        "Invalid PIN",
        "Use 1111 for demo"
      )

      return
    }

    if (phone === "9999999999") {

      login("owner")

      navigation.replace(
        "Dashboard"
      )

      return
    }

    if (phone === "8888888888") {

      login("worker")

      navigation.replace(
        "Dashboard"
      )

      return
    }

    Alert.alert(
      "Account Not Found",
      "Use demo accounts below"
    )
  }

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        GarageBook
      </Text>

      <Text style={styles.subtitle}>
        Garage Management Made Simple
      </Text>

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TextInput
        placeholder="4 Digit PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Register"
          )
        }
      >
        <Text style={styles.registerText}>
          Register Garage
        </Text>
      </TouchableOpacity>

      <View style={styles.demoCard}>

        <Text style={styles.demoTitle}>
          Demo Accounts
        </Text>

        <Text style={styles.demoText}>
          Owner: 9999999999
        </Text>

        <Text style={styles.demoText}>
          Worker: 8888888888
        </Text>

        <Text style={styles.demoText}>
          PIN: 1111
        </Text>

      </View>

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

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14
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
  },

  demoCard: {
    marginTop: 40,
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  demoTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10
  },

  demoText: {
    color: "#6B7280",
    marginBottom: 4
  }

})
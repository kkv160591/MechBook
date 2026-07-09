import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native"

import { useState } from "react"

import { useNavigation } from "@react-navigation/native"

import { useAuth } from "../../context/AuthContext"

import axios from "axios"

export default function LoginScreen() {

  const navigation: any =
    useNavigation()

  const { login } =
    useAuth()

  const [phone, setPhone] =
    useState("")

  const [pin, setPin] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const handleLogin = async () => {

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

    if (!pin) {

      Alert.alert(
        "Validation",
        "Enter PIN"
      )

      return

    }

    try {

      setLoading(true)

      const response =
        await axios.post(
          "http://localhost:5000/auth/login",
          {
            phone,
            pin
          }
        )

      const data =
        response.data

      if (!data.success) {

        Alert.alert(
          "Login Failed",
          data.message
        )

        return

      }

      await login(
        data.user,
        data.token
      )

      navigation.replace(
        "Dashboard"
      )

    } catch (error: any) {

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message ||
        "Unable to login"
      )

    } finally {

      setLoading(false)

    }

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
        maxLength={10}
        style={styles.input}
      />

      <TextInput
        placeholder="4 Digit PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="white"
          />

        ) : (

          <Text style={styles.buttonText}>
            Login
          </Text>

        )}

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Register"
          )
        }
      >

        <Text
          style={styles.registerText}
        >
          Register Garage
        </Text>

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
  }

})
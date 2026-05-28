import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"

export default function LoginScreen() {

  const navigation: any = useNavigation()

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {

    if (!phone) {
      Alert.alert("Validation", "Phone number is required")
      return
    }

    if (phone.length !== 10) {
      Alert.alert("Validation", "Enter valid 10 digit phone number")
      return
    }

    if (!password) {
      Alert.alert("Validation", "Password is required")
      return
    }

    // temporary login success
    navigation.navigate("Dashboard")
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>MechanicFlow</Text>

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 8
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  }

})
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
  createWorker
} from "../../services/workerService"

import { useNavigation } from "@react-navigation/native"

export default function AddWorkerScreen() {

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const navigation: any =
  useNavigation()

  const [pin, setPin] =
    useState("")

  const [confirmPin, setConfirmPin] =
    useState("")

  const saveWorker =
  async () => {

    if (
      !name ||
      !role ||
      !phone ||
      !pin
    ) {

      Alert.alert(
        "Error",
        "Please fill all fields"
      )

      return
    }

    if (pin !== confirmPin) {

      Alert.alert(
        "Error",
        "PINs do not match"
      )

      return
    }

    try {

      await createWorker({

        name,

        role,

        phone,

        pin

      })

      Alert.alert(
        "Success",
        "Worker Added"
      )

      navigation.goBack()

    }

    catch {

      Alert.alert(
        "Error",
        "Failed to add worker"
      )

    }

  }  

  return (

    <View style={styles.container}>

      <TextInput
        placeholder="Worker Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Role"
        style={styles.input}
        value={role}
        onChangeText={setRole}
      />

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="4 Digit PIN"
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />

      <TextInput
        placeholder="Confirm PIN"
        style={styles.input}
        value={confirmPin}
        onChangeText={setConfirmPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={saveWorker}
      >
        <Text style={styles.btnText}>
          Save Worker
        </Text>
      </TouchableOpacity>

    </View>

  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#F3F4F6"
  },

  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },

  btn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },

  btnText: {
    color: "white",
    fontWeight: "bold"
  }

})
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import { useState } from "react"

export default function AddWorkerScreen() {

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")

  const saveWorker = () => {

    const worker = {
      id: Date.now().toString(),
      name,
      role,
      phone,
      active: true
    }

    console.log(worker)

    alert("Worker Added")
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
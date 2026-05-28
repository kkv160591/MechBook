import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import { useState } from "react"

export default function PurchaseEntryScreen() {

  const [partName, setPartName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")

  const savePurchase = () => {

    Alert.alert(
      "Success",
      "Stock added successfully"
    )

  }

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Purchase Entry
      </Text>

      <View style={styles.card}>

        <TextInput
          placeholder="Part Name"
          style={styles.input}
          value={partName}
          onChangeText={setPartName}
        />

        <TextInput
          placeholder="Quantity"
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <TextInput
          placeholder="Purchase Price"
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={savePurchase}
        >

          <Text style={styles.buttonText}>
            Save Entry
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }

})
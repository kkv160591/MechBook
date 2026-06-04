import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native"

import { useState } from "react"

import { useNavigation } from "@react-navigation/native"

export default function AddInventoryScreen({
  route
}: any) {

  const navigation: any = useNavigation()

  const { onSave } = route.params

  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [category, setCategory] =
    useState("")

  const [buyPrice, setBuyPrice] =
    useState("")

  const [sellPrice, setSellPrice] =
    useState("")

  const [stock, setStock] =
    useState("")

  const [minimumStock, setMinimumStock] =
    useState("")

  const handleSave = () => {

    if (
      !name ||
      !sku ||
      !sellPrice ||
      !stock
    ) {

      Alert.alert(
        "Validation",
        "Please fill required fields"
      )

      return
    }

    const newPart = {

      id: Date.now().toString(),

      name,
      sku,
      category,

      buyingPrice:
        Number(buyPrice),

      sellingPrice:
        Number(sellPrice),

      stock:
        Number(stock),

      minimumStock:
        Number(minimumStock)

    }

    onSave(newPart)

    navigation.goBack()

  }

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Add Spare Part
      </Text>

      <TextInput
        placeholder="Part Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="SKU"
        style={styles.input}
        value={sku}
        onChangeText={setSku}
      />

      <TextInput
        placeholder="Category"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        placeholder="Buying Price"
        keyboardType="numeric"
        style={styles.input}
        value={buyPrice}
        onChangeText={setBuyPrice}
      />

      <TextInput
        placeholder="Selling Price"
        keyboardType="numeric"
        style={styles.input}
        value={sellPrice}
        onChangeText={setSellPrice}
      />

      <TextInput
        placeholder="Stock"
        keyboardType="numeric"
        style={styles.input}
        value={stock}
        onChangeText={setStock}
      />

      <TextInput
        placeholder="Minimum Stock"
        keyboardType="numeric"
        style={styles.input}
        value={minimumStock}
        onChangeText={setMinimumStock}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
      >

        <Text style={styles.buttonText}>
          Save Part
        </Text>

      </TouchableOpacity>

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111827"
  },

  input: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }

})

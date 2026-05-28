import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native"

import { useState } from "react"

import { useNavigation } from "@react-navigation/native"

export default function EditInventoryScreen({
  route
}: any) {

  const navigation: any = useNavigation()

  const {
    item,
    onUpdate
  } = route.params

  const [name, setName] =
    useState(item.name)

  const [stock, setStock] =
    useState(
      String(item.stock)
    )

  const [sellingPrice, setSellingPrice] =
    useState(
      String(item.sellingPrice)
    )

  const handleUpdate = () => {

    const updatedItem = {

      ...item,

      name,

      stock: Number(stock),

      sellingPrice:
        Number(sellingPrice)

    }

    onUpdate(updatedItem)

    navigation.goBack()

  }

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Edit Inventory
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={stock}
        onChangeText={setStock}
      />

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sellingPrice}
        onChangeText={setSellingPrice}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
      >

        <Text style={styles.buttonText}>
          Update Inventory
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

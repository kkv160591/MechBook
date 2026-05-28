// AddEditPartScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native"

import { useState } from "react"

import {
  RouteProp,
  useNavigation
} from "@react-navigation/native"

type Props = {
  route: RouteProp<any, any>
}

export default function AddEditPartScreen({
  route
}: Props) {

  const navigation: any = useNavigation()

  const mode = route.params?.mode || "add"

  const part = route.params?.part

  const [name, setName] = useState(
    part?.name || ""
  )

  const [sku, setSku] = useState(
    part?.sku || ""
  )

  const [category, setCategory] = useState(
    part?.category || ""
  )

  const [buyingPrice, setBuyingPrice] =
    useState(
      part?.buyingPrice?.toString() || ""
    )

  const [sellingPrice, setSellingPrice] =
    useState(
      part?.sellingPrice?.toString() || ""
    )

  const [stock, setStock] = useState(
    part?.stock?.toString() || ""
  )

  const [minStock, setMinStock] =
    useState(
      part?.minStock?.toString() || ""
    )

  const handleSave = () => {

    if (
      !name ||
      !sku ||
      !category
    ) {

      Alert.alert(
        "Validation",
        "Please fill all required fields"
      )

      return
    }

    Alert.alert(
      "Success",
      mode === "add"
        ? "Part added successfully"
        : "Part updated successfully"
    )

    navigation.goBack()

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        {
          mode === "add"
            ? "Add New Part"
            : "Edit Part"
        }
      </Text>

      <View style={styles.card}>

        <TextInput
          placeholder="Part Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="SKU / Part Code"
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
          value={buyingPrice}
          onChangeText={setBuyingPrice}
        />

        <TextInput
          placeholder="Selling Price"
          keyboardType="numeric"
          style={styles.input}
          value={sellingPrice}
          onChangeText={setSellingPrice}
        />

        <TextInput
          placeholder="Current Stock"
          keyboardType="numeric"
          style={styles.input}
          value={stock}
          onChangeText={setStock}
        />

        <TextInput
          placeholder="Minimum Stock"
          keyboardType="numeric"
          style={styles.input}
          value={minStock}
          onChangeText={setMinStock}
        />

      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
      >

        <Text style={styles.saveText}>
          {
            mode === "add"
              ? "Add Part"
              : "Update Part"
          }
        </Text>

      </TouchableOpacity>

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

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 22
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }

})
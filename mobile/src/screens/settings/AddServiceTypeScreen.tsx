import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from "react-native"

import {
  useState
} from "react"

import {
  createServiceType
} from "../../services/serviceTypesService"

export default function AddServiceTypeScreen({
  navigation
}: any) {

  const [name, setName] =
    useState("")

  const [category, setCategory] =
    useState("")

  const [defaultPrice, setDefaultPrice] =
    useState("")

  const [estimatedDuration,
    setEstimatedDuration] =
      useState("")

  const saveService =
  async () => {

    try {

      await createServiceType({

        name,

        category,

        defaultPrice:
          Number(defaultPrice),

        estimatedDuration

      })

      Alert.alert(
        "Success",
        "Service Added"
      )

      navigation.goBack()

    }

    catch {

      Alert.alert(
        "Error",
        "Failed to save service"
      )

    }

  }

  return (

    <View style={styles.container}>

      <TextInput
        placeholder="Service Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Category"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        placeholder="Default Price"
        keyboardType="numeric"
        style={styles.input}
        value={defaultPrice}
        onChangeText={setDefaultPrice}
      />

      <TextInput
        placeholder="Duration"
        style={styles.input}
        value={estimatedDuration}
        onChangeText={
          setEstimatedDuration
        }
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={saveService}
      >

        <Text style={styles.btnText}>
          Save Service
        </Text>

      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  input: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14
  },

  btn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },

  btnText: {
    color: "white",
    fontWeight: "700"
  }

})
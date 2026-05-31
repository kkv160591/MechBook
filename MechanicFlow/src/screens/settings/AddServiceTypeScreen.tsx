import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet
} from "react-native"

export default function AddServiceTypeScreen({
  navigation
}: any) {

  return (

    <View style={styles.container}>

      <TextInput
        placeholder="Service Name"
        style={styles.input}
      />

      <TextInput
        placeholder="Category"
        style={styles.input}
      />

      <TextInput
        placeholder="Default Price"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Duration"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          navigation.goBack()
        }
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
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet
} from "react-native"

export default function EditServiceTypeScreen({
  route,
  navigation
}: any) {

  const service =
    route.params.service

  return (

    <View style={styles.container}>

      <TextInput
        defaultValue={service.name}
        style={styles.input}
      />

      <TextInput
        defaultValue={service.category}
        style={styles.input}
      />

      <TextInput
        defaultValue={
          service.defaultPrice.toString()
        }
        style={styles.input}
      />

      <TextInput
        defaultValue={
          service.estimatedDuration
        }
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.saveBtn}
      >

        <Text style={styles.btnText}>
          Update Service
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
      >

        <Text style={styles.btnText}>
          Delete Service
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

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },

  deleteBtn: {
    backgroundColor: "#DC2626",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12
  },

  btnText: {
    color: "white",
    fontWeight: "700"
  }

})
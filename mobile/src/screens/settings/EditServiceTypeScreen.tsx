import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from "react-native"

import {
  useEffect,
  useState
} from "react"

import {
  getServiceTypeById,
  updateServiceType,
  deleteServiceType
} from "../../services/serviceTypesService"

export default function EditServiceTypeScreen({
  route,
  navigation
}: any) {

  const [service, setService] =
    useState<any>(null)

  const loadService =
  async () => {

    try {

      const response =
        await getServiceTypeById(
          route.params.serviceId
        )

      setService(
        response.data.service
      )

    }

    catch (error) {

      console.log(error)

    }

  }

  useEffect(() => {

    loadService()

  }, [])

  if (!service) {

    return (
      <Text>
        Loading...
      </Text>
    )

  }

  const saveChanges =
  async () => {

    try {

      await updateServiceType(

        service.serviceTypeId,

        service

      )

      Alert.alert(
        "Success",
        "Service Updated"
      )

      navigation.goBack()

    }

    catch {

      Alert.alert(
        "Error",
        "Update Failed"
      )

    }

  }

  const removeService =
  async () => {

    Alert.alert(

      "Delete Service",

      "Are you sure?",

      [

        {
          text: "Cancel"
        },

        {

          text: "Delete",

          onPress: async () => {

            await deleteServiceType(
              service.serviceTypeId
            )

            navigation.goBack()

          }

        }

      ]

    )

  }

  return (

    <View style={styles.container}>

      <TextInput
        value={service.name}
        style={styles.input}
        onChangeText={value =>
          setService({
            ...service,
            name: value
          })
        }
      />

      <TextInput
        value={service.category}
        style={styles.input}
        onChangeText={value =>
          setService({
            ...service,
            category: value
          })
        }
      />

      <TextInput
        value={
          String(
            service.defaultPrice
          )
        }
        style={styles.input}
        keyboardType="numeric"
        onChangeText={value =>
          setService({
            ...service,
            defaultPrice:
              Number(value)
          })
        }
      />

      <TextInput
        value={
          service.estimatedDuration
        }
        style={styles.input}
        onChangeText={value =>
          setService({
            ...service,
            estimatedDuration:
              value
          })
        }
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveChanges}
      >

        <Text style={styles.btnText}>
          Update Service
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={removeService}
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
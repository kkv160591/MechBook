import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native"

import {
  Ionicons
} from "@expo/vector-icons"

import { useState } from "react"

import { useNavigation } from "@react-navigation/native"

export default function AddCustomerScreen() {

  const navigation: any = useNavigation()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] =
    useState("")

  const [address, setAddress] =
    useState("")

  const [notes, setNotes] =
    useState("")

  const handleSave = () => {

    if (!name || !phone) {

      Alert.alert(
        "Validation",
        "Name & phone required"
      )

      return
    }

    const customer = {

      id: Date.now().toString(),

      name,

      phone,

      alternatePhone,

      address,

      notes,

      totalVehicles: 0,

      totalJobs: 0,

      totalSpent: 0,

      pendingAmount: 0,

      lastVisit: "New Customer"
    }

    console.log(customer)

    Alert.alert(
      "Success",
      "Customer added successfully"
    )

    navigation.goBack()

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Add Customer
          </Text>

          <Text style={styles.subtitle}>
            Create new garage customer
          </Text>

        </View>

        <View style={styles.iconBox}>

          <Ionicons
            name="person-add"
            size={28}
            color="#2563EB"
          />

        </View>

      </View>

      {/* FORM */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Customer Details
        </Text>

        <TextInput
          placeholder="Customer Name *"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Phone Number *"
          keyboardType="phone-pad"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          placeholder="Alternate Phone"
          keyboardType="phone-pad"
          style={styles.input}
          value={alternatePhone}
          onChangeText={setAlternatePhone}
        />

        <TextInput
          placeholder="Address"
          style={[
            styles.input,
            styles.textArea
          ]}
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <TextInput
          placeholder="Notes"
          style={[
            styles.input,
            styles.textArea
          ]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

      </View>

      {/* SAVE */}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
      >

        <Text style={styles.saveText}>
          Save Customer
        </Text>

      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    marginTop: 5,
    color: "#6B7280"
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827"
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    color: "#111827"
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top"
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }

})
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native"

import { useState } from "react"

import {
  useNavigation
} from "@react-navigation/native"

import {
  registerGarage
} from "../../services/authService"

export default function RegisterScreen() {

  const navigation: any =
    useNavigation()

  const [loading, setLoading] =
    useState(false)

  const [ownerName, setOwnerName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [pin, setPin] =
    useState("")

  const [confirmPin, setConfirmPin] =
    useState("")

  const [garageName, setGarageName] =
    useState("")

  const [gstNumber, setGstNumber] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [address1, setAddress1] =
    useState("")

  const [address2, setAddress2] =
    useState("")

  const [city, setCity] =
    useState("")

  const [state, setState] =
    useState("")

  const [pincode, setPincode] =
    useState("")

  const [country, setCountry] =
    useState("India")

  const handleRegister =
    async () => {

      try {

        if (!ownerName) {

          Alert.alert(
            "Validation",
            "Owner name is required"
          )

          return

        }

        if (!phone) {

          Alert.alert(
            "Validation",
            "Phone number is required"
          )

          return

        }

        if (phone.length !== 10) {

          Alert.alert(
            "Validation",
            "Enter valid 10 digit phone number"
          )

          return

        }

        if (!garageName) {

          Alert.alert(
            "Validation",
            "Garage name is required"
          )

          return

        }

        if (!address1) {

          Alert.alert(
            "Validation",
            "Address is required"
          )

          return

        }

        if (!city || !state) {

          Alert.alert(
            "Validation",
            "City and State are required"
          )

          return

        }

        if (!pin) {

          Alert.alert(
            "Validation",
            "PIN is required"
          )

          return

        }

        if (pin.length !== 4) {

          Alert.alert(
            "Validation",
            "PIN must be 4 digits"
          )

          return

        }

        if (pin !== confirmPin) {

          Alert.alert(
            "Validation",
            "PIN does not match"
          )

          return

        }

        setLoading(true)

        const payload = {

          garageName,

          ownerName,

          phone,

          pin,

          city,

          state,

          country,

          address:
            address1 +
            (
              address2
                ? `, ${address2}`
                : ""
            ),

          logo: ""

        }

        const response =
          await registerGarage(
            payload
          )

        if (response.success) {

          Alert.alert(
            "Success",
            "Garage registered successfully",
            [
              {
                text: "Login Now",
                onPress: () =>
                  navigation.replace("Login")
              }
            ]
          )

        }

      } catch (error: any) {

        Alert.alert(
          "Registration Failed",
          error?.response?.data?.message ||
          "Something went wrong"
        )

      } finally {

        setLoading(false)

      }

    }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        Register Your Garage
      </Text>

      <Text style={styles.subtitle}>
        Setup your garage and start managing jobs digitally.
      </Text>

      <Text style={styles.sectionTitle}>
        Owner Details
      </Text>

      <TextInput
        placeholder="Owner Name"
        value={ownerName}
        onChangeText={setOwnerName}
        style={styles.input}
      />

      <TextInput
        placeholder="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TextInput
        placeholder="Create 4 Digit PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm PIN"
        value={confirmPin}
        onChangeText={setConfirmPin}
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>
        Garage Details
      </Text>

      <TextInput
        placeholder="Garage Name"
        value={garageName}
        onChangeText={setGarageName}
        style={styles.input}
      />

      <TextInput
        placeholder="GST Number (Optional)"
        value={gstNumber}
        onChangeText={setGstNumber}
        style={styles.input}
      />

      <TextInput
        placeholder="Email (Optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>
        Address
      </Text>

      <TextInput
        placeholder="Address Line 1"
        value={address1}
        onChangeText={setAddress1}
        style={styles.input}
      />

      <TextInput
        placeholder="Address Line 2 (Optional)"
        value={address2}
        onChangeText={setAddress2}
        style={styles.input}
      />

      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <TextInput
        placeholder="State"
        value={state}
        onChangeText={setState}
        style={styles.input}
      />

      <TextInput
        placeholder="Pincode"
        value={pincode}
        onChangeText={setPincode}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>
        Vehicle Types Supported
      </Text>

      <View style={styles.vehicleRow}>

        <View style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>
            2 Wheeler
          </Text>
        </View>

        <View style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>
            4 Wheeler
          </Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.logoButton}
      >
        <Text style={styles.logoButtonText}>
          Upload Garage Logo (Optional)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >

        {
          loading
            ? (
              <ActivityIndicator
                color="white"
              />
            )
            : (
              <Text style={styles.buttonText}>
                Create Garage Account
              </Text>
            )
        }

      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
    marginBottom: 12
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },

  vehicleRow: {
    flexDirection: "row",
    marginBottom: 16
  },

  vehicleChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10
  },

  vehicleText: {
    color: "#2563EB",
    fontWeight: "600"
  },

  logoButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 20
  },

  logoButtonText: {
    color: "#2563EB",
    fontWeight: "600"
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 14,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }

})
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
  MaterialIcons
} from "@expo/vector-icons"

export default function GarageProfileScreen() {

  const [garage, setGarage] = useState({

    garageName: "RK Auto Service Center",

    ownerName: "Rahul Kumar",

    phone: "9876543210",

    email: "garage@email.com",

    gstNumber: "27ABCDE1234F1Z5",

    address: "Shop No. 12 Main Road",

    city: "Pune",

    state: "Maharashtra",

    pincode: "411033",

    vehicleTypes: [
      "2 Wheeler",
      "4 Wheeler"
    ]

  })

  const vehicleOptions = [
    "2 Wheeler",
    "4 Wheeler",
    "Commercial",
    "Truck",
    "Bus"
  ]

  const toggleVehicle = (
    type: string
  ) => {

    if (
      garage.vehicleTypes.includes(type)
    ) {

      setGarage(prev => ({
        ...prev,
        vehicleTypes:
          prev.vehicleTypes.filter(
            v => v !== type
          )
      }))

    } else {

      setGarage(prev => ({
        ...prev,
        vehicleTypes: [
          ...prev.vehicleTypes,
          type
        ]
      }))

    }

  }

  const saveProfile = () => {

    Alert.alert(
      "Success",
      "Garage Profile Updated"
    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.heading}>
        Garage Profile
      </Text>

      <Text style={styles.subHeading}>
        Manage garage information
      </Text>

      {/* LOGO */}

      <View style={styles.logoCard}>

        <View style={styles.logoBox}>

          <MaterialIcons
            name="garage"
            size={40}
            color="#2563EB"
          />

        </View>

        <TouchableOpacity
          style={styles.logoBtn}
        >

          <Text style={styles.logoText}>
            Upload Logo
          </Text>

        </TouchableOpacity>

      </View>

      {/* GARAGE INFO */}

      <View style={styles.card}>

        <Text style={styles.section}>
          Garage Information
        </Text>

        <TextInput
          style={styles.input}
          value={garage.garageName}
          placeholder="Garage Name"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              garageName: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.ownerName}
          placeholder="Owner Name"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              ownerName: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.phone}
          placeholder="Phone"
          keyboardType="phone-pad"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              phone: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.email}
          placeholder="Email"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              email: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.gstNumber}
          placeholder="GST Number"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              gstNumber: value
            }))
          }
        />

      </View>

      {/* ADDRESS */}

      <View style={styles.card}>

        <Text style={styles.section}>
          Address
        </Text>

        <TextInput
          style={styles.input}
          value={garage.address}
          placeholder="Address"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              address: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.city}
          placeholder="City"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              city: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.state}
          placeholder="State"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              state: value
            }))
          }
        />

        <TextInput
          style={styles.input}
          value={garage.pincode}
          placeholder="Pincode"
          keyboardType="numeric"
          onChangeText={value =>
            setGarage(prev => ({
              ...prev,
              pincode: value
            }))
          }
        />

      </View>

      {/* VEHICLES */}

      <View style={styles.card}>

        <Text style={styles.section}>
          Supported Vehicle Types
        </Text>

        {vehicleOptions.map(type => (

          <TouchableOpacity
            key={type}
            style={styles.vehicleRow}
            onPress={() =>
              toggleVehicle(type)
            }
          >

            <MaterialIcons
              name={
                garage.vehicleTypes.includes(type)
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={24}
              color="#2563EB"
            />

            <Text style={styles.vehicleText}>
              {type}
            </Text>

          </TouchableOpacity>

        ))}

      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveProfile}
      >

        <Text style={styles.saveText}>
          Save Profile
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
    padding: 18
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },

  subHeading: {
    color: "#6B7280",
    marginBottom: 20
  },

  logoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16
  },

  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },

  logoBtn: {
    marginTop: 15
  },

  logoText: {
    color: "#2563EB",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },

  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },

  vehicleText: {
    marginLeft: 10,
    fontSize: 15
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }

})
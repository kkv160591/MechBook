import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native"

export default function RegisterScreen() {

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

      {/* OWNER DETAILS */}

      <Text style={styles.sectionTitle}>
        Owner Details
      </Text>

      <TextInput
        placeholder="Owner Name"
        style={styles.input}
      />

      <TextInput
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TextInput
        placeholder="Create 4 Digit PIN"
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm PIN"
        secureTextEntry
        keyboardType="numeric"
        style={styles.input}
      />

      {/* GARAGE DETAILS */}

      <Text style={styles.sectionTitle}>
        Garage Details
      </Text>

      <TextInput
        placeholder="Garage Name"
        style={styles.input}
      />

      <TextInput
        placeholder="GST Number (Optional)"
        style={styles.input}
      />

      <TextInput
        placeholder="Email (Optional)"
        keyboardType="email-address"
        style={styles.input}
      />

      {/* ADDRESS */}

      <Text style={styles.sectionTitle}>
        Address
      </Text>

      <TextInput
        placeholder="Address Line 1"
        style={styles.input}
      />

      <TextInput
        placeholder="Address Line 2 (Optional)"
        style={styles.input}
      />

      <TextInput
        placeholder="City"
        style={styles.input}
      />

      <TextInput
        placeholder="State"
        style={styles.input}
      />

      <TextInput
        placeholder="Pincode"
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Country"
        defaultValue="India"
        style={styles.input}
      />

      {/* VEHICLE TYPES */}

      <Text style={styles.sectionTitle}>
        Vehicle Types Supported
      </Text>

      <View style={styles.vehicleRow}>

        <TouchableOpacity style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>
            2 Wheeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.vehicleChip}>
          <Text style={styles.vehicleText}>
            4 Wheeler
          </Text>
        </TouchableOpacity>

      </View>

      {/* LOGO */}

      <TouchableOpacity style={styles.logoButton}>
        <Text style={styles.logoButtonText}>
          Upload Garage Logo (Optional)
        </Text>
      </TouchableOpacity>

      {/* SUBMIT */}

      <TouchableOpacity
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Create Garage Account
        </Text>
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
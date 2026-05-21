// CreateJobScreen.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import { useState } from "react"
import { createJob } from "../services/jobApi"

type Service = {
  name: string
  price: number
}

export default function CreateJobScreen() {

  // CUSTOMER
  const [customer, setCustomer] = useState("")
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")

  // VEHICLE
  const [vehicleType, setVehicleType] = useState<"2W" | "4W">("2W")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [kmsDriven, setKmsDriven] = useState("")

  // JOB
  const [problemDescription, setProblemDescription] = useState("")
  const [expectedDelivery, setExpectedDelivery] = useState("")

  // SERVICE
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")

  const [services, setServices] = useState<Service[]>([])

  const [showServiceForm, setShowServiceForm] = useState(false)

  // ADD SERVICE
  const addService = () => {

    if (!serviceName || !servicePrice) {

      Alert.alert(
        "Validation",
        "Please enter service details"
      )

      return
    }

    const newService: Service = {
      name: serviceName,
      price: Number(servicePrice)
    }

    setServices(prev => [...prev, newService])

    setServiceName("")
    setServicePrice("")

    setShowServiceForm(false)
  }

  // DELETE SERVICE
  const deleteService = (index: number) => {

    setServices(prev =>
      prev.filter((_, i) => i !== index)
    )
  }

  // TOTAL
  const totalPrice = services.reduce(
    (sum, item) => sum + item.price,
    0
  )

  // CREATE JOB
  const handleCreateJob = async () => {

    if (
      !customer ||
      !phone ||
      !vehicleNumber ||
      !vehicleBrand ||
      !vehicleModel
    ) {

      Alert.alert(
        "Validation",
        "Please fill all required fields"
      )

      return
    }

    if (services.length === 0) {

      Alert.alert(
        "Validation",
        "Add at least one service"
      )

      return
    }

    try {

      const job = {

        id: Date.now().toString(),

        customer,
        phone,
        alternatePhone,

        vehicleType,
        vehicle: vehicleNumber,
        vehicleNumber,
        vehicleBrand,
        vehicleModel,
        vehicleColor,
        fuelType,
        kmsDriven,

        problemDescription,
        expectedDelivery,

        services,

        status: "pending"
      }

      await createJob(job)

      Alert.alert(
        "Success",
        "Job created successfully"
      )

      // RESET

      setCustomer("")
      setPhone("")
      setAlternatePhone("")

      setVehicleNumber("")
      setVehicleBrand("")
      setVehicleModel("")
      setVehicleColor("")
      setFuelType("")
      setKmsDriven("")

      setProblemDescription("")
      setExpectedDelivery("")

      setServices([])

    } catch (err) {

      Alert.alert(
        "Error",
        "Failed to create job"
      )

    }
  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.headerRow}>

        <View>

          <Text style={styles.title}>
            Create New Job
          </Text>

          <Text style={styles.subtitle}>
            Garage job card for vehicle servicing
          </Text>

        </View>

        <View style={styles.headerIcon}>

          <MaterialIcons
            name="build-circle"
            size={36}
            color="#2563EB"
          />

        </View>

      </View>

      {/* CUSTOMER DETAILS */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Customer Details
        </Text>

        <TextInput
          placeholder="Customer Full Name *"
          style={styles.input}
          value={customer}
          onChangeText={setCustomer}
        />

        <TextInput
          placeholder="Primary Phone Number *"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          placeholder="Alternate Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={alternatePhone}
          onChangeText={setAlternatePhone}
        />

      </View>

      {/* VEHICLE DETAILS */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Vehicle Details
        </Text>

        {/* VEHICLE TYPE */}

        <View style={styles.vehicleTypeRow}>

          <TouchableOpacity
            style={[
              styles.vehicleTypeCard,
              vehicleType === "2W" &&
              styles.activeVehicleType
            ]}
            onPress={() => setVehicleType("2W")}
          >

            <FontAwesome5
              name="motorcycle"
              size={24}
              color={
                vehicleType === "2W"
                  ? "white"
                  : "#2563EB"
              }
            />

            <Text
              style={[
                styles.vehicleTypeText,
                vehicleType === "2W" &&
                styles.activeVehicleTypeText
              ]}
            >
              2 Wheeler
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.vehicleTypeCard,
              vehicleType === "4W" &&
              styles.activeVehicleType
            ]}
            onPress={() => setVehicleType("4W")}
          >

            <FontAwesome5
              name="car"
              size={22}
              color={
                vehicleType === "4W"
                  ? "white"
                  : "#2563EB"
              }
            />

            <Text
              style={[
                styles.vehicleTypeText,
                vehicleType === "4W" &&
                styles.activeVehicleTypeText
              ]}
            >
              4 Wheeler
            </Text>

          </TouchableOpacity>

        </View>

        <TextInput
          placeholder="Vehicle Number *"
          style={styles.input}
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />

        <TextInput
          placeholder="Vehicle Brand *"
          style={styles.input}
          value={vehicleBrand}
          onChangeText={setVehicleBrand}
        />

        <TextInput
          placeholder="Vehicle Model *"
          style={styles.input}
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />

        <TextInput
          placeholder="Vehicle Color"
          style={styles.input}
          value={vehicleColor}
          onChangeText={setVehicleColor}
        />

        <TextInput
          placeholder="Fuel Type (Petrol/Diesel/Electric)"
          style={styles.input}
          value={fuelType}
          onChangeText={setFuelType}
        />

        <TextInput
          placeholder="KMs Driven"
          style={styles.input}
          keyboardType="numeric"
          value={kmsDriven}
          onChangeText={setKmsDriven}
        />

      </View>

      {/* JOB DETAILS */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Job Details
        </Text>

        <TextInput
          placeholder="Customer Complaint / Problem Description"
          style={[
            styles.input,
            styles.textArea
          ]}
          multiline
          numberOfLines={4}
          value={problemDescription}
          onChangeText={setProblemDescription}
        />

        <TextInput
          placeholder="Expected Delivery Date"
          style={styles.input}
          value={expectedDelivery}
          onChangeText={setExpectedDelivery}
        />

      </View>

      {/* SERVICES */}

      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>
          Services
        </Text>

        <TouchableOpacity
          onPress={() =>
            setShowServiceForm(!showServiceForm)
          }
        >
          <Text style={styles.addServiceText}>
            + Add Service
          </Text>
        </TouchableOpacity>

      </View>

      {/* SERVICE FORM */}

      {showServiceForm && (

        <View style={styles.sectionCard}>

          <TextInput
            placeholder="Service Name"
            style={styles.input}
            value={serviceName}
            onChangeText={setServiceName}
          />

          <TextInput
            placeholder="Estimated Price"
            style={styles.input}
            keyboardType="numeric"
            value={servicePrice}
            onChangeText={setServicePrice}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={addService}
          >

            <Text style={styles.buttonText}>
              Save Service
            </Text>

          </TouchableOpacity>

        </View>

      )}

      {/* EMPTY STATE */}

      {services.length === 0 && (

        <View style={styles.emptyCard}>

          <Ionicons
            name="construct-outline"
            size={42}
            color="#9CA3AF"
          />

          <Text style={styles.emptyTitle}>
            No Services Added
          </Text>

          <Text style={styles.emptySub}>
            Add services for this job
          </Text>

        </View>

      )}

      {/* SERVICES LIST */}

      {services.map((item, index) => (

        <View
          key={index}
          style={styles.serviceCard}
        >

          <View style={styles.serviceLeft}>

            <View style={styles.serviceIcon}>

              <MaterialIcons
                name="build"
                size={18}
                color="#2563EB"
              />

            </View>

            <View>

              <Text style={styles.serviceName}>
                {item.name}
              </Text>

              <Text style={styles.servicePrice}>
                ₹{item.price}
              </Text>

            </View>

          </View>

          <TouchableOpacity
            onPress={() => deleteService(index)}
          >

            <MaterialIcons
              name="delete"
              size={22}
              color="#DC2626"
            />

          </TouchableOpacity>

        </View>

      ))}

      {/* SUMMARY */}

      <View style={styles.summaryCard}>

        <Text style={styles.summaryLabel}>
          Estimated Total
        </Text>

        <Text style={styles.summaryAmount}>
          ₹{totalPrice}
        </Text>

      </View>

      {/* CREATE BUTTON */}

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateJob}
      >

        <Text style={styles.createText}>
          Create Job
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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 5
  },

  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },

  textArea: {
    height: 100,
    textAlignVertical: "top"
  },

  vehicleTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },

  vehicleTypeCard: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },

  activeVehicleType: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB"
  },

  vehicleTypeText: {
    marginTop: 10,
    fontWeight: "600",
    color: "#111827"
  },

  activeVehicleTypeText: {
    color: "white"
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  addServiceText: {
    color: "#2563EB",
    fontWeight: "bold"
  },

  addButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    marginBottom: 15
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10
  },

  emptySub: {
    color: "#6B7280",
    marginTop: 4
  },

  serviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  serviceLeft: {
    flexDirection: "row",
    alignItems: "center"
  },

  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  serviceName: {
    fontWeight: "bold",
    fontSize: 16
  },

  servicePrice: {
    color: "#16A34A",
    marginTop: 3
  },

  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    marginTop: 10
  },

  summaryLabel: {
    color: "#D1D5DB",
    marginBottom: 6
  },

  summaryAmount: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold"
  },

  createButton: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20
  },

  createText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  }

})
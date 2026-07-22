import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native"

import { useEffect, useState } from "react"

import { Picker } from "@react-native-picker/picker"

import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons"

import {
  getJobById,
  updateJob,
  deleteJob
} from "../../services/jobService"

export default function JobDetailScreen({
  route,
  navigation
}: any) {

  const { jobId } = route.params

  const [loading, setLoading] = useState(true)

  const [job, setJob] = useState<any>(null)

  const loadJob = async () => {

    try {

      const response = await getJobById(jobId)

      setJob(response.job)

    }

    catch (err) {

      console.log(err)

      Alert.alert(
        "Error",
        "Unable to load job."
      )

    }

    finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    loadJob()

  }, [])

  const updateStatus = async (status: string) => {

    try {

      await updateJob(jobId, {
        status
      })

      setJob({
        ...job,
        status
      })

    }

    catch {

      Alert.alert(
        "Error",
        "Unable to update status."
      )

    }

  }

  const deleteCurrentJob = () => {

    Alert.alert(

      "Delete Job",

      "Are you sure?",

      [

        {
          text: "Cancel",
          style: "cancel"
        },

        {

          text: "Delete",

          style: "destructive",

          onPress: async () => {

            try {

              await deleteJob(jobId)

              navigation.goBack()

            }

            catch {

              Alert.alert(
                "Error",
                "Unable to delete job."
              )

            }

          }

        }

      ]

    )

  }

  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

      </View>

    )

  }

  const total = job.services.reduce(

    (sum: number, item: any) =>

      sum +

      item.actualPrice *

      item.quantity,

    0

  )

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.headerCard}>

        <View>

          <Text style={styles.vehicleNumber}>
            {job.vehicleNumber}
          </Text>

          <Text style={styles.vehicleModel}>
            {job.vehicleBrand} {job.vehicleModel}
          </Text>

        </View>

        <View style={styles.statusContainer}>

          <Picker

            selectedValue={job.status}

            style={styles.statusPicker}

            onValueChange={updateStatus}

          >

            <Picker.Item
              label="Pending"
              value="pending"
            />

            <Picker.Item
              label="In Progress"
              value="progress"
            />

            <Picker.Item
              label="Waiting Parts"
              value="waiting_parts"
            />

            <Picker.Item
              label="Ready"
              value="ready"
            />

            <Picker.Item
              label="Completed"
              value="completed"
            />

            <Picker.Item
              label="Delivered"
              value="delivered"
            />

          </Picker>

        </View>

      </View>

      {/* CUSTOMER */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Customer
        </Text>

        <View style={styles.infoRow}>

          <Ionicons
            name="person-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {job.customerName}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="call-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {job.phone}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="location-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {job.customerAddress || "-"}
          </Text>

        </View>

      </View>

      {/* VEHICLE */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Vehicle
        </Text>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Brand
          </Text>

          <Text style={styles.value}>
            {job.vehicleBrand || "-"}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Model
          </Text>

          <Text style={styles.value}>
            {job.vehicleModel}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Type
          </Text>

          <Text style={styles.value}>
            {job.vehicleType}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Odometer
          </Text>

          <Text style={styles.value}>
            {job.odometer || "-"} km
          </Text>

        </View>

      </View>

      {/* JOB INFO */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Job Information
        </Text>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Assigned Worker
          </Text>

          <Text style={styles.value}>
            {job.worker?.name || "-"}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Priority
          </Text>

          <Text style={styles.value}>
            {job.priority || "-"}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Delivery
          </Text>

          <Text style={styles.value}>
            {job.deliveryDate
              ? new Date(
                  job.deliveryDate
                ).toLocaleString()
              : "-"
            }
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Complaint
          </Text>

          <Text style={styles.value}>
            {job.complaint || "-"}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Inspection
          </Text>

          <Text style={styles.value}>
            {job.inspectionNotes || "-"}
          </Text>

        </View>

      </View>

      {/* SERVICES */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Services
        </Text>

        {job.services.map((service: any, index: number) => (

          <View
            key={index}
            style={styles.serviceRow}
          >

            <View style={{ flex: 1 }}>

              <Text style={styles.serviceName}>
                {service.name}
              </Text>

              <Text style={styles.serviceQty}>
                Qty : {service.quantity}
              </Text>

            </View>

            <Text style={styles.servicePrice}>
              ₹{service.actualPrice * service.quantity}
            </Text>

          </View>

        ))}

      </View>

      {/* BILL */}

      <View style={styles.totalCard}>

        <Text style={styles.totalLabel}>
          Estimated Bill
        </Text>

        <Text style={styles.totalAmount}>
          ₹{total}
        </Text>

      </View>

      {/* PAYMENT */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Payment
        </Text>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Status
          </Text>

          <Text style={styles.value}>
            {job.paymentStatus || "Pending"}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Text style={styles.label}>
            Method
          </Text>

          <Text style={styles.value}>
            {job.paymentMethod || "-"}
          </Text>

        </View>

      </View>

      {/* NOTES */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Notes
        </Text>

        <Text style={styles.notesText}>
          {job.notes || "No notes added."}
        </Text>

      </View>

      {/* ACTION BUTTONS */}

      <TouchableOpacity

        style={styles.primaryButton}

        onPress={() =>
          navigation.navigate("EditJobScreen", {
              job
          })
        }

      >

        <Ionicons
          name="create-outline"
          size={20}
          color="white"
        />

        <Text style={styles.buttonText}>
          Edit Job
        </Text>

      </TouchableOpacity>

      <TouchableOpacity

  style={[

    styles.invoiceButton,

    job.status !== "completed" &&

    styles.disabledButton

  ]}

  disabled={job.status !== "completed"}

  onPress={() =>
    navigation.navigate(
      "Invoice",
      { jobId }
    )
  }

>

  <Ionicons
    name="document-text-outline"
    size={20}
    color="white"
  />

  <Text style={styles.buttonText}>

    {job.status === "completed"

      ? "Generate Invoice"

      : "Complete Job First"}

  </Text>

</TouchableOpacity>
{job.status !== "completed" && ( 
  <Text style={styles.invoiceHint}> Complete the job to enable invoice generation. </Text> 
)}

      <TouchableOpacity

        style={styles.deleteButton}

        onPress={deleteCurrentJob}

      >

        <Ionicons
          name="trash-outline"
          size={20}
          color="white"
        />

        <Text style={styles.buttonText}>
          Delete Job
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

    padding: 16

  },

  disabledButton: { 
    backgroundColor: "#9CA3AF", 
    opacity: 0.7 
  }, 
  
  invoiceHint: { 
    textAlign: "center", 
    color: "#6B7280", 
    fontSize: 13, 
    marginTop: 8, 
    marginBottom: 14, 
    fontStyle: "italic" 
  },

  loader: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center"

  },

  headerCard: {

    backgroundColor: "#2563EB",

    borderRadius: 22,

    padding: 20,

    marginBottom: 18

  },

  vehicleNumber: {

    color: "white",

    fontSize: 26,

    fontWeight: "700"

  },

  vehicleModel: {

    color: "#DBEAFE",

    marginTop: 6,

    fontSize: 15

  },

  statusContainer: {

    marginTop: 18,

    backgroundColor: "white",

    borderRadius: 12,

    overflow: "hidden"

  },

  statusPicker: {

    height: 50

  },

  card: {

    backgroundColor: "white",

    borderRadius: 18,

    padding: 18,

    marginBottom: 16

  },

  sectionTitle: {

    fontSize: 17,

    fontWeight: "700",

    marginBottom: 16,

    color: "#111827"

  },

  infoRow: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 12

  },

  infoText: {

    marginLeft: 10,

    color: "#374151",

    fontSize: 15,

    flex: 1

  },

  detailRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 14

  },

  label: {

    color: "#6B7280",

    fontSize: 14

  },

  value: {

    color: "#111827",

    fontWeight: "600",

    flex: 1,

    textAlign: "right",

    marginLeft: 20

  },

  serviceRow: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 12,

    borderBottomWidth: 1,

    borderBottomColor: "#F3F4F6"

  },

  serviceName: {

    fontWeight: "600",

    color: "#111827"

  },

  serviceQty: {

    color: "#6B7280",

    marginTop: 4

  },

  servicePrice: {

    fontWeight: "700",

    color: "#16A34A"

  },

  totalCard: {

    backgroundColor: "#111827",

    borderRadius: 18,

    padding: 22,

    marginBottom: 18

  },

  totalLabel: {

    color: "#D1D5DB"

  },

  totalAmount: {

    color: "white",

    fontSize: 30,

    fontWeight: "700",

    marginTop: 8

  },

  notesText: {

    color: "#374151",

    lineHeight: 22

  },

  primaryButton: {

    backgroundColor: "#2563EB",

    height: 55,

    borderRadius: 16,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 14

  },

  invoiceButton: {

    backgroundColor: "#16A34A",

    height: 55,

    borderRadius: 16,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 14

  },

  deleteButton: {

    backgroundColor: "#DC2626",

    height: 55,

    borderRadius: 16,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center"

  },

  buttonText: {

    color: "white",

    fontWeight: "700",

    fontSize: 16,

    marginLeft: 8

  }

})

      
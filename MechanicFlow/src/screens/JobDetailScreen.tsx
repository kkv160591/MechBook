// JobDetailScreen.tsx

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView
} from "react-native"

import { useState } from "react"

import {
  RouteProp,
  useNavigation
} from "@react-navigation/native"

import { NativeStackNavigationProp } from "@react-navigation/native-stack"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import { RootStackParamList } from "../types/navigation"

type JobDetailRouteProp = RouteProp<
  RootStackParamList,
  "JobDetail"
>

type Props = {
  route: JobDetailRouteProp
}

type Service = {
  id: string
  name: string
  estimatedPrice: number
  actualPrice?: number
}

export default function JobDetailScreen({
  route
}: Props) {

  type NavigationType =
    NativeStackNavigationProp<
      RootStackParamList,
      "JobDetail"
    >

  const navigation =
    useNavigation<NavigationType>()

  const { job } = route.params

  const [services, setServices] =
    useState<Service[]>(
      job.services || []
    )

  const [status, setStatus] =
    useState(job.status || "pending")

  const [showModal, setShowModal] =
    useState(false)

  const [newService, setNewService] =
    useState("")

  const [newPrice, setNewPrice] =
    useState("")

  const addService = () => {

    if (!newService || !newPrice) {

      Alert.alert(
        "Validation",
        "Please enter service details"
      )

      return
    }

    const service: Service = {
      id: `${Date.now()}-${Math.random()}`,
      name: newService,
      estimatedPrice: Number(newPrice)
    }

    setServices(prev => [...prev, service])

    setNewService("")
    setNewPrice("")

    setShowModal(false)
  }

  const removeService = (
    id: string
  ) => {

    Alert.alert(
      "Delete Service",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setServices(prev =>
              prev.filter(
                s => s.id !== id
              )
            )
          }
        }
      ]
    )
  }

  const updateActualPrice = (
    id: string,
    value: string
  ) => {

    setServices(prev =>
      prev.map(service => {

        if (service.id === id) {

          return {
            ...service,
            actualPrice: value === ""
              ? undefined
              : Number(value)
          }

        }

        return service

      })
    )

  }

  const total = services.reduce(
    (sum, s) =>
      sum +
      (
        s.actualPrice ??
        s.estimatedPrice
      ),
    0
  )

  const markComplete = () => {

    setStatus("completed")

    Alert.alert(
      "Job Completed",
      "Invoice is ready",
      [
        {
          text: "View Invoice",
          onPress: () =>
            navigation.navigate(
              "Invoice",
              {
                job: {
                  ...job,
                  services,
                  status
                }
              }
            )
        }
      ]
    )
  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER CARD */}

      <View style={styles.headerCard}>

        <View style={styles.vehicleIcon}>

          <FontAwesome5
            name={
              job.vehicleType === "2 Wheeler"
                ? "motorcycle"
                : "car"
            }
            size={24}
            color="#2563EB"
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.vehicleNumber}>
            {job.vehicleNumber}
          </Text>

          <Text style={styles.vehicleModel}>
            {job.vehicleModel}
          </Text>

        </View>

        <View
          style={[
            styles.statusBadge,

            status === "completed"
              ? styles.completedBadge
              : status === "progress"
              ? styles.progressBadge
              : styles.pendingBadge
          ]}
        >

          <Text
            style={[
              styles.statusText,

              status === "completed"
                ? {
                    color: "#16A34A"
                  }
                : status === "progress"
                ? {
                    color: "#2563EB"
                  }
                : {
                    color: "#DC2626"
                  }
            ]}
          >
            {status.toUpperCase()}
          </Text>

        </View>

      </View>

      {/* CUSTOMER CARD */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Customer Details
        </Text>

        <View style={styles.infoRow}>

          <Ionicons
            name="person-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.customerName}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="call-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.phone}
          </Text>

        </View>

      </View>

      {/* SERVICES */}

      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>
          Services
        </Text>

        {status !== "completed" && (

          <TouchableOpacity
            onPress={() =>
              setShowModal(true)
            }
          >

            <Text style={styles.addService}>
              + Add Service
            </Text>

          </TouchableOpacity>

        )}

      </View>

      {services.map(item => (

        <View
          key={`${item.id}`}
          style={styles.serviceCard}
        >

          <View style={styles.serviceTop}>

            <View>

              <Text style={styles.serviceName}>
                {item.name}
              </Text>

              <Text style={styles.estimated}>
                Estimated ₹
                {item.estimatedPrice}
              </Text>

            </View>

            {status !== "completed" && (

              <TouchableOpacity
                onPress={() =>
                  removeService(item.id)
                }
              >

                <MaterialIcons
                  name="delete-outline"
                  size={22}
                  color="#DC2626"
                />

              </TouchableOpacity>

            )}

          </View>

          <TextInput
            placeholder="Actual Price"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            style={styles.priceInput}
            editable={
              status !== "completed"
            }
            value={
              item.actualPrice
                ? String(
                    item.actualPrice
                  )
                : ""
            }
            onChangeText={(v) =>
              updateActualPrice(
                item.id,
                v
              )
            }
          />

        </View>

      ))}

      {/* TOTAL */}

      <View style={styles.totalCard}>

        <Text style={styles.totalLabel}>
          Total Amount
        </Text>

        <Text style={styles.totalAmount}>
          ₹{total}
        </Text>

      </View>

      {/* BUTTONS */}

      {status !== "completed" ? (

        <TouchableOpacity
          style={styles.completeBtn}
          onPress={markComplete}
        >

          <Text style={styles.completeText}>
            Finalize Job
          </Text>

        </TouchableOpacity>

      ) : (

        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() =>
            navigation.navigate(
              "Invoice",
              {
                job: {
                  ...job,
                  services,
                  status
                }
              }
            )
          }
        >

          <Text style={styles.invoiceText}>
            View Invoice
          </Text>

        </TouchableOpacity>

      )}

      <View style={{ height: 50 }} />

      {/* MODAL */}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              Add Service
            </Text>

            <TextInput
              placeholder="Service Name"
              style={styles.input}
              value={newService}
              onChangeText={setNewService}
            />

            <TextInput
              placeholder="Estimated Price"
              keyboardType="numeric"
              style={styles.input}
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={addService}
            >

              <Text style={styles.saveText}>
                Save Service
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setShowModal(false)
              }
            >

              <Text style={styles.cancelText}>
                Cancel
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  headerCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },

  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },

  vehicleNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827"
  },

  vehicleModel: {
    marginTop: 4,
    color: "#6B7280"
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30
  },

  pendingBadge: {
    backgroundColor: "#FEF2F2"
  },

  progressBadge: {
    backgroundColor: "#DBEAFE"
  },

  completedBadge: {
    backgroundColor: "#DCFCE7"
  },

  statusText: {
    fontWeight: "bold",
    fontSize: 12
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#111827"
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  infoText: {
    marginLeft: 10,
    color: "#111827",
    fontSize: 15
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827"
  },

  addService: {
    color: "#2563EB",
    fontWeight: "bold"
  },

  serviceCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12
  },

  serviceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827"
  },

  estimated: {
    marginTop: 4,
    color: "#6B7280"
  },

  priceInput: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F9FAFB"
  },

  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 20,
    marginTop: 10
  },

  totalLabel: {
    color: "#D1D5DB"
  },

  totalAmount: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8
  },

  completeBtn: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20
  },

  completeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17
  },

  invoiceBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20
  },

  invoiceText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end"
  },

  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  cancelText: {
    textAlign: "center",
    marginTop: 18,
    color: "#6B7280",
    fontWeight: "600"
  }

})
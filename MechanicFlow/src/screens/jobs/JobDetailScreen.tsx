// JobDetailScreen.tsx

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView
} from "react-native"

import { useMemo, useState } from "react"

import {
  RouteProp,
  useNavigation
} from "@react-navigation/native"

import {
  NativeStackNavigationProp
} from "@react-navigation/native-stack"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import { RootStackParamList } from "../../types/navigation"

type JobDetailRouteProp =
  RouteProp<RootStackParamList, "JobDetail">

type Props = {
  route: JobDetailRouteProp
}

type NavigationType =
  NativeStackNavigationProp<
    RootStackParamList,
    "JobDetail"
  >

type Service = {
  id: string
  name: string
  estimatedPrice: number
  actualPrice?: number
}

export default function JobDetailScreen({
  route
}: Props) {

  const navigation =
    useNavigation<NavigationType>()

  const { job } = route.params

  const [services, setServices] =
    useState<Service[]>(
      (job.services || []).map(
        (s: any, index: number) => ({
          id:
            s.id ||
            `${Date.now()}-${index}`,
          name: s.name,
          estimatedPrice:
            s.estimatedPrice ??
            s.price ??
            0,
          actualPrice: s.actualPrice
        })
      )
    )

  const [status, setStatus] =
    useState(
      job.status || "pending"
    )

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
        "Enter service details"
      )

      return
    }

    const service: Service = {
      id: Date.now().toString(),
      name: newService,
      estimatedPrice:
        Number(newPrice)
    }

    setServices(prev => [
      ...prev,
      service
    ])

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
            actualPrice:
              value === ""
                ? undefined
                : Number(value)
          }

        }

        return service

      })
    )

  }

  const total = useMemo(() => {

    return services.reduce(
      (sum, s) =>
        sum +
        (
          s.actualPrice ??
          s.estimatedPrice
        ),
      0
    )

  }, [services])

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
                  status: "completed"
                }
              }
            )
        }
      ]
    )

  }

  const renderService = ({
    item
  }: {
    item: Service
  }) => (

    <View style={styles.serviceCard}>

      <View style={styles.serviceTop}>

        <View style={{ flex: 1 }}>

          <Text style={styles.serviceName}>
            {item.name}
          </Text>

          <Text style={styles.estimate}>
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

      <View style={styles.actualPriceRow}>

        <Text style={styles.actualLabel}>
          Final Price
        </Text>

        <TextInput
          placeholder="0"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
          style={styles.priceInput}
          editable={
            status !== "completed"
          }
          value={
            item.actualPrice !==
            undefined
              ? String(
                  item.actualPrice
                )
              : ""
          }
          onChangeText={value =>
            updateActualPrice(
              item.id,
              value
            )
          }
        />

      </View>

    </View>

  )

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}

      <View style={styles.headerCard}>

        <View style={styles.vehicleIcon}>

          <Ionicons
            name={
              job.vehicleType ===
              "2W"
                ? "bicycle"
                : "car-sport"
            }
            size={24}
            color="#2563EB"
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text
            style={styles.vehicleNumber}
          >
            {
              job.vehicleNumber
            }
          </Text>

          <Text
            style={styles.vehicleModel}
          >
            {job.vehicleBrand}{" "}
            {job.vehicleModel}
          </Text>

        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                status ===
                "completed"
                  ? "#DCFCE7"
                  : "#FEF3C7"
            }
          ]}
        >

          <Text
            style={[
              styles.statusText,
              {
                color:
                  status ===
                  "completed"
                    ? "#16A34A"
                    : "#D97706"
              }
            ]}
          >
            {status.toUpperCase()}
          </Text>

        </View>

      </View>

      {/* JOB INFO */}

      <View style={styles.quickInfoRow}>

        <View style={styles.quickInfoCard}>

          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2563EB"
          />

          <Text style={styles.quickLabel}>
            Delivery
          </Text>

          <Text style={styles.quickValue}>
            {job.expectedDelivery ||
              "Not Set"}
          </Text>

        </View>

        <View style={styles.quickInfoCard}>

          <FontAwesome5
            name="tools"
            size={16}
            color="#2563EB"
          />

          <Text style={styles.quickLabel}>
            Services
          </Text>

          <Text style={styles.quickValue}>
            {services.length}
          </Text>

        </View>

      </View>

      {/* CUSTOMER */}

      <View style={styles.sectionCard}>

        <Text
          style={styles.sectionTitle}
        >
          Customer Details
        </Text>

        <View style={styles.infoRow}>

          <Ionicons
            name="person-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.customer ||
              "Unknown"}
          </Text>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="call-outline"
            size={18}
            color="#6B7280"
          />

          <Text style={styles.infoText}>
            {job.phone ||
              "No Phone"}
          </Text>

        </View>

        {!!job.alternatePhone && (

          <View
            style={styles.infoRow}
          >

            <Ionicons
              name="call"
              size={18}
              color="#6B7280"
            />

            <Text
              style={styles.infoText}
            >
              {
                job.alternatePhone
              }
            </Text>

          </View>

        )}

      </View>

      {/* VEHICLE DETAILS */}

      <View style={styles.sectionCard}>

        <Text
          style={styles.sectionTitle}
        >
          Vehicle Details
        </Text>

        <View style={styles.grid}>

          <View
            style={styles.gridItem}
          >

            <Text
              style={styles.label}
            >
              Type
            </Text>

            <Text
              style={styles.value}
            >
              {
                job.vehicleType
              }
            </Text>

          </View>

          <View
            style={styles.gridItem}
          >

            <Text
              style={styles.label}
            >
              Fuel
            </Text>

            <Text
              style={styles.value}
            >
              {job.fuelType ||
                "-"}
            </Text>

          </View>

          <View
            style={styles.gridItem}
          >

            <Text
              style={styles.label}
            >
              KM Driven
            </Text>

            <Text
              style={styles.value}
            >
              {job.kmsDriven ||
                "-"}
            </Text>

          </View>

          <View
            style={styles.gridItem}
          >

            <Text
              style={styles.label}
            >
              Color
            </Text>

            <Text
              style={styles.value}
            >
              {
                job.vehicleColor ||
                "-"
              }
            </Text>

          </View>

        </View>

      </View>

      {/* COMPLAINT */}

      <View style={styles.sectionCard}>

        <Text
          style={styles.sectionTitle}
        >
          Complaint / Notes
        </Text>

        <Text style={styles.notes}>
          {job.problemDescription ||
            "No description added"}
        </Text>

      </View>

      {/* SERVICES */}

      <View
        style={styles.servicesHeader}
      >

        <Text
          style={styles.sectionTitle}
        >
          Services & Labour
        </Text>

        {status !==
          "completed" && (

          <TouchableOpacity
            onPress={() =>
              setShowModal(true)
            }
          >

            <Text
              style={
                styles.addService
              }
            >
              + Add
            </Text>

          </TouchableOpacity>

        )}

      </View>

      <FlatList
        data={services}
        scrollEnabled={false}
        keyExtractor={item =>
          item.id
        }
        renderItem={renderService}
      />

      {/* TOTAL */}

      <View style={styles.totalCard}>

        <Text
          style={styles.totalLabel}
        >
          Total Invoice Amount
        </Text>

        <Text
          style={styles.totalAmount}
        >
          ₹{total}
        </Text>

      </View>

      {/* ACTION BUTTON */}

      {status !==
      "completed" ? (

        <TouchableOpacity
          style={styles.completeBtn}
          onPress={markComplete}
        >

          <Text
            style={
              styles.completeText
            }
          >
            Complete Job &
            Generate Invoice
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

          <Text
            style={
              styles.invoiceText
            }
          >
            View Invoice
          </Text>

        </TouchableOpacity>

      )}

      <View style={{ height: 40 }} />

      {/* MODAL */}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
      >

        <View
          style={styles.modalOverlay}
        >

          <View
            style={styles.modalContent}
          >

            <Text
              style={styles.modalTitle}
            >
              Add Service
            </Text>

            <TextInput
              placeholder="Service Name"
              style={
                styles.modalInput
              }
              value={newService}
              onChangeText={
                setNewService
              }
            />

            <TextInput
              placeholder="Estimated Price"
              keyboardType="numeric"
              style={
                styles.modalInput
              }
              value={newPrice}
              onChangeText={
                setNewPrice
              }
            />

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={addService}
            >

              <Text
                style={
                  styles.modalBtnText
                }
              >
                Save Service
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setShowModal(false)
              }
            >

              <Text
                style={styles.cancel}
              >
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
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },

  vehicleModel: {
    color: "#6B7280",
    marginTop: 4
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30
  },

  statusText: {
    fontWeight: "bold",
    fontSize: 12
  },

  quickInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },

  quickInfoCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16
  },

  quickLabel: {
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 4
  },

  quickValue: {
    fontWeight: "bold",
    color: "#111827"
  },

  sectionCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#111827"
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14
  },

  infoText: {
    marginLeft: 10,
    color: "#111827",
    fontSize: 15
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },

  gridItem: {
    width: "50%",
    marginBottom: 18
  },

  label: {
    color: "#6B7280",
    marginBottom: 5,
    fontSize: 13
  },

  value: {
    fontWeight: "bold",
    color: "#111827",
    fontSize: 15
  },

  notes: {
    color: "#374151",
    lineHeight: 22
  },

  servicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  addService: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 15
  },

  serviceCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },

  serviceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },

  serviceName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#111827"
  },

  estimate: {
    marginTop: 5,
    color: "#6B7280"
  },

  actualPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  actualLabel: {
    color: "#374151",
    fontWeight: "600"
  },

  priceInput: {
    width: 120,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlign: "right",
    fontWeight: "bold",
    color: "#111827"
  },

  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 22,
    marginTop: 8
  },

  totalLabel: {
    color: "#D1D5DB"
  },

  totalAmount: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 8
  },

  completeBtn: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 18
  },

  completeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  invoiceBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 18
  },

  invoiceText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.4)",
    padding: 20
  },

  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827"
  },

  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },

  modalBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },

  modalBtnText: {
    color: "white",
    fontWeight: "bold"
  },

  cancel: {
    textAlign: "center",
    marginTop: 16,
    color: "#6B7280"
  }

})
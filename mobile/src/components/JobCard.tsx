// JobCard.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native"

import {
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"

export default function JobCard({ job }: any) {

  const navigation = useNavigation<any>()

  const totalPrice = job.services.reduce(
    (sum: number, s: any) =>
      sum + (s.actualPrice ?? s.price ?? s.estimatedPrice ?? 0),
    0
  )

  const getStatusColor = () => {

    switch (job.status) {

      case "completed":
        return "#16A34A"

      case "progress":
        return "#F59E0B"

      case "pending":
        return "#DC2626"

      default:
        return "#2563EB"
    }
  }

  return (

    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("JobDetail", { job })
      }
    >

      {/* TOP */}

      <View style={styles.topRow}>

        <View style={styles.vehicleBox}>

          <View style={styles.vehicleIcon}>

            <MaterialCommunityIcons
              name={
                job.vehicleType === "2 Wheeler"
                  ? "motorbike"
                  : "car"
              }
              size={22}
              color="#2563EB"
            />

          </View>

          <View>

            <Text style={styles.vehicle}>
              {job.vehicleNumber}
            </Text>

            <Text style={styles.model}>
              {job.vehicleModel}
            </Text>

          </View>

        </View>

        <Text style={styles.price}>
          ₹{totalPrice}
        </Text>

      </View>

      {/* CUSTOMER */}

      <View style={styles.infoRow}>

        <Ionicons
          name="person-outline"
          size={16}
          color="#6B7280"
        />

        <Text style={styles.infoText}>
          {job.customerName}
        </Text>

      </View>

      <View style={styles.infoRow}>

        <Ionicons
          name="call-outline"
          size={16}
          color="#6B7280"
        />

        <Text style={styles.infoText}>
          {job.phone}
        </Text>

      </View>

      {/* FOOTER */}

      <View style={styles.footer}>

        <View style={styles.serviceBadge}>

          <Text style={styles.serviceText}>
            {job.services.length} Service
            {job.services.length > 1 ? "s" : ""}
          </Text>

        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${getStatusColor()}15`
            }
          ]}
        >

          <Text
            style={[
              styles.statusText,
              {
                color: getStatusColor()
              }
            ]}
          >
            {job.status.toUpperCase()}
          </Text>

        </View>

      </View>

    </TouchableOpacity>

  )

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  vehicleBox: {
    flexDirection: "row",
    alignItems: "center"
  },

  vehicleIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  vehicle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  model: {
    color: "#6B7280",
    marginTop: 3
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#16A34A"
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14
  },

  infoText: {
    marginLeft: 8,
    color: "#374151"
  },

  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  serviceBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },

  serviceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151"
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },

  statusText: {
    fontSize: 12,
    fontWeight: "bold"
  }

})
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import { Ionicons } from "@expo/vector-icons"

export default function WorkerCard({
  worker,
  onPress
}: any) {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <View>

        <Text style={styles.name}>
          {worker.name}
        </Text>

        <Text style={styles.role}>
          {worker.role}
        </Text>

        <Text style={styles.phone}>
          {worker.phone}
        </Text>

      </View>

      <View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                worker.active
                  ? "#DCFCE7"
                  : "#FEE2E2"
            }
          ]}
        >
          <Text
            style={{
              color:
                worker.active
                  ? "#16A34A"
                  : "#DC2626"
            }}
          >
            {worker.active
              ? "Active"
              : "Inactive"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />

      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  name: {
    fontSize: 16,
    fontWeight: "700"
  },

  role: {
    color: "#6B7280",
    marginTop: 3
  },

  phone: {
    color: "#9CA3AF",
    marginTop: 2
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8
  }

})
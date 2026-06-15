import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import {
  MaterialIcons,
  Ionicons
} from "@expo/vector-icons"

import {
  useEffect,
  useState
} from "react"

import {
  getWorkerById,
  resetWorkerPin,
  updateWorkerStatus
} from "../../services/workerService"

export default function WorkerDetailsScreen({
  route,
  navigation
}: any) {

  const [worker, setWorker] =
    useState<any>(null)

  useEffect(() => {

    loadWorker()

  }, [])

  const loadWorker =
    async () => {

      try {

        const response =
          await getWorkerById(
            route.params.workerId
          )

        setWorker(
          response.worker
        )

      }

      catch (error) {

        console.log(error)

      }

    }

  if (!worker) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <Text>
          Loading...
        </Text>

      </View>

    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.profileCard}>

        <View style={styles.avatar}>

          <Ionicons
            name="person"
            size={34}
            color="#2563EB"
          />

        </View>

        <Text style={styles.name}>
          {worker.name}
        </Text>

        <Text style={styles.role}>
          {worker.role}
        </Text>

        <View
          style={[
            styles.statusBadge,
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
                  : "#DC2626",
              fontWeight: "700"
            }}
          >
            {worker.active
              ? "ACTIVE"
              : "INACTIVE"}
          </Text>
        </View>

      </View>

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Contact Information
        </Text>

        <Text style={styles.label}>
          Phone
        </Text>

        <Text style={styles.value}>
          {worker.phone}
        </Text>

      </View>

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Recent Login Activity
        </Text>

        {(worker.loginHistory || [])
          .slice(0, 3)
          .map((item: any, index: number) => (

            <View
              key={index}
              style={styles.historyRow}
            >

              <Ionicons
                name="time-outline"
                size={18}
                color="#6B7280"
              />

              <Text style={styles.historyText}>
                {item.date} • {item.time}
              </Text>

            </View>

          ))}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "LoginHistory",
              { worker }
            )
          }
        >

          <Text style={styles.viewAll}>
            View Full History
          </Text>

        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() =>
          navigation.navigate(
            "EditWorker",
            { worker }
          )
        }
      >

        <MaterialIcons
          name="edit"
          size={20}
          color="white"
        />

        <Text style={styles.btnText}>
          Edit Worker
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.orangeBtn}
        onPress={async () => {

          try {

            await resetWorkerPin(
              worker.workerId,
              "1234"
            )

            Alert.alert(
              "Success",
              "PIN reset to 1234"
            )

          }

          catch {

            Alert.alert(
              "Error",
              "Failed to reset PIN"
            )

          }

        }}
      ></TouchableOpacity>

      <TouchableOpacity
        style={styles.redBtn}
        onPress={async () => {

          try {

            await updateWorkerStatus(
              worker.workerId,
              false
            )

            loadWorker()

          }

          catch {

            Alert.alert(
              "Error",
              "Failed to update worker"
            )

          }

        }}
      ></TouchableOpacity>

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

  profileCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center"
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center"
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14
  },

  role: {
    color: "#6B7280",
    marginTop: 4
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14
  },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginTop: 16
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },

  label: {
    color: "#6B7280"
  },

  value: {
    fontWeight: "600",
    marginTop: 4
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  historyText: {
    marginLeft: 8,
    color: "#374151"
  },

  viewAll: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 10
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    marginTop: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  orangeBtn: {
    backgroundColor: "#F59E0B",
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  redBtn: {
    backgroundColor: "#DC2626",
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  btnText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8
  }

})
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native"

import { MaterialIcons } from "@expo/vector-icons"
import { 
  useNavigation,
  useFocusEffect
} from "@react-navigation/native"

import {
  useEffect,
  useState,
  useCallback
} from "react"

import {
  getWorkers
} from "../../services/workerService"

export default function WorkersScreen() {
  const navigation: any = useNavigation()
  const [workers, setWorkers] =
  useState<any[]>([])

  useFocusEffect(
    useCallback(() => {

      loadWorkers()

    }, [])
  )

  const [loading, setLoading] =
  useState(true)

  const loadWorkers =
  async () => {

    try {

      setLoading(true)
      const response =
        await getWorkers()

      setWorkers(
        response.workers || []
      )

    }

    catch (error) {

      console.log(error)

    }
    finally {

      setLoading(false)

    }

  
  }

  if (loading) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={{
            marginTop: 12,
            color: "#6B7280"
          }}
        >
          Loading workers...
        </Text>

      </View>

    )

  }
  
  return (

    <View style={styles.container}>

      <FlatList
        ListEmptyComponent={() => (

          <View
            style={{
              marginTop: 80,
              alignItems: "center"
            }}
          >

            <MaterialIcons
              name="people-outline"
              size={60}
              color="#9CA3AF"
            />

            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                color: "#6B7280"
              }}
            >
              No workers found
            </Text>

          </View>

        )}
        data={workers}
        keyExtractor={(item) => item.workerId}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
              "WorkerDetails",
              {
                workerId:
                  item.workerId
              }
            )
            }
          >

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.role}>
                {item.role}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: item.active
                    ? "#DCFCE7"
                    : "#FEE2E2"
                }
              ]}
            >
              <Text
                style={{
                  color: item.active
                    ? "#16A34A"
                    : "#DC2626",
                  fontWeight: "bold"
                }}
              >
                {item.active
                  ? "ACTIVE"
                  : "INACTIVE"}
              </Text>
            </View>

          </TouchableOpacity>

        )}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          navigation.navigate("AddWorker")
        }
      >

        <MaterialIcons
          name="person-add"
          size={22}
          color="white"
        />

        <Text style={styles.addText}>
          Add Worker
        </Text>

      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827"
  },

  role: {
    color: "#6B7280",
    marginTop: 4
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },

  addBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  addText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8
  }

})
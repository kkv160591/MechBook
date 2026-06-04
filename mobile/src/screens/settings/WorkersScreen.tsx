import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import { MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const workers = [
  {
    id: "1",
    name: "Rahul Sharma",
    role: "Senior Mechanic",
    active: true
  },
  {
    id: "2",
    name: "Amit Kumar",
    role: "Helper",
    active: true
  },
  {
    id: "3",
    name: "Vijay Singh",
    role: "Electrician",
    active: false
  }
]

export default function WorkersScreen() {
  const navigation: any = useNavigation()
  return (

    <View style={styles.container}>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                "WorkerDetails",
                { worker: item }
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
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList
} from "react-native"

import {
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import { useNavigation } from "@react-navigation/native"

import CustomerCard from "../../components/CustomerCard"

import {
  getCustomers
} from "../../services/customerService"

export default function CustomersScreen() {

  const navigation: any = useNavigation()

  const [search, setSearch] = useState("")

  const [customers, setCustomers] =
    useState<any[]>([])

  useEffect(() => {

    loadCustomers()

  }, [])

  const loadCustomers =
  async () => {

    try {

      const response =
        await getCustomers()

      console.log(
        "CUSTOMERS RESPONSE",
        response
      )

      setCustomers(
        response.customers || []
      )

    }

    catch (error) {

      console.log(error)

    }

  }

  const filteredCustomers = useMemo(() => {

    return customers.filter(customer => {

      const query = search.toLowerCase()

      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      )

    })

  }, [search, customers])

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.headerRow}>

        <View>

          <Text style={styles.title}>
            Customers
          </Text>

          <Text style={styles.subtitle}>
            Manage garage customers
          </Text>

        </View>

        <TouchableOpacity style={styles.headerBtn}>

          <Ionicons
            name="people"
            size={22}
            color="#2563EB"
          />

        </TouchableOpacity>

      </View>

      {/* STATS */}

      <View style={styles.statsRow}>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            {customers.length}
          </Text>

          <Text style={styles.statLabel}>
            Customers
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            ₹48k
          </Text>

          <Text style={styles.statLabel}>
            Revenue
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statValue}>
            18
          </Text>

          <Text style={styles.statLabel}>
            Pending
          </Text>

        </View>

      </View>

      {/* SEARCH */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
        />

        <TextInput
          placeholder="Search customer..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* LIST */}

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 120
        }}
        renderItem={({ item }) => (

          <CustomerCard
            customer={item}
            onPress={() =>
              navigation.navigate(
                "CustomerDetail",
                { customer: item }
              )
            }
          />

        )}
      />

      {/* FAB */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddCustomer")
        }
      >

        <MaterialIcons
          name="add"
          size={30}
          color="white"
        />

      </TouchableOpacity>

    </SafeAreaView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4
  },

  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 22
  },

  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginHorizontal: 4
  },

  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },

  statLabel: {
    color: "#6B7280",
    marginTop: 5
  },

  searchBox: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 18,
    marginTop: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    color: "#111827"
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8
  }

})
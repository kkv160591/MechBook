// InventoryScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput
} from "react-native"

import {
  useEffect,
  useMemo,
  useState
} from "react"

import {
  MaterialIcons,
  Ionicons
} from "@expo/vector-icons"

import { useNavigation } from "@react-navigation/native"

import InventoryCard from "../../components/InventoryCard"

import {
  getInventory
} from "../../services/inventoryService"

export default function InventoryScreen() {

  const navigation: any = useNavigation()

  const [search, setSearch] = useState("")

  const [parts, setParts] =
  useState<any[]>([])

  useEffect(() => {

    loadInventory()

  }, [])

  const loadInventory =
  async () => {

    try {

      const response =
        await getInventory()

      setParts(
        response.parts || []
      )

    }

    catch (error) {

      console.log(error)

    }

  }

  const filteredParts = useMemo(() => {

    return parts.filter((item) => {

      const text = search.toLowerCase()

      return (
        item.name?.toLowerCase().includes(text) ||
        item.sku?.toLowerCase().includes(text) ||
        item.category?.toLowerCase().includes(text)
      )

    })

  }, [search, parts])

  const lowStockCount = parts.filter(
    item => item.stock <= item.minStock
  ).length

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.headerRow}>

        <View>

          <Text style={styles.title}>
            Inventory
          </Text>

          <Text style={styles.subtitle}>
            Spare parts & stock management
          </Text>

        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate(
              "AddEditPart",
              {
                mode: "add"
              }
            )
          }
        >

          <MaterialIcons
            name="add"
            size={26}
            color="white"
          />

        </TouchableOpacity>

      </View>

      {/* SUMMARY */}

      <View style={styles.summaryRow}>

        <View style={styles.summaryCard}>

          <Text style={styles.summaryValue}>
            {parts.length}
          </Text>

          <Text style={styles.summaryLabel}>
            Total Parts
          </Text>

        </View>

        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() =>
            navigation.navigate("LowStock")
          }
        >

          <Text
            style={[
              styles.summaryValue,
              { color: "#DC2626" }
            ]}
          >
            {lowStockCount}
          </Text>

          <Text style={styles.summaryLabel}>
            Low Stock
          </Text>

        </TouchableOpacity>

      </View>

      {/* SEARCH */}

      <View style={styles.searchBox}>

        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
        />

        <TextInput
          placeholder="Search spare parts..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* LIST */}

      <FlatList
        data={filteredParts}
        keyExtractor={(item) => item.partId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: 14
        }}
        renderItem={({ item }) => (

          <InventoryCard
            item={item}
            onPress={() =>
              navigation.navigate(
                "PartDetails",
                {
                  part: item
                }
              )
            }
          />

        )}
      />

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
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

  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center"
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },

  summaryLabel: {
    marginTop: 6,
    color: "#6B7280"
  },

  searchBox: {
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10
  }

})
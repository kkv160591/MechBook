import { View, Text, StyleSheet, FlatList } from "react-native"
import StockAlertCard from "../../components/StockAlertCard"

const lowStockItems = [
  {
    id: "1",
    name: "Engine Oil 10W30",
    sku: "EO-1030",
    stock: 2,
    minimum: 5
  },
  {
    id: "2",
    name: "Air Filter",
    sku: "AF-220",
    stock: 1,
    minimum: 4
  },
  {
    id: "3",
    name: "Brake Pads",
    sku: "BP-880",
    stock: 3,
    minimum: 6
  }
]

export default function LowStockScreen() {

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>
          Low Stock Alerts
        </Text>

        <Text style={styles.subtitle}>
          Refill inventory before stock runs out
        </Text>

      </View>

      <FlatList
        data={lowStockItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StockAlertCard item={item} />
        )}
        contentContainerStyle={{
          paddingBottom: 30
        }}
        showsVerticalScrollIndicator={false}
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

  header: {
    marginBottom: 20
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 5
  }

})
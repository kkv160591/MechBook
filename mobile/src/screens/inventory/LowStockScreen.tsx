import { View, Text, StyleSheet, FlatList } from "react-native"
import StockAlertCard from "../../components/StockAlertCard"

import {
  useEffect,
  useState
} from "react"

import {
  getLowStockItems
} from "../../services/inventoryService"

export default function LowStockScreen() {

  const [items, setItems] =
  useState<any[]>([])

  useEffect(() => {

    loadItems()

  }, [])

  const loadItems =
    async () => {

      try {

        const response =
          await getLowStockItems()

        setItems(
          response.inventory || []
        )

      }

      catch (error) {

        console.log(error)

      }

  }
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
        data={items}
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
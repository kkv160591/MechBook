import {
  View,
  Text,
  StyleSheet
} from "react-native"

import {
  MaterialIcons
} from "@expo/vector-icons"

type Props = {
  item: {
    id: string
    name: string
    sku: string
    stock: number
    minimum: number
  }
}

export default function StockAlertCard({
  item
}: Props) {

  const percentage =
    (item.stock / item.minimum) * 100

  return (

    <View style={styles.card}>

      <View style={styles.topRow}>

        <View style={styles.iconBox}>

          <MaterialIcons
            name="warning-amber"
            size={24}
            color="#DC2626"
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.sku}>
            SKU: {item.sku}
          </Text>

        </View>

      </View>

      <View style={styles.stockRow}>

        <View>

          <Text style={styles.label}>
            Current Stock
          </Text>

          <Text style={styles.stock}>
            {item.stock}
          </Text>

        </View>

        <View>

          <Text style={styles.label}>
            Minimum Required
          </Text>

          <Text style={styles.minimum}>
            {item.minimum}
          </Text>

        </View>

      </View>

      {/* Progress */}

      <View style={styles.progressBg}>

        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`
            }
          ]}
        />

      </View>

    </View>

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
    alignItems: "center"
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  sku: {
    color: "#6B7280",
    marginTop: 4
  },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22
  },

  label: {
    color: "#6B7280",
    marginBottom: 5
  },

  stock: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#DC2626"
  },

  minimum: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },

  progressBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 18,
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#DC2626",
    borderRadius: 10
  }

})
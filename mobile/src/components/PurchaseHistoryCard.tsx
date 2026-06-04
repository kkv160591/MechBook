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
    partName: string
    quantity: number
    purchasePrice: number
    supplier: string
    date: string
  }
}

export default function PurchaseHistoryCard({
  item
}: Props) {

  const total =
    item.quantity * item.purchasePrice

  return (

    <View style={styles.card}>

      <View style={styles.topRow}>

        <View style={styles.iconBox}>

          <MaterialIcons
            name="inventory-2"
            size={22}
            color="#2563EB"
          />

        </View>

        <View style={{ flex: 1 }}>

          <Text style={styles.partName}>
            {item.partName}
          </Text>

          <Text style={styles.date}>
            {item.date}
          </Text>

        </View>

        <Text style={styles.total}>
          ₹{total}
        </Text>

      </View>

      <View style={styles.bottomRow}>

        <View style={styles.infoBox}>

          <Text style={styles.label}>
            Quantity
          </Text>

          <Text style={styles.value}>
            {item.quantity}
          </Text>

        </View>

        <View style={styles.infoBox}>

          <Text style={styles.label}>
            Price
          </Text>

          <Text style={styles.value}>
            ₹{item.purchasePrice}
          </Text>

        </View>

        <View style={styles.infoBox}>

          <Text style={styles.label}>
            Supplier
          </Text>

          <Text style={styles.value}>
            {item.supplier}
          </Text>

        </View>

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
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },

  partName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  date: {
    color: "#6B7280",
    marginTop: 4
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16A34A"
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22
  },

  infoBox: {
    flex: 1
  },

  label: {
    color: "#6B7280",
    marginBottom: 5,
    fontSize: 12
  },

  value: {
    fontWeight: "bold",
    color: "#111827"
  }

})
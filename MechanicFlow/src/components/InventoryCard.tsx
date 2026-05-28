// InventoryCard.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native"

import { MaterialIcons } from "@expo/vector-icons"

type Props = {
  item: any
  onPress: () => void
}

export default function InventoryCard({
  item,
  onPress
}: Props) {

  const lowStock =
    item.stock <= item.minStock

  return (

    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >

      <View style={styles.left}>

        <View style={styles.iconBox}>

          <MaterialIcons
            name="inventory"
            size={20}
            color="#2563EB"
          />

        </View>

        <View>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.sku}>
            SKU: {item.sku}
          </Text>

          <Text style={styles.price}>
            ₹{item.sellingPrice}
          </Text>

        </View>

      </View>

      <View
        style={[
          styles.stockBadge,
          {
            backgroundColor: lowStock
              ? "#FEE2E2"
              : "#DCFCE7"
          }
        ]}
      >

        <Text
          style={[
            styles.stockText,
            {
              color: lowStock
                ? "#DC2626"
                : "#16A34A"
            }
          ]}
        >
          {item.stock}
        </Text>

      </View>

    </TouchableOpacity>

  )

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827"
  },

  sku: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 13
  },

  price: {
    marginTop: 10,
    color: "#16A34A",
    fontWeight: "bold"
  },

  stockBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },

  stockText: {
    fontWeight: "bold"
  }

})
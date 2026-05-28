// PartDetailsScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native"

import {
  RouteProp,
  useNavigation
} from "@react-navigation/native"

import { MaterialIcons } from "@expo/vector-icons"

type Props = {
  route: RouteProp<any, any>
}

export default function PartDetailsScreen({
  route
}: Props) {

  const navigation: any = useNavigation()

  const { part } = route.params

  const lowStock =
    part.stock <= part.minStock

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.headerCard}>

        <View style={styles.iconBox}>

          <MaterialIcons
            name="inventory"
            size={34}
            color="#2563EB"
          />

        </View>

        <Text style={styles.name}>
          {part.name}
        </Text>

        <Text style={styles.sku}>
          {part.sku}
        </Text>

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
            {part.stock} in stock
          </Text>

        </View>

      </View>

      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Part Details
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>
            Category
          </Text>

          <Text style={styles.value}>
            {part.category}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Buying Price
          </Text>

          <Text style={styles.value}>
            ₹{part.buyingPrice}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Selling Price
          </Text>

          <Text style={styles.value}>
            ₹{part.sellingPrice}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>
            Minimum Stock
          </Text>

          <Text style={styles.value}>
            {part.minStock}
          </Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() =>
          navigation.navigate(
            "AddEditPart",
            {
              mode: "edit",
              part
            }
          )
        }
      >

        <MaterialIcons
          name="edit"
          size={20}
          color="white"
        />

        <Text style={styles.editText}>
          Edit Part
        </Text>

      </TouchableOpacity>

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 18
  },

  headerCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center"
  },

  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 18,
    color: "#111827"
  },

  sku: {
    color: "#6B7280",
    marginTop: 6
  },

  stockBadge: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30
  },

  stockText: {
    fontWeight: "bold"
  },

  section: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginTop: 18
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18
  },

  label: {
    color: "#6B7280"
  },

  value: {
    fontWeight: "bold",
    color: "#111827"
  },

  editBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },

  editText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16
  }

})
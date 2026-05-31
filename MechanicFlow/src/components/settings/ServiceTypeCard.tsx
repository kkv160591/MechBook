import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import { Ionicons } from "@expo/vector-icons"

export default function ServiceTypeCard({
  service,
  onPress
}: any) {

  return (

    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >

      <View style={{ flex: 1 }}>

        <Text style={styles.name}>
          {service.name}
        </Text>

        <Text style={styles.category}>
          {service.category}
        </Text>

      </View>

      <View>

        <Text style={styles.price}>
          ₹{service.defaultPrice}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9CA3AF"
        />

      </View>

    </TouchableOpacity>

  )

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  name: {
    fontWeight: "700",
    fontSize: 16
  },

  category: {
    color: "#6B7280",
    marginTop: 4
  },

  price: {
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 6
  }

})
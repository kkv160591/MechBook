import {
  View,
  Text,
  StyleSheet
} from "react-native"

export default function LoginHistoryCard({
  item
}: any) {

  return (
    <View style={styles.card}>
      <Text style={styles.date}>
        {item.date}
      </Text>

      <Text style={styles.time}>
        {item.time}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12
  },

  date: {
    fontWeight: "700"
  },

  time: {
    color: "#6B7280",
    marginTop: 4
  }

})
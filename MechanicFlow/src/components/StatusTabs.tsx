import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native"

const tabs = [
  "all",
  "pending",
  "in-progress",
  "completed"
]

export default function StatusTabs({
  selected,
  onChange
}: any) {

  return (

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >

      {tabs.map(tab => {

        const active = selected === tab

        return (

          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              active && styles.activeTab
            ]}
            onPress={() => onChange(tab)}
          >

            <Text
              style={[
                styles.tabText,
                active && styles.activeText
              ]}
            >
              {tab}
            </Text>

          </TouchableOpacity>

        )

      })}

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    paddingBottom: 14,
    paddingRight: 10
  },

  tab: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  activeTab: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB"
  },

  tabText: {
    color: "#374151",
    fontWeight: "600",
    textTransform: "capitalize"
  },

  activeText: {
    color: "#FFFFFF"
  }

})
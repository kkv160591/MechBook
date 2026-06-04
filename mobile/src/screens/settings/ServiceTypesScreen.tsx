import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native"

import { Ionicons } from "@expo/vector-icons"

import ServiceTypeCard
from "../../components/settings/ServiceTypeCard"

import { dummyServiceTypes } from "../../data/settings/dummyServiceTypes"

export default function ServiceTypesScreen({
  navigation
}: any) {

  return (

    <View style={styles.container}>

      <FlatList
        data={dummyServiceTypes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <ServiceTypeCard
            service={item}
            onPress={() =>
              navigation.navigate(
                "EditServiceType",
                { service: item }
              )
            }
          />

        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            "AddServiceType"
          )
        }
      >

        <Ionicons
          name="add"
          size={28}
          color="white"
        />

      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center"
  }

})
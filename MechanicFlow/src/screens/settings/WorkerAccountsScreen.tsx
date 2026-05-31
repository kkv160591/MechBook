import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native"

import { useState } from "react"

import { Ionicons } from "@expo/vector-icons"

import WorkerCard from "../../components/settings/WorkerCard"

import { dummyWorkers } from "../../data/dummyWorkers"

export default function WorkerAccountsScreen({
  navigation
}: any) {

  const [workers] =
    useState(dummyWorkers)

  return (

    <View style={styles.container}>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            onPress={() =>
              navigation.navigate(
                "WorkerDetails",
                { worker: item }
              )
            }
          />
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate(
            "WorkerDetails"
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
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native"

import { useState } from "react"

import { Ionicons } from "@expo/vector-icons"

import { supportedLanguages }
from "../../data/supportedLanguages"

export default function LanguageScreen() {

  const [selectedLanguage,
    setSelectedLanguage] =
    useState("en")

  const saveLanguage = (
    code: string
  ) => {

    setSelectedLanguage(code)

    Alert.alert(
      "Language Updated",
      "Language preference saved."
    )

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Choose Language
      </Text>

      <Text style={styles.subtitle}>
        Select your preferred app language
      </Text>

      <FlatList
        data={supportedLanguages}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              saveLanguage(item.code)
            }
          >

            <View>

              <Text style={styles.languageName}>
                {item.name}
              </Text>

              <Text style={styles.code}>
                {item.code.toUpperCase()}
              </Text>

            </View>

            {selectedLanguage === item.code && (

              <Ionicons
                name="checkmark-circle"
                size={28}
                color="#16A34A"
              />

            )}

          </TouchableOpacity>

        )}
      />

    </View>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 20
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  languageName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827"
  },

  code: {
    color: "#6B7280",
    marginTop: 4
  }

})
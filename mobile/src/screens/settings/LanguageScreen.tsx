import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native"

import { useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { supportedLanguages } from "../../data/supportedLanguages"

import { Feather, Ionicons } from "@expo/vector-icons"

import {
  getLanguageSettings,
  updateLanguageSettings
} from "../../services/settingsService"

export default function LanguageScreen() {
  const navigation = useNavigation()
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  useEffect(() => {
    loadLanguage()
  }, [])

  const loadLanguage = async () => {
    try {
      const data = await getLanguageSettings()
      if (data?.language) {
        setSelectedLanguage(data.language)
      }
    } catch {}
  }

  const saveLanguage = async (code: string) => {
    try {
      await updateLanguageSettings({
        language: code
      })

      setSelectedLanguage(code)

      Alert.alert("Success", "Language updated")
    } catch {
      Alert.alert("Error", "Failed to update language")
    }
  }

  // Header Bar rendered inside FlatList to scroll smoothly with content
  const renderHeader = () => (
    <View style={styles.headerBar}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={24} color="#111827" />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        <Text style={styles.heading}>Choose Language</Text>
        <Text style={styles.subHeading}>
          Select your preferred app language
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={supportedLanguages}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => saveLanguage(item.code)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.languageName}>{item.name}</Text>
              <Text style={styles.code}>{item.code.toUpperCase()}</Text>
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
    paddingHorizontal: 16
  },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  headerTextContainer: {
    flex: 1
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827"
  },

  subHeading: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2
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
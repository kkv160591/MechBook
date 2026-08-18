import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native"
import { useTranslation, LanguageKey } from "../context/LanguageContext"

const AVAILABLE_LANGUAGES: { key: LanguageKey; label: string }[] = [
  { key: "en", label: "English" },
  { key: "hi", label: "हिंदी" },
  // Add future languages here:
  // { key: "mr", label: "मराठी" },
]

export default function LanguageSelector() {
  const { language, changeLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = AVAILABLE_LANGUAGES.find((item) => item.key === language) || AVAILABLE_LANGUAGES[0]

  const handleSelect = (key: LanguageKey) => {
    changeLanguage(key)
    setIsOpen(false)
  }

  return (
    <View style={styles.wrapper}>
      {/* Selector Trigger Button */}
      <TouchableOpacity
        style={[styles.button, isOpen && styles.activeButton]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>{currentLang.label}</Text>
        <Text style={[styles.arrow, isOpen && styles.arrowRotated]}>▼</Text>
      </TouchableOpacity>

      {/* Inline Dropdown Options List */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown on outside tap */}
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.dropdown}>
            {AVAILABLE_LANGUAGES.map((item, index) => {
              const isSelected = item.key === language
              const isLast = index === AVAILABLE_LANGUAGES.length - 1

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                    !isLast && styles.optionBorder
                  ]}
                  onPress={() => handleSelect(item.key)}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>
                    {item.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )
            })}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 1000,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  activeButton: {
    borderColor: "#2563EB",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 6,
  },
  arrow: {
    fontSize: 8,
    color: "#6B7280",
  },
  arrowRotated: {
    transform: [{ rotate: "180deg" }],
    color: "#2563EB",
  },
  backdrop: {
    position: "absolute",
    top: -500,
    bottom: -500,
    left: -500,
    right: -500,
    zIndex: 999,
  },
  dropdown: {
    position: "absolute",
    top: 42,
    right: 0,
    width: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1000,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedOption: {
    backgroundColor: "#EFF6FF",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  selectedOptionLabel: {
    fontWeight: "700",
    color: "#2563EB",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
})
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import { useNavigation } from "@react-navigation/native"
import { createCustomer } from "../../services/customerService"
import { useTranslation } from "../../context/LanguageContext"

export default function AddCustomerScreen() {
  const navigation: any = useNavigation()
  const { t } = useTranslation()

  const scrollViewRef = useRef<ScrollView>(null)
  const fieldYPositions = useRef<{ [key: string]: number }>({})

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const recordLayout = (field: string, y: number) => {
    fieldYPositions.current[field] = y
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    const phoneRegex = /^[0-9]{10}$/

    if (!name.trim()) {
      newErrors.name = t("customers.validation.nameReq")
    }

    if (!phone.trim()) {
      newErrors.phone = t("customers.validation.phoneReq")
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = t("customers.validation.phoneValid")
    }

    if (alternatePhone.trim() && !phoneRegex.test(alternatePhone.trim())) {
      newErrors.alternatePhone = t("customers.validation.altPhoneValid")
    }

    setErrors(newErrors)

    const firstErrorKey = Object.keys(newErrors)[0]
    if (firstErrorKey && fieldYPositions.current[firstErrorKey] !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: fieldYPositions.current[firstErrorKey] - 20,
        animated: true,
      })
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        address: address.trim(),
        notes: notes.trim()
      })

      Alert.alert(
        t("common.successTitle"),
        t("customers.messages.createSuccess")
      )
      navigation.goBack()
    } catch (error: any) {
      Alert.alert(
        t("common.errorTitle"),
        error?.response?.data?.message || t("customers.messages.createError")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("customers.addTitle")}</Text>
          <Text style={styles.subtitle}>{t("customers.addSubtitle")}</Text>
        </View>

        <View style={styles.iconBox}>
          <Ionicons name="person-add" size={28} color="#2563EB" />
        </View>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("customers.detailsTitle")}</Text>

        {/* Name */}
        <View onLayout={(e) => recordLayout("name", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("customers.labels.name")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={(val) => {
              setName(val)
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Phone */}
        <View onLayout={(e) => recordLayout("phone", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>
            {t("customers.labels.phone")} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            keyboardType="phone-pad"
            maxLength={10}
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            onChangeText={(val) => {
              setPhone(val)
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }))
            }}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Alternate Phone */}
        <View onLayout={(e) => recordLayout("alternatePhone", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>{t("customers.labels.altPhone")}</Text>
          <TextInput
            keyboardType="phone-pad"
            maxLength={10}
            style={[styles.input, errors.alternatePhone && styles.inputError]}
            value={alternatePhone}
            onChangeText={(val) => {
              setAlternatePhone(val)
              if (errors.alternatePhone) setErrors((prev) => ({ ...prev, alternatePhone: "" }))
            }}
          />
          {errors.alternatePhone && <Text style={styles.errorText}>{errors.alternatePhone}</Text>}
        </View>

        {/* Address */}
        <View onLayout={(e) => recordLayout("address", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>{t("customers.labels.address")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Notes */}
        <View onLayout={(e) => recordLayout("notes", e.nativeEvent.layout.y)}>
          <Text style={styles.label}>{t("customers.labels.notes")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>

      {/* SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? t("common.saving") || "Saving..." : t("customers.addTitle")}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827"
  },
  subtitle: {
    marginTop: 5,
    color: "#6B7280"
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827"
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#DC2626",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
    color: "#111827"
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top"
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
})
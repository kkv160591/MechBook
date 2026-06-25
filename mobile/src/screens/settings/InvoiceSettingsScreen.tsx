import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native"

import { 
  useState,
  useEffect
} from "react"

import {
  getInvoiceSettings,
  updateInvoiceSettings
}
from "../../services/settingsService"

export default function InvoiceSettingsScreen() {

  const [settings, setSettings] =
    useState<any>({})

    const [loading, setLoading] =
    useState(true)

    useEffect(() => {

    loadSettings()

  }, [])

  const loadSettings =
  async () => {

    try {

      const data =
        await getInvoiceSettings()

      setSettings(data || {})

    }

    finally {

      setLoading(false)

    }

  }

  const toggle = (key: string) => {

    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))

  }

  const saveSettings =
  async () => {

    try {

      await updateInvoiceSettings(
        settings
      )

      Alert.alert(
        "Success",
        "Invoice settings saved"
      )

    }

    catch {

      Alert.alert(
        "Error",
        "Failed to save"
      )

    }

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.sectionTitle}>
        PDF Fields
      </Text>

      <View style={styles.card}>

        <SettingRow
          title="Garage Logo"
          value={settings.showGarageLogo}
          onChange={() =>
            toggle("showGarageLogo")
          }
        />

        <SettingRow
          title="GST Number"
          value={settings.showGSTNumber}
          onChange={() =>
            toggle("showGSTNumber")
          }
        />

        <SettingRow
          title="Garage Address"
          value={settings.showGarageAddress}
          onChange={() =>
            toggle("showGarageAddress")
          }
        />

        <SettingRow
          title="Customer Address"
          value={settings.showCustomerAddress}
          onChange={() =>
            toggle("showCustomerAddress")
          }
        />

        <SettingRow
          title="Vehicle Details"
          value={settings.showVehicleDetails}
          onChange={() =>
            toggle("showVehicleDetails")
          }
        />

        <SettingRow
          title="Payment Details"
          value={settings.showPaymentDetails}
          onChange={() =>
            toggle("showPaymentDetails")
          }
        />

      </View>

      <Text style={styles.sectionTitle}>
        Footer Note
      </Text>

      <View style={styles.card}>

        <TextInput
          multiline
          value={settings.footerNote}
          onChangeText={(text) =>
            setSettings(prev => ({
              ...prev,
              footerNote: text
            }))
          }
          style={styles.textArea}
        />

      </View>

      <Text style={styles.sectionTitle}>
        Terms & Conditions
      </Text>

      <View style={styles.card}>

        <TextInput
          multiline
          value={settings.terms}
          onChangeText={(text) =>
            setSettings(prev => ({
              ...prev,
              terms: text
            }))
          }
          style={styles.textArea}
        />

      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveSettings}
      >

        <Text style={styles.saveText}>
          Save Invoice Settings
        </Text>

      </TouchableOpacity>

      <View style={{ height: 50 }} />

    </ScrollView>

  )

}

function SettingRow({
  title,
  value,
  onChange
}: any) {

  return (

    <View style={styles.row}>

      <Text style={styles.rowTitle}>
        {title}
      </Text>

      <Switch
        value={value}
        onValueChange={onChange}
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 10
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10
  },

  rowTitle: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600"
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    alignItems: "center"
  },

  saveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }

})
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView
} from "react-native"

import { useState } from "react"

import { dummyGSTConfig }
from "../../data/dummyGSTConfig"

export default function GSTConfigScreen() {

  const [enabled, setEnabled] =
    useState(dummyGSTConfig.enabled)

  const [gstNumber, setGstNumber] =
    useState(dummyGSTConfig.gstNumber)

  const [defaultRate, setDefaultRate] =
    useState(dummyGSTConfig.defaultRate)

  const [applyMode, setApplyMode] =
    useState(dummyGSTConfig.applyMode)

  const saveSettings = () => {

    Alert.alert(
      "Success",
      "GST configuration saved"
    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.card}>

        <View style={styles.row}>

          <View>

            <Text style={styles.label}>
              Enable GST
            </Text>

            <Text style={styles.subLabel}>
              Apply GST on invoices
            </Text>

          </View>

          <Switch
            value={enabled}
            onValueChange={setEnabled}
          />

        </View>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          GST Number
        </Text>

        <TextInput
          value={gstNumber}
          onChangeText={setGstNumber}
          placeholder="Enter GST Number"
          style={styles.input}
        />

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Default GST Rate
        </Text>

        <View style={styles.rateContainer}>

          {[5, 12, 18, 28].map(rate => (

            <TouchableOpacity
              key={rate}
              style={[
                styles.rateBtn,
                defaultRate === rate &&
                styles.selectedRate
              ]}
              onPress={() =>
                setDefaultRate(rate)
              }
            >

              <Text
                style={[
                  styles.rateText,
                  defaultRate === rate &&
                  styles.selectedRateText
                ]}
              >
                {rate}%
              </Text>

            </TouchableOpacity>

          ))}

        </View>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          GST Apply Mode
        </Text>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            applyMode === "invoice" &&
            styles.selectedMode
          ]}
          onPress={() =>
            setApplyMode("invoice")
          }
        >

          <Text style={styles.modeTitle}>
            Invoice Level
          </Text>

          <Text style={styles.modeDesc}>
            GST applied on total invoice amount
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeBtn,
            applyMode === "line-item" &&
            styles.selectedMode
          ]}
          onPress={() =>
            setApplyMode("line-item")
          }
        >

          <Text style={styles.modeTitle}>
            Line Item Level
          </Text>

          <Text style={styles.modeDesc}>
            GST applied individually to parts/services
          </Text>

        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveSettings}
      >

        <Text style={styles.saveText}>
          Save GST Settings
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
    padding: 16
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  subLabel: {
    color: "#6B7280",
    marginTop: 4
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginTop: 12
  },

  rateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },

  rateBtn: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center"
  },

  selectedRate: {
    backgroundColor: "#2563EB"
  },

  rateText: {
    fontWeight: "700"
  },

  selectedRateText: {
    color: "white"
  },

  modeBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginTop: 12
  },

  selectedMode: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF"
  },

  modeTitle: {
    fontWeight: "700",
    color: "#111827"
  },

  modeDesc: {
    color: "#6B7280",
    marginTop: 4
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
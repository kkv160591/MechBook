import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native"

import { useState } from "react"

import {
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons"

import { dummyBackup }
from "../../data/dummyBackup"

export default function BackupScreen() {

  const [backupInfo, setBackupInfo] =
    useState(dummyBackup)

  const runBackup = () => {

    const now =
      new Date().toLocaleString()

    setBackupInfo(prev => ({
      ...prev,
      lastBackup: now
    }))

    Alert.alert(
      "Backup Completed",
      "All garage data backed up successfully."
    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* STATUS */}

      <View style={styles.card}>

        <View style={styles.headerRow}>

          <Ionicons
            name="cloud-done"
            size={26}
            color="#2563EB"
          />

          <Text style={styles.title}>
            Backup Status
          </Text>

        </View>

        <Text style={styles.label}>
          Last Backup
        </Text>

        <Text style={styles.value}>
          {backupInfo.lastBackup}
        </Text>

      </View>

      {/* PLAN */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Current Plan
        </Text>

        <Text style={styles.plan}>
          {backupInfo.plan}
        </Text>

        <Text style={styles.description}>

          {backupInfo.plan === "FREE"
            ? "Manual backups only."
            : "Daily automatic backups enabled."}

        </Text>

      </View>

      {/* AUTO BACKUP */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Auto Backup
        </Text>

        <Text
          style={[
            styles.value,
            {
              color:
                backupInfo.autoBackupEnabled
                  ? "#16A34A"
                  : "#DC2626"
            }
          ]}
        >

          {backupInfo.autoBackupEnabled
            ? "Enabled"
            : "Disabled"}

        </Text>

        {backupInfo.autoBackupEnabled && (

          <>
            <Text
              style={[
                styles.label,
                { marginTop: 14 }
              ]}
            >
              Next Backup
            </Text>

            <Text style={styles.value}>
              {backupInfo.nextBackup}
            </Text>
          </>

        )}

      </View>

      {/* MANUAL BACKUP */}

      <TouchableOpacity
        style={styles.backupBtn}
        onPress={runBackup}
      >

        <MaterialIcons
          name="backup"
          size={22}
          color="white"
        />

        <Text style={styles.backupText}>
          Backup Now
        </Text>

      </TouchableOpacity>

      {/* FUTURE CLOUD INFO */}

      <View style={styles.infoCard}>

        <Ionicons
          name="information-circle"
          size={22}
          color="#2563EB"
        />

        <Text style={styles.infoText}>
          In future versions, backups will
          sync automatically to AWS cloud.
        </Text>

      </View>

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
    borderRadius: 18,
    padding: 18,
    marginBottom: 14
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10
  },

  label: {
    color: "#6B7280",
    marginBottom: 4
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },

  plan: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB"
  },

  description: {
    marginTop: 8,
    color: "#6B7280"
  },

  backupBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  backupText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 10
  },

  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    marginTop: 16
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#1E40AF"
  }

})
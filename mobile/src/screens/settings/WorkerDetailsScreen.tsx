import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  getWorkerById,
  resetWorkerPin,
  updateWorkerStatus
} from "../../services/workerService"
import { useTranslation } from "../../context/LanguageContext"

export default function WorkerDetailsScreen({ route, navigation }: any) {
  const { t } = useTranslation()
  const [worker, setWorker] = useState<any>(null)

  // PIN Modal State
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [pinError, setPinError] = useState("")

  useEffect(() => {
    loadWorker()
  }, [])

  const loadWorker = async () => {
    try {
      const response = await getWorkerById(route.params.workerId)
      setWorker(response.worker)
    } catch (error) {
      console.log(error)
    }
  }

  const handleResetPin = async () => {
    setPinError("")
    if (!newPin || newPin.length !== 4) {
      setPinError(t("workers.validation.pinReq") || "PIN must be 4 digits")
      return
    }
    if (newPin !== confirmNewPin) {
      setPinError(t("workers.validation.pinMatch") || "PINs do not match")
      return
    }

    try {
      await resetWorkerPin(worker.workerId, newPin)
      setPinModalVisible(false)
      setNewPin("")
      setConfirmNewPin("")
      Alert.alert(
        t("common.successTitle") || "Success",
        t("workers.pinUpdated") || "PIN Updated Successfully"
      )
    } catch (error: any) {
      setPinError(error?.response?.data?.message || "Failed to update PIN")
    }
  }

  if (!worker) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t("common.loading") || "Loading..."}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color="#2563EB" />
          </View>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.role}>{worker.role}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: worker.active ? "#DCFCE7" : "#FEE2E2" }
            ]}
          >
            <Text
              style={{
                color: worker.active ? "#16A34A" : "#DC2626",
                fontWeight: "700"
              }}
            >
              {worker.active
                ? t("workers.active") || "ACTIVE"
                : t("workers.inactive") || "INACTIVE"}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            {t("workers.contactInfo") || "Contact Information"}
          </Text>
          <Text style={styles.label}>{t("workers.placeholders.phone") || "Phone"}</Text>
          <Text style={styles.value}>{worker.phone}</Text>
        </View>

        {/* Login History */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>
            {t("workers.loginActivity") || "Recent Login Activity"}
          </Text>

          {(worker.loginHistory || []).slice(0, 3).map((item: any, index: number) => (
            <View key={index} style={styles.historyRow}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.historyText}>
                {item.date} • {item.time}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => navigation.navigate("LoginHistory", { worker })}
          >
            <Text style={styles.viewAll}>
              {t("workers.viewHistory") || "View Full History"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("EditWorker", { worker })}
        >
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.btnText}>
            {t("workers.editWorker") || "Edit Worker"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orangeBtn}
          activeOpacity={0.8}
          onPress={() => setPinModalVisible(true)}
        >
          <MaterialIcons name="lock-reset" size={20} color="white" />
          <Text style={styles.btnText}>
            {t("workers.changePin") || "Change PIN"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.redBtn}
          activeOpacity={0.8}
          onPress={async () => {
            try {
              await updateWorkerStatus(worker.workerId, !worker.active)
              await loadWorker()
            } catch {
              Alert.alert(
                t("common.errorTitle") || "Error",
                t("workers.statusError") || "Failed to update worker status"
              )
            }
          }}
        >
          <MaterialIcons name="block" size={20} color="white" />
          <Text style={styles.btnText}>
            {worker.active
              ? t("workers.deactivate") || "Deactivate Worker"
              : t("workers.activate") || "Activate Worker"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Cross-Platform PIN Reset Modal */}
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("workers.changePin") || "Change PIN"}
            </Text>

            <TextInput
              placeholder={t("workers.placeholders.pin") || "Enter 4 digit PIN"}
              style={styles.modalInput}
              value={newPin}
              onChangeText={(val) => setNewPin(val.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />

            <TextInput
              placeholder={t("workers.placeholders.confirmPin") || "Confirm 4 digit PIN"}
              style={styles.modalInput}
              value={confirmNewPin}
              onChangeText={(val) => setConfirmNewPin(val.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />

            {!!pinError && <Text style={styles.modalError}>{pinError}</Text>}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setPinModalVisible(false)
                  setPinError("")
                  setNewPin("")
                  setConfirmNewPin("")
                }}
              >
                <Text style={styles.modalCancelText}>
                  {t("common.cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleResetPin}
              >
                <Text style={styles.modalSubmitText}>
                  {t("common.save") || "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center"
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center"
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14
  },
  role: {
    color: "#6B7280",
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  label: {
    color: "#6B7280"
  },
  value: {
    fontWeight: "600",
    marginTop: 4
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  historyText: {
    marginLeft: 8,
    color: "#374151"
  },
  viewAll: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 10
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    marginTop: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  orangeBtn: {
    backgroundColor: "#F59E0B",
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  redBtn: {
    backgroundColor: "#DC2626",
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  btnText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827"
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 15
  },
  modalError: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 10,
    fontWeight: "500"
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8
  },
  modalCancelText: {
    color: "#6B7280",
    fontWeight: "600"
  },
  modalSubmitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  modalSubmitText: {
    color: "white",
    fontWeight: "700"
  }
})
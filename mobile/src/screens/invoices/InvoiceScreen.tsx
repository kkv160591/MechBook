// InvoiceScreen.tsx

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Linking
} from "react-native"

import {
  RouteProp,
  useNavigation
} from "@react-navigation/native"

import {
  MaterialIcons,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

import { LinearGradient } from "expo-linear-gradient"

import { RootStackParamList } from "../../types/navigation"
import { generateInvoice } from "../../utils/generateInvoice"

type Props = {
  route: RouteProp<RootStackParamList, "Invoice">
}

export default function InvoiceScreen({
  route
}: Props) {

  const navigation = useNavigation()

  const { job } = route.params

  // LABOUR ITEMS
  const labourItems =
    job.labourItems ||
    job.services ||
    []

  // PARTS ITEMS
  const partItems =
    job.partItems || []

  // GST
  const gstPercent =
    job.gstPercent || 18

  // PAYMENT
  const paymentMode =
    job.paymentMode || "Pending"

  const paidAmount =
    Number(job.paidAmount || 0)

  // LABOUR TOTAL
  const labourTotal =
    labourItems.reduce(
      (sum: number, item: any) =>
        sum +
        (
          item.amount ??
          item.actualPrice ??
          item.estimatedPrice ??
          0
        ),
      0
    )

  // PARTS TOTAL
  const partsTotal =
    partItems.reduce(
      (sum: number, item: any) =>
        sum +
        (
          item.total ??
          (
            item.price * item.qty
          )
        ),
      0
    )

  // SUBTOTAL
  const subtotal =
    labourTotal + partsTotal

  // GST
  const gst =
    Math.round(
      subtotal *
      (gstPercent / 100)
    )

  // GRAND TOTAL
  const total =
    subtotal + gst

  // BALANCE
  const balance =
    total - paidAmount

  // PAYMENT STATUS
  const paymentStatus =
    balance <= 0
      ? "PAID"
      : paidAmount > 0
      ? "PARTIAL"
      : "PENDING"

  // STATUS COLORS
  const getStatusColor = () => {

    if (paymentStatus === "PAID") {

      return {
        bg: "#DCFCE7",
        text: "#16A34A"
      }

    }

    if (paymentStatus === "PARTIAL") {

      return {
        bg: "#FEF3C7",
        text: "#D97706"
      }

    }

    return {
      bg: "#FEE2E2",
      text: "#DC2626"
    }

  }

  const statusColors =
    getStatusColor()

  // INVOICE NUMBER
  const invoiceNumber =
    `INV-${job.id?.slice(-5) || "1001"}`

  // WHATSAPP SHARE
  const shareOnWhatsapp = () => {

    const message = `
Invoice: ${invoiceNumber}

Customer:
${job.customerName || job.customer}

Vehicle:
${job.vehicleNumber}

Total:
₹${total}

Paid:
₹${paidAmount}

Balance:
₹${balance}

Thank you for choosing MechanicFlow Garage.
`

    Linking.openURL(
      `whatsapp://send?text=${encodeURIComponent(message)}`
    )

  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        style={styles.headerCard}
      >

        <View style={styles.topRow}>

          <View style={styles.logoBox}>

            <FontAwesome5
              name="tools"
              size={24}
              color="#2563EB"
            />

          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={shareOnWhatsapp}
          >

            <Ionicons
              name="logo-whatsapp"
              size={22}
              color="white"
            />

          </TouchableOpacity>

        </View>

        <Text style={styles.garageName}>
          MechanicFlow Garage
        </Text>

        <Text style={styles.gstText}>
          GST No: 27ABCDE1234F1Z5
        </Text>

        <View style={styles.invoiceInfoRow}>

          <View>

            <Text style={styles.invoiceLabel}>
              Invoice Number
            </Text>

            <Text style={styles.invoiceValue}>
              {invoiceNumber}
            </Text>

          </View>

          <View style={{ alignItems: "flex-end" }}>

            <Text style={styles.invoiceLabel}>
              Payment Status
            </Text>

            <View
              style={[
                styles.paidBadge,
                {
                  backgroundColor:
                    statusColors.bg
                }
              ]}
            >

              <Text
                style={[
                  styles.paidText,
                  {
                    color:
                      statusColors.text
                  }
                ]}
              >
                {paymentStatus}
              </Text>

            </View>

          </View>

        </View>

      </LinearGradient>

      {/* CUSTOMER */}

      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <View style={styles.iconCircle}>

            <Ionicons
              name="person-outline"
              size={18}
              color="#2563EB"
            />

          </View>

          <Text style={styles.cardTitle}>
            Customer Details
          </Text>

        </View>

        <Text style={styles.customerName}>
          {job.customerName || job.customer}
        </Text>

        <Text style={styles.cardText}>
          {job.phone}
        </Text>

        {job.address && (

          <Text style={styles.cardText}>
            {job.address}
          </Text>

        )}

      </View>

      {/* VEHICLE */}

      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <View style={styles.iconCircle}>

            <Ionicons
              name="car-sport-outline"
              size={18}
              color="#2563EB"
            />

          </View>

          <Text style={styles.cardTitle}>
            Vehicle Details
          </Text>

        </View>

        <View style={styles.vehicleTop}>

          <View>

            <Text style={styles.vehicleNumber}>
              {job.vehicleNumber}
            </Text>

            <Text style={styles.cardText}>
              {job.vehicleBrand}{" "}
              {job.vehicleModel}
            </Text>

          </View>

          <View style={styles.vehicleTypeBadge}>

            <Text style={styles.vehicleTypeText}>
              {job.vehicleType}
            </Text>

          </View>

        </View>

      </View>

      {/* LABOUR */}

      <View style={styles.card}>

        <View style={styles.servicesTop}>

          <Text style={styles.cardTitle}>
            Labour Charges
          </Text>

        </View>

        <FlatList
          scrollEnabled={false}
          data={labourItems}
          keyExtractor={(item: any, index) =>
            index.toString()
          }
          renderItem={({ item }: any) => (

            <View style={styles.serviceRow}>

              <View style={styles.serviceLeft}>

                <View style={styles.serviceIcon}>

                  <MaterialIcons
                    name="engineering"
                    size={16}
                    color="#2563EB"
                  />

                </View>

                <Text style={styles.serviceName}>
                  {
                    item.description ||
                    item.name
                  }
                </Text>

              </View>

              <Text style={styles.servicePrice}>
                ₹
                {
                  item.amount ??
                  item.actualPrice ??
                  item.estimatedPrice
                }
              </Text>

            </View>

          )}
        />

      </View>

      {/* PARTS */}

      {partItems.length > 0 && (

        <View style={styles.card}>

          <View style={styles.servicesTop}>

            <Text style={styles.cardTitle}>
              Spare Parts Used
            </Text>

          </View>

          <FlatList
            scrollEnabled={false}
            data={partItems}
            keyExtractor={(item: any, index) =>
              index.toString()
            }
            renderItem={({ item }: any) => (

              <View style={styles.partRow}>

                <View style={{ flex: 1 }}>

                  <Text style={styles.serviceName}>
                    {item.name}
                  </Text>

                  <Text style={styles.partMeta}>
                    Qty: {item.qty} × ₹{item.price}
                  </Text>

                </View>

                <Text style={styles.servicePrice}>
                  ₹
                  {
                    item.total ??
                    (
                      item.price *
                      item.qty
                    )
                  }
                </Text>

              </View>

            )}
          />

        </View>

      )}

      {/* SUMMARY */}

      <LinearGradient
        colors={["#111827", "#1F2937"]}
        style={styles.summaryCard}
      >

        <Text style={styles.summaryTitle}>
          Payment Summary
        </Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Labour Charges
          </Text>

          <Text style={styles.summaryValue}>
            ₹{labourTotal}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Spare Parts
          </Text>

          <Text style={styles.summaryValue}>
            ₹{partsTotal}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            GST ({gstPercent}%)
          </Text>

          <Text style={styles.summaryValue}>
            ₹{gst}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>
            Grand Total
          </Text>

          <Text style={styles.totalAmount}>
            ₹{total}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Paid Amount
          </Text>

          <Text style={styles.paidAmount}>
            ₹{paidAmount}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Balance Due
          </Text>

          <Text style={styles.balanceAmount}>
            ₹{balance}
          </Text>
        </View>

        <View style={styles.paymentModeCard}>

          <Text style={styles.paymentModeLabel}>
            Payment Mode
          </Text>

          <Text style={styles.paymentModeValue}>
            {paymentMode}
          </Text>

        </View>

      </LinearGradient>

      {/* NOTE */}

      <View style={styles.noteCard}>

        <Ionicons
          name="information-circle-outline"
          size={22}
          color="#92400E"
        />

        <View style={{ flex: 1, marginLeft: 10 }}>

          <Text style={styles.noteTitle}>
            Thank You
          </Text>

          <Text style={styles.noteText}>
            Thank you for choosing
            MechanicFlow Garage.
            We appreciate your trust and
            support.
          </Text>

        </View>

      </View>

      {/* BUTTONS */}

      <TouchableOpacity
        style={styles.downloadBtn}
        onPress={() => generateInvoice(job)}
      >

        <MaterialIcons
          name="picture-as-pdf"
          size={22}
          color="white"
        />

        <Text style={styles.downloadText}>
          Download PDF Invoice
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.whatsappBtn}
        onPress={shareOnWhatsapp}
      >

        <Ionicons
          name="logo-whatsapp"
          size={22}
          color="white"
        />

        <Text style={styles.downloadText}>
          Share on WhatsApp
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.goBack()}
      >

        <Text style={styles.secondaryText}>
          Back to Jobs
        </Text>

      </TouchableOpacity>

      <View style={{ height: 40 }} />

    </ScrollView>

  )

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6"
  },

  headerCard: {
    paddingTop: 65,
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },

  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center"
  },

  garageName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 24
  },

  gstText: {
    color: "#DBEAFE",
    marginTop: 6
  },

  invoiceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28
  },

  invoiceLabel: {
    color: "#BFDBFE",
    fontSize: 13
  },

  invoiceValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5
  },

  paidBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
    marginTop: 6
  },

  paidText: {
    fontWeight: "bold",
    fontSize: 12
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 18,
    borderRadius: 22,
    padding: 20,
    marginTop: 18
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827"
  },

  customerName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827"
  },

  cardText: {
    color: "#6B7280",
    marginTop: 6
  },

  vehicleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  vehicleNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827"
  },

  vehicleTypeBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },

  vehicleTypeText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 12
  },

  servicesTop: {
    marginBottom: 18
  },

  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },

  serviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },

  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  serviceName: {
    fontWeight: "600",
    color: "#111827",
    flex: 1
  },

  partMeta: {
    color: "#6B7280",
    marginTop: 5,
    fontSize: 13
  },

  servicePrice: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 15
  },

  summaryCard: {
    marginHorizontal: 18,
    borderRadius: 24,
    padding: 22,
    marginTop: 20
  },

  summaryTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 22
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },

  summaryLabel: {
    color: "#D1D5DB"
  },

  summaryValue: {
    color: "white",
    fontWeight: "600"
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 18
  },

  totalLabel: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },

  totalAmount: {
    color: "#22C55E",
    fontSize: 30,
    fontWeight: "bold"
  },

  paidAmount: {
    color: "#60A5FA",
    fontWeight: "bold"
  },

  balanceAmount: {
    color: "#FCA5A5",
    fontWeight: "bold"
  },

  paymentModeCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginTop: 10
  },

  paymentModeLabel: {
    color: "#9CA3AF",
    marginBottom: 6
  },

  paymentModeValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  noteCard: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start"
  },

  noteTitle: {
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 5
  },

  noteText: {
    color: "#92400E",
    lineHeight: 22
  },

  downloadBtn: {
    backgroundColor: "#2563EB",
    marginHorizontal: 18,
    marginTop: 24,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },

  whatsappBtn: {
    backgroundColor: "#16A34A",
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },

  downloadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10
  },

  secondaryBtn: {
    backgroundColor: "white",
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center"
  },

  secondaryText: {
    color: "#111827",
    fontWeight: "700"
  }

})
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import { Platform } from "react-native"

const escapeHtml = (value: any) => {
  if (value === null || value === undefined) return ""

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const currency = (value: any) => {
  return `₹${Number(value || 0).toFixed(2)}`
}

const formatDate = (value: any) => {
  if (!value) return "-"

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return String(value)
  }
}

const buildJobSheetHtml = (
  job: any,
  assignedWorker?: any
) => {
  const services = Array.isArray(job.services)
    ? job.services
    : []

  const parts = Array.isArray(job.parts)
    ? job.parts
    : []

  /*
   * SERVICES
   */

  const servicesEstimatedSubtotal = services.reduce(
    (sum: number, item: any) => {
      const quantity = Number(item.quantity ?? 1)
      const estimatedPrice = Number(
        item.estimatedPrice || 0
      )

      return sum + estimatedPrice * quantity
    },
    0
  )

  const servicesActualSubtotal = services.reduce(
    (sum: number, item: any) => {
      const quantity = Number(item.quantity ?? 1)

      const estimatedPrice = Number(
        item.estimatedPrice || 0
      )

      const actualPrice =
        item.actualPrice !== null &&
        item.actualPrice !== undefined &&
        item.actualPrice !== ""
          ? Number(item.actualPrice)
          : estimatedPrice

      return sum + actualPrice * quantity
    },
    0
  )

  /*
   * PARTS
   */

  const partsEstimatedSubtotal = parts.reduce(
    (sum: number, item: any) => {
      const quantity = Number(item.quantity || 1)

      const estimatedUnitPrice = Number(
        item.estimatedUnitPrice ||
        item.price ||
        item.unitPrice ||
        0
      )

      return (
        sum +
        estimatedUnitPrice * quantity
      )
    },
    0
  )

  const partsActualSubtotal = parts.reduce(
    (sum: number, item: any) => {
      if (
        item.totalPrice !== undefined &&
        item.totalPrice !== null
      ) {
        return sum + Number(item.totalPrice)
      }

      const quantity = Number(
        item.quantity || 1
      )

      const actualUnitPrice = Number(
        item.actualUnitPrice !== undefined &&
        item.actualUnitPrice !== null
          ? item.actualUnitPrice
          : item.estimatedUnitPrice || 0
      )

      return (
        sum +
        actualUnitPrice * quantity
      )
    },
    0
  )

  /*
   * LABOR / DISCOUNT
   */

  const laborCost = Number(
    job.laborCost || 0
  )

  const discountPercent = Number(
    job.discount || 0
  )

  const rawEstimatedTotal =
    servicesEstimatedSubtotal +
    partsEstimatedSubtotal +
    laborCost

  const estimatedDiscountAmount =
    (rawEstimatedTotal *
      Math.min(discountPercent, 100)) /
    100

  const estimatedGrandTotal = Math.max(
    0,
    rawEstimatedTotal -
      estimatedDiscountAmount
  )

  const rawActualTotal =
    servicesActualSubtotal +
    partsActualSubtotal +
    laborCost

  const actualDiscountAmount =
    (rawActualTotal *
      Math.min(discountPercent, 100)) /
    100

  const calculatedActualTotal =
    Math.max(
      0,
      rawActualTotal -
        actualDiscountAmount
    )

  const actualGrandTotal =
    job.totalAmount !== undefined &&
    job.totalAmount !== null &&
    Number(job.totalAmount) > 0
      ? Number(job.totalAmount)
      : calculatedActualTotal

  /*
   * SERVICES TABLE
   */

  const servicesHtml =
    services.length === 0
      ? `
        <tr>
          <td colspan="5" class="empty">
            No services added
          </td>
        </tr>
      `
      : services
          .map((service: any) => {
            const quantity =
              Number(service.quantity ?? 1)

            const estimatedPrice =
              Number(
                service.estimatedPrice || 0
              )

            const actualPrice =
              service.actualPrice !== null &&
              service.actualPrice !== undefined &&
              service.actualPrice !== ""
                ? Number(service.actualPrice)
                : estimatedPrice

            return `
              <tr>
                <td>
                  ${escapeHtml(
                    service.name || "-"
                  )}
                </td>

                <td class="center">
                  ${quantity}
                </td>

                <td class="right">
                  ${currency(
                    estimatedPrice
                  )}
                </td>

                <td class="right">
                  ${currency(
                    actualPrice
                  )}
                </td>

                <td class="right">
                  ${currency(
                    actualPrice * quantity
                  )}
                </td>
              </tr>
            `
          })
          .join("")

  /*
   * PARTS TABLE
   */

  const partsHtml =
    parts.length === 0
      ? `
        <tr>
          <td colspan="5" class="empty">
            No parts added
          </td>
        </tr>
      `
      : parts
          .map((part: any) => {
            const quantity =
              Number(part.quantity || 1)

            const estimatedUnitPrice =
              Number(
                part.estimatedUnitPrice ||
                part.price ||
                part.unitPrice ||
                0
              )

            const actualUnitPrice =
              Number(
                part.actualUnitPrice !==
                  undefined &&
                part.actualUnitPrice !== null
                  ? part.actualUnitPrice
                  : estimatedUnitPrice
              )

            const itemTotal =
              part.totalPrice !==
                undefined &&
              part.totalPrice !== null
                ? Number(part.totalPrice)
                : quantity *
                  actualUnitPrice

            return `
              <tr>
                <td>
                  ${escapeHtml(
                    part.name || "-"
                  )}
                </td>

                <td class="center">
                  ${quantity}
                </td>

                <td class="right">
                  ${currency(
                    estimatedUnitPrice
                  )}
                </td>

                <td class="right">
                  ${currency(
                    actualUnitPrice
                  )}
                </td>

                <td class="right">
                  ${currency(itemTotal)}
                </td>
              </tr>
            `
          })
          .join("")

  /*
   * GARAGE INFORMATION
   *
   * Supports several possible field names so
   * the document can use whatever your backend
   * currently returns.
   */

  const garageName =
    job.garageName ||
    job.garage?.garageName ||
    "Garage"

  const garageOwner =
    job.ownerName ||
    job.garage?.ownerName ||
    ""

  const garagePhone =
    job.garagePhone ||
    job.garage?.phone ||
    job.phoneNumber ||
    ""

  const garageAddress =
    job.garageAddress ||
    job.garage?.address ||
    ""

  const garageCity =
    job.garageCity ||
    job.garage?.city ||
    ""

  const garageState =
    job.garageState ||
    job.garage?.state ||
    ""

  const fullGarageAddress = [
    garageAddress,
    garageCity,
    garageState
  ]
    .filter(Boolean)
    .join(", ")

  /*
   * CUSTOMER
   */

  const customerName =
    job.customerName ||
    job.customer?.name ||
    "-"

  const customerPhone =
    job.phone ||
    job.customerPhone ||
    job.customer?.phone ||
    "-"

  const customerAddress =
    job.customerAddress ||
    job.customer?.address ||
    "-"

  /*
   * VEHICLE
   */

  const vehicleNumber =
    job.vehicleNumber || "-"

  const vehicleBrand =
    job.vehicleBrand || ""

  const vehicleModel =
    job.vehicleModel || ""

  const vehicleType =
    job.vehicleType || "-"

  const vehicleName =
    `${vehicleBrand} ${vehicleModel}`
      .trim() || "-"

  /*
   * WORKER
   */

  const workerName =
    job.workerName ||
    assignedWorker?.name ||
    "-"

  /*
   * HTML DOCUMENT
   */

  return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8" />

<title>
  Job Sheet - ${escapeHtml(
    vehicleNumber
  )}
</title>

<style>

@page {
  size: A4;
  margin: 15mm;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
}

body {
  font-family:
    Arial,
    Helvetica,
    sans-serif;

  color: #111827;

  font-size: 12px;

  line-height: 1.45;
}

/*
 HEADER
*/

.header {
  border-bottom:
    3px solid #2563EB;

  padding-bottom: 12px;

  margin-bottom: 18px;
}

.header-row {
  display: flex;

  justify-content:
    space-between;

  align-items:
    flex-start;
}

.garage-name {
  font-size: 24px;

  font-weight: 700;

  color: #111827;

  margin-bottom: 4px;
}

.garage-info {
  color: #6B7280;

  font-size: 11px;

  line-height: 17px;
}

.document-title {
  text-align: right;

  font-size: 24px;

  font-weight: 700;

  color: #2563EB;
}

.document-number {
  text-align: right;

  margin-top: 5px;

  font-size: 11px;

  color: #6B7280;
}

/*
 SECTION
*/

.section {
  margin-bottom: 18px;

  page-break-inside:
    avoid;
}

.section-title {
  font-size: 14px;

  font-weight: 700;

  background: #F3F4F6;

  border-left:
    4px solid #2563EB;

  padding:
    7px 10px;

  margin-bottom: 10px;
}

/*
 INFO GRID
*/

.info-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    8px 20px;
}

.info-item {
  padding: 4px 0;
}

.info-label {
  color: #6B7280;

  font-size: 10px;

  text-transform:
    uppercase;

  margin-bottom: 2px;
}

.info-value {
  font-weight: 600;

  color: #111827;

  word-break: break-word;
}

/*
 COMPLAINT / NOTES
*/

.notes-box {
  border:
    1px solid #D1D5DB;

  border-radius: 5px;

  padding: 10px;

  margin-top: 8px;

  min-height: 35px;

  white-space: pre-wrap;
}

/*
 TABLE
*/

table {
  width: 100%;

  border-collapse:
    collapse;

  margin-top: 5px;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside:
    avoid;
}

th {
  background: #1E293B;

  color: white;

  padding: 8px;

  font-size: 10px;

  text-align: left;
}

td {
  border-bottom:
    1px solid #E5E7EB;

  padding: 8px;

  font-size: 11px;

  vertical-align:
    top;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.empty {
  text-align: center;

  color: #9CA3AF;

  padding: 15px;
}

/*
 SUMMARY
*/

.summary-wrapper {
  display: flex;

  justify-content:
    flex-end;
}

.summary {
  width: 55%;

  border:
    1px solid #D1D5DB;

  border-radius: 6px;

  overflow: hidden;
}

.summary-row {
  display: flex;

  justify-content:
    space-between;

  padding:
    8px 10px;

  border-bottom:
    1px solid #E5E7EB;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  color: #6B7280;
}

.summary-value {
  font-weight: 600;
}

.estimated-row {
  color: #2563EB;

  font-weight: 600;
}

.actual-row {
  background: #ECFDF5;

  color: #047857;

  font-size: 15px;

  font-weight: 700;
}

/*
 APPROVAL
*/

.approval-box {
  border:
    1px solid #D1D5DB;

  padding: 12px;

  font-size: 10px;

  color: #4B5563;

  line-height: 16px;
}

.signature-container {
  display: flex;

  justify-content:
    space-between;

  margin-top: 55px;
}

.signature {
  width: 40%;

  border-top:
    1px solid #111827;

  text-align: center;

  padding-top: 6px;

  font-size: 10px;
}

/*
 FOOTER
*/

.footer {
  margin-top: 25px;

  border-top:
    1px solid #E5E7EB;

  padding-top: 8px;

  text-align: center;

  font-size: 9px;

  color: #9CA3AF;
}

/*
 PRINT ONLY
*/

@media print {

  body {
    background: white;
  }

  .no-print {
    display: none !important;
  }

}

</style>

</head>

<body>

<!-- ================= HEADER ================= -->

<div class="header">

  <div class="header-row">

    <div>

      <div class="garage-name">
        ${escapeHtml(garageName)}
      </div>

      ${
        garageOwner
          ? `
            <div class="garage-info">
              Owner:
              ${escapeHtml(garageOwner)}
            </div>
          `
          : ""
      }

      ${
        fullGarageAddress
          ? `
            <div class="garage-info">
              ${escapeHtml(
                fullGarageAddress
              )}
            </div>
          `
          : ""
      }

      ${
        garagePhone
          ? `
            <div class="garage-info">
              Phone:
              ${escapeHtml(
                garagePhone
              )}
            </div>
          `
          : ""
      }

    </div>

    <div>

      <div class="document-title">
        JOB SHEET
      </div>

      <div class="document-number">
        Job ID:
        ${escapeHtml(
          job.jobId || "-"
        )}
      </div>

      <div class="document-number">
        Created:
        ${formatDate(
          job.createdAt
        )}
      </div>

    </div>

  </div>

</div>


<!-- ================= CUSTOMER ================= -->

<div class="section">

  <div class="section-title">
    Customer Information
  </div>

  <div class="info-grid">

    <div class="info-item">
      <div class="info-label">
        Customer Name
      </div>

      <div class="info-value">
        ${escapeHtml(customerName)}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Phone
      </div>

      <div class="info-value">
        ${escapeHtml(customerPhone)}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Address
      </div>

      <div class="info-value">
        ${escapeHtml(customerAddress)}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Job Status
      </div>

      <div class="info-value">
        ${escapeHtml(
          job.status || "-"
        )}
      </div>
    </div>

  </div>

</div>


<!-- ================= VEHICLE ================= -->

<div class="section">

  <div class="section-title">
    Vehicle Information
  </div>

  <div class="info-grid">

    <div class="info-item">
      <div class="info-label">
        Registration Number
      </div>

      <div class="info-value">
        ${escapeHtml(
          vehicleNumber
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Vehicle
      </div>

      <div class="info-value">
        ${escapeHtml(
          vehicleName
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Vehicle Type
      </div>

      <div class="info-value">
        ${escapeHtml(
          vehicleType
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Odometer
      </div>

      <div class="info-value">
        ${
          job.odometer
            ? `${escapeHtml(
                job.odometer
              )} km`
            : "-"
        }
      </div>
    </div>

  </div>

</div>


<!-- ================= JOB INFORMATION ================= -->

<div class="section">

  <div class="section-title">
    Job Information
  </div>

  <div class="info-grid">

    <div class="info-item">
      <div class="info-label">
        Assigned Worker
      </div>

      <div class="info-value">
        ${escapeHtml(
          workerName
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Priority
      </div>

      <div class="info-value">
        ${escapeHtml(
          job.priority || "-"
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Expected Delivery
      </div>

      <div class="info-value">
        ${formatDate(
          job.deliveryDate
        )}
      </div>
    </div>

    <div class="info-item">
      <div class="info-label">
        Job Created
      </div>

      <div class="info-value">
        ${formatDate(
          job.createdAt
        )}
      </div>
    </div>

  </div>

  <div
    class="info-label"
    style="margin-top:10px;"
  >
    Customer Complaint
  </div>

  <div class="notes-box">
    ${escapeHtml(
      job.complaint || "-"
    )}
  </div>

  <div
    class="info-label"
    style="margin-top:10px;"
  >
    Inspection Notes
  </div>

  <div class="notes-box">
    ${escapeHtml(
      job.inspectionNotes || "-"
    )}
  </div>

</div>


<!-- ================= SERVICES ================= -->

<div class="section">

  <div class="section-title">
    Services
  </div>

  <table>

    <thead>

      <tr>

        <th>
          Service
        </th>

        <th class="center">
          Qty
        </th>

        <th class="right">
          Estimated Unit
        </th>

        <th class="right">
          Actual Unit
        </th>

        <th class="right">
          Actual Total
        </th>

      </tr>

    </thead>

    <tbody>
      ${servicesHtml}
    </tbody>

  </table>

</div>


<!-- ================= PARTS ================= -->

<div class="section">

  <div class="section-title">
    Spare Parts / Inventory
  </div>

  <table>

    <thead>

      <tr>

        <th>
          Part
        </th>

        <th class="center">
          Qty
        </th>

        <th class="right">
          Estimated Unit
        </th>

        <th class="right">
          Actual Unit
        </th>

        <th class="right">
          Actual Total
        </th>

      </tr>

    </thead>

    <tbody>
      ${partsHtml}
    </tbody>

  </table>

</div>


<!-- ================= BILLING ================= -->

<div class="section">

  <div class="section-title">
    Cost Summary
  </div>

  <div class="summary-wrapper">

    <div class="summary">

      <div class="summary-row">

        <span class="summary-label">
          Services
        </span>

        <span class="summary-value">
          ${currency(
            servicesActualSubtotal
          )}
        </span>

      </div>

      <div class="summary-row">

        <span class="summary-label">
          Parts
        </span>

        <span class="summary-value">
          ${currency(
            partsActualSubtotal
          )}
        </span>

      </div>

      <div class="summary-row">

        <span class="summary-label">
          Labor
        </span>

        <span class="summary-value">
          ${currency(
            laborCost
          )}
        </span>

      </div>

      ${
        discountPercent > 0
          ? `
            <div class="summary-row">

              <span class="summary-label">
                Discount
                (${discountPercent}%)
              </span>

              <span class="summary-value">
                -
                ${currency(
                  actualDiscountAmount
                )}
              </span>

            </div>
          `
          : ""
      }

      <div
        class="summary-row estimated-row"
      >

        <span>
          Estimated Total
        </span>

        <span>
          ${currency(
            estimatedGrandTotal
          )}
        </span>

      </div>

      <div
        class="summary-row actual-row"
      >

        <span>
          Current Total
        </span>

        <span>
          ${currency(
            actualGrandTotal
          )}
        </span>

      </div>

    </div>

  </div>

</div>


<!-- ================= CUSTOMER APPROVAL ================= -->

<div class="section">

  <div class="section-title">
    Customer Approval
  </div>

  <div class="approval-box">

    I confirm that the above vehicle details,
    requested work, services and parts have
    been reviewed. I understand that the
    current total may change if additional
    work or parts are required and approved.

  </div>

  <div class="signature-container">

    <div class="signature">
      Customer Signature
    </div>

    <div class="signature">
      Garage Representative
    </div>

  </div>

</div>


<div class="footer">

  Job Sheet &nbsp;•&nbsp;
  This document is not a tax invoice.

</div>

</body>

</html>
`
}

/*
 * WEB PRINT
 *
 * Creates a completely separate browser
 * document. Therefore your React Native
 * buttons cannot appear in the printout.
 */

const printWebJobSheet = async (
  html: string
) => {
  if (
    typeof window === "undefined"
  ) {
    return
  }

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=1200"
    )

  if (!printWindow) {
    throw new Error(
      "Unable to open print window. Please allow popups for this site."
    )
  }

  printWindow.document.open()

  printWindow.document.write(
    html
  )

  printWindow.document.close()

  await new Promise<void>(
    (resolve) => {
      const doPrint = () => {
        try {
          printWindow.focus()
          printWindow.print()
        } finally {
          resolve()
        }
      }

      if (
        printWindow.document.readyState ===
        "complete"
      ) {
        setTimeout(
          doPrint,
          300
        )
      } else {
        printWindow.onload = () => {
          setTimeout(
            doPrint,
            300
          )
        }
      }
    }
  )
}

export const printJobSheet = async (
  job: any,
  assignedWorker?: any
) => {
  const html =
    buildJobSheetHtml(
      job,
      assignedWorker
    )

  /*
   * WEB
   *
   * Never print the React Native
   * application screen.
   */

  if (Platform.OS === "web") {
    await printWebJobSheet(html)
    return
  }

  /*
   * ANDROID / IOS
   */

  await Print.printAsync({
    html
  })
}

export const shareJobSheet = async (
  job: any,
  assignedWorker?: any
) => {
  const html =
    buildJobSheetHtml(
      job,
      assignedWorker
    )

  /*
   * WEB
   */

  if (Platform.OS === "web") {
    await printWebJobSheet(html)
    return
  }

  /*
   * ANDROID / IOS
   */

  const available =
    await Sharing.isAvailableAsync()

  if (!available) {
    throw new Error(
      "Sharing is not available on this device."
    )
  }

  const result =
    await Print.printToFileAsync({
      html
    })

  await Sharing.shareAsync(
    result.uri,
    {
      mimeType:
        "application/pdf",

      UTI:
        "com.adobe.pdf",

      dialogTitle:
        "Share Job Sheet"
    }
  )
}
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"

export const generateInvoice = async (job: any) => {

  const total = job.services.reduce(
    (sum: number, s: any) => sum + (s.actualPrice ?? s.estimatedPrice),
    0
  )

  const servicesHTML = job.services.map((s: any) => `
    <tr>
      <td>${s.name}</td>
      <td>₹${s.estimatedPrice}</td>
      <td>₹${s.actualPrice ?? s.estimatedPrice}</td>
    </tr>
  `).join("")

  const html = `
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Garage Invoice</h2>

        <p><strong>Customer:</strong> ${job.customer}</p>
        <p><strong>Vehicle:</strong> ${job.vehicle}</p>

        <table border="1" cellspacing="0" cellpadding="8" width="100%">
          <tr>
            <th>Service</th>
            <th>Estimated</th>
            <th>Actual</th>
          </tr>
          ${servicesHTML}
        </table>

        <h3 style="margin-top:20px;">Total: ₹${total}</h3>

        <p>Thank you for your business!</p>
      </body>
    </html>
  `

  const { uri } = await Print.printToFileAsync({ html })

  await Sharing.shareAsync(uri)
}
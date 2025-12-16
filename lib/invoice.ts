import api from "./api";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  appointmentId: string;
  createdAt: string;
}

export interface GetInvoiceResponse {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}

/**
 * Get invoice by appointment ID
 */
export async function getInvoiceByAppointmentId(
  appointmentId: string
): Promise<GetInvoiceResponse> {
  try {
    const res = await api.get<GetInvoiceResponse>(
      `invoice/appointment/${appointmentId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("[INVOICE] Error fetching invoice:", error);
    if (error?.response?.status === 404) {
      // Invoice not found - this is ok, it may not be generated yet
      return {
        success: false,
        error: "Invoice not found",
      };
    }
    return {
      success: false,
      error: error?.response?.data?.error || "Failed to fetch invoice",
    };
  }
}

/**
 * Download invoice PDF by invoice number
 */
export async function downloadInvoice(invoiceNumber: string): Promise<void> {
  try {
    const res = await api.get<Blob>(`invoice/${invoiceNumber}`, {
      responseType: "blob", // Important for downloading PDF
    });

    // Create blob URL and trigger download
    const blob = new Blob([res.data as Blob], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("[INVOICE] Error downloading invoice:", error);
    throw new Error(
      error?.response?.data?.error || "Failed to download invoice"
    );
  }
}

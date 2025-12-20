import api from "./api";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  appointmentId: string;
  pdfUrl?: string; // Cloudinary URL for direct access
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
 * Get invoice download URL by invoice number
 * Returns Cloudinary URL for direct download/preview
 */
export async function getInvoiceDownloadUrl(
  invoiceNumber: string
): Promise<string> {
  try {
    const res = await api.get<{ success: boolean; url: string }>(
      `invoice/${invoiceNumber}`
    );

    if (res.data.success && res.data.url) {
      return res.data.url;
    }

    throw new Error("Invoice URL not found");
  } catch (error: any) {
    console.error("[INVOICE] Error fetching invoice URL:", error);
    throw new Error(
      error?.response?.data?.error || "Failed to fetch invoice URL"
    );
  }
}

/**
 * Download invoice PDF by invoice number
 * Opens invoice in new tab or triggers download
 */
export async function downloadInvoice(
  invoiceNumber: string,
  openInNewTab = false
): Promise<void> {
  try {
    // Get Cloudinary URL from backend
    const url = await getInvoiceDownloadUrl(invoiceNumber);

    if (openInNewTab) {
      // Open PDF in new tab for preview
      window.open(url, "_blank");
    } else {
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      link.target = "_blank"; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error: any) {
    console.error("[INVOICE] Error downloading invoice:", error);
    throw new Error(
      error?.response?.data?.error || "Failed to download invoice"
    );
  }
}

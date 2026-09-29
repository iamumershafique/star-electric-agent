export type BrandCategory = 
  | 'Pakistan Cables'
  | 'Amer Cables'
  | 'Schneider Electric'
  | 'Terasaki'
  | 'Philips / Pak Lighting'
  | 'Conduit & Accessories'
  | 'Switches & Sockets'
  | 'General Electrical';

export type ItemStatus = 'Pending' | 'Partially Fulfilled' | 'Completed' | 'Cancelled';
export type PRStatus = 'Pending' | 'In-Progress' | 'Fulfilled' | 'Cancelled';
export type NavigationTab = 'dashboard' | 'ledger' | 'deliveries' | 'brands' | 'search' | 'gemini-audit' | 'system-audit';

export interface LineItem {
  id: string;
  name: string;
  brand: BrandCategory;
  requestedQty: number;
  fulfilledQty: number;
  unit: string;
  unitPricePKR?: number;
  status: ItemStatus;
  specifications?: string;
}

export type TransportType = 'Delivered' | 'Adda / Goods Transport' | 'Pickup / Driver';

export interface FulfillmentLog {
  id: string;
  dcNumber: string;
  invoiceNumber: string; // Strictly equals dcNumber
  prNumber: string;
  itemId: string;
  itemName: string;
  quantityShipped: number;
  date: string;
  transportType?: TransportType;
  addaName?: string;
  biltyNumber?: string;
  freightCharges?: number;
  isFreightFree?: boolean;
  driverName?: string;
  vehicleNo?: string;
  deliveredBy?: string;
  notes?: string;
  builtyAttached?: boolean;
  builtyImage?: string;
}

export interface PRRecord {
  id: string;
  prNumber: string;
  date: string;
  siteName: string;
  status: PRStatus;
  items: LineItem[];
  fulfillmentLogs: FulfillmentLog[];
  documentImage?: string;
  createdTimestamp: number;
  notes?: string;
  contactPerson?: string;
}

export interface DCRecord {
  id: string;
  dcNumber: string;
  invoiceNumber: string; // Unified: matches dcNumber
  prNumber: string;
  prId: string;
  date: string;
  siteName: string;
  itemsShipped: {
    itemId: string;
    itemName: string;
    brand: string;
    quantity: number;
    unit: string;
  }[];
  documentImage?: string;
  createdTimestamp: number;
  transportType?: TransportType;
  addaName?: string;
  biltyNumber?: string;
  freightCharges?: number;
  isFreightFree?: boolean;
  driverName?: string;
  vehicleNumber?: string;
  deliveryStatus?: 'Delivered' | 'In-Transit' | 'Dispatched';
  remarks?: string;
  // Goods Delivered Builty Picture & Automation Fields
  isBuiltyAttached?: boolean;
  noBuiltyRequired?: boolean;
  builtyImage?: string;
  builtyDate?: string;
  packagesCount?: string;
  destinationCity?: string;
  freightStatus?: 'Paid' | 'To Pay' | 'Free';
  // Missing PR Resolution & Attachment Fields
  noPrRequired?: boolean;
  prDocumentImage?: string;
}

export interface DriveVerifiedDCUpdate {
  id: string;
  dcNumber: string;
  prId?: string;
  prNumber?: string;
  date?: string;
  siteName?: string;
  documentImage?: string;
  builtyImage?: string;
  noBuiltyRequired?: boolean;
}

export interface DriveVerifiedPRFulfillmentUpdate {
  id: string;
  prNumber: string;
  date: string;
  status: PRStatus;
  items: LineItem[];
  fulfillmentLogs: FulfillmentLog[];
}

export interface SiteLocation {
  id: string;
  name: string;
  region: string;
  code: string;
}

export interface GeminiExtractionResult {
  documentType?: 'PURCHASE_REQUISITION' | 'DELIVERY_CHALLAN' | 'OTHER' | 'UNCLEAR';
  prNumber: string; // Set to "NO PR" if no PR number exists on document
  date: string;
  siteName: string;
  lineItems: {
    name: string;
    brand: BrandCategory;
    quantity: number;
    unit: string;
    specifications?: string;
  }[];
  confidence: number;
  rawAnalysis?: string;
  documentImage?: string;
}

export interface GeminiMultiPRBatchResult {
  requisitions: GeminiExtractionResult[];
  rawAnalysis?: string;
}

export interface GeminiDCExtractionResult {
  documentType?: 'DELIVERY_CHALLAN' | 'PURCHASE_REQUISITION' | 'OTHER' | 'UNCLEAR';
  dcNumber: string;
  invoiceNumber: string;
  prNumber: string; // Auto-matched PR Number if detected
  date: string;
  siteName: string;
  driverName?: string;
  vehicleNumber?: string;
  remarks?: string;
  shippedItems: {
    itemName: string;
    brand?: string;
    quantityShipped: number;
    unit: string;
  }[];
  confidence: number;
  rawAnalysis?: string;
  documentImage?: string;
}

export interface GeminiBuiltyExtractionResult {
  dcNumber: string; // DC Number written on builty (e.g., "DC-674", "DC-668")
  builtyNumber: string; // Consignment / Bilty # (e.g., "78412", "CN-412")
  addaName: string; // Goods Transport Adda / Company (e.g., "Tariq Goods Transport")
  destinationCity: string; // e.g., "Khanewal", "Sahiwal", "Mankera", "Rawat"
  packagesCount?: string; // e.g., "3 Bundles Cable", "2 Cartons"
  freightCharges?: number; // e.g., 750
  freightStatus?: 'Paid' | 'To Pay' | 'Free';
  builtyDate: string; // YYYY-MM-DD
  sender?: string; // e.g., "Star Electric Enterprises Rawalpindi"
  receiver?: string; // e.g., "Jadeed Group"
  builtyImage?: string; // Base64 data URL
  confidence: number;
  rawAnalysis?: string;
}

export interface BuiltyPreviewInfo {
  url: string;
  title: string;
  dcNumber?: string;
  biltyNumber?: string;
  addaName?: string;
  destinationCity?: string;
  packagesCount?: string;
  freightCharges?: number;
  freightStatus?: 'Paid' | 'To Pay' | 'Free';
  siteName?: string;
  date?: string;
}

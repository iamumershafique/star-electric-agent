import type { DCRecord, PRRecord } from '../../src/types';

/** A stand-in scan: a plain SVG page carrying the document number, used as an embedded data URL. */
export function mockScan(label: string, sub = 'DEMO SCAN'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="1000">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="20" y="20" width="720" height="960" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <text x="380" y="120" font-family="Georgia, serif" font-size="42" text-anchor="middle" fill="#0f172a">STAR ELECTRIC ENTERPRISES</text>
  <text x="380" y="165" font-family="Georgia, serif" font-size="24" text-anchor="middle" fill="#475569">Saddar, Rawalpindi</text>
  <text x="380" y="250" font-family="Georgia, serif" font-size="36" text-anchor="middle" fill="#b91c1c">${label}</text>
  <text x="380" y="320" font-family="Georgia, serif" font-size="20" text-anchor="middle" fill="#64748b">${sub}</text>
  <line x1="60" y1="360" x2="700" y2="360" stroke="#cbd5e1" stroke-width="2"/>
  <text x="60" y="430" font-family="Georgia, serif" font-size="22" fill="#334155">Qty.   PARTICULARS</text>
  <text x="60" y="490" font-family="Georgia, serif" font-size="22" fill="#334155">12     EOCR Electronic Overload Relay Schneider</text>
  <text x="60" y="550" font-family="Georgia, serif" font-size="22" fill="#334155">36     Limit Switch Heavy Duty</text>
  <text x="60" y="610" font-family="Georgia, serif" font-size="22" fill="#334155">1      MCCB 630Amp Terasaki E-630NE</text>
  <text x="60" y="670" font-family="Georgia, serif" font-size="22" fill="#334155">50     Industrial Plug / Socket 16AMP</text>
  <text x="60" y="900" font-family="Georgia, serif" font-size="20" fill="#64748b">JADEED GROUP — ${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const item = (id: string, name: string, brand: PRRecord['items'][number]['brand'], qty: number, unit: string, fulfilled = 0) => ({
  id, name, brand, requestedQty: qty, fulfilledQty: fulfilled, unit,
  status: fulfilled <= 0 ? 'Pending' as const : fulfilled >= qty ? 'Completed' as const : 'Partially Fulfilled' as const
});

export const SEED_SITES = [
  'Hatchery Rawat',
  'Warehouse Rawat',
  'Feed Mill Khanewal',
  'Oil Extraction Khanewal',
  'Agri Farm Mankera'
];

export const seedPRs: PRRecord[] = [
  {
    id: 'pr-demo-905',
    prNumber: 'PR-905',
    date: '2026-09-18',
    siteName: 'Hatchery Rawat',
    status: 'In-Progress',
    notes: 'Demo record',
    contactPerson: 'Engr. Subhan (Site Lead)',
    documentImage: mockScan('PR-905'),
    createdTimestamp: 1758200000000,
    items: [
      item('pr905-i1', 'EOCR- Electronic Overload controls Relay Schneider', 'Schneider Electric', 20, 'Numbers', 8),
      item('pr905-i2', 'Limit Switch Heavy Duty Industrial', 'General Electrical', 40, 'Numbers', 4),
      item('pr905-i3', 'MCCB 630Amp 36kA Adjustable High Breaking Terasaki', 'Terasaki', 2, 'Numbers', 1),
      item('pr905-i4', 'Industrial Plug/Socket 5-pin 16AMP', 'Switches & Sockets', 50, 'Set', 0)
    ],
    fulfillmentLogs: []
  },
  {
    id: 'pr-demo-906',
    prNumber: 'PR-906',
    date: '2026-09-21',
    siteName: 'Feed Mill Khanewal',
    status: 'Pending',
    notes: 'Demo record',
    documentImage: mockScan('PR-906'),
    createdTimestamp: 1758450000000,
    items: [
      item('pr906-i1', 'Cable 7/29 2-Core PVC/PVC Copper', 'Pakistan Cables', 25, 'Coil', 0),
      item('pr906-i2', 'PVC Insulation Tape (Red, Yellow, Blue)', 'Conduit & Accessories', 100, 'Numbers', 0)
    ],
    fulfillmentLogs: []
  },
  {
    id: 'pr-demo-907',
    prNumber: 'PR-907',
    date: '2026-09-24',
    siteName: 'Oil Extraction Khanewal',
    status: 'Fulfilled',
    notes: 'Demo record',
    documentImage: mockScan('PR-907'),
    createdTimestamp: 1758710000000,
    items: [
      item('pr907-i1', 'LED Flood Light 200W Philips', 'Philips / Pak Lighting', 12, 'Numbers', 12)
    ],
    fulfillmentLogs: []
  }
];

export const seedDCs: DCRecord[] = [
  {
    id: 'dc-demo-908',
    dcNumber: 'DC-908',
    invoiceNumber: 'DC-908',
    prNumber: 'PR-905',
    prId: 'pr-demo-905',
    date: '2026-09-20',
    siteName: 'Hatchery Rawat',
    transportType: 'Adda / Goods Transport',
    addaName: 'Tariq Goods Transport Saddar Rawalpindi',
    biltyNumber: '78412',
    freightCharges: 750,
    freightStatus: 'Paid',
    deliveryStatus: 'Delivered',
    remarks: 'Sent via Tariq Goods Transport Saddar Rawalpindi',
    documentImage: mockScan('DC-908', 'DEMO DELIVERY CHALLAN'),
    createdTimestamp: 1758400000000,
    itemsShipped: [
      { itemId: 'pr905-i1', itemName: 'EOCR- Electronic Overload controls Relay Schneider', brand: 'Schneider Electric', quantity: 8, unit: 'Numbers' },
      { itemId: 'pr905-i3', itemName: 'MCCB 630Amp 36kA Adjustable High Breaking Terasaki', brand: 'Terasaki', quantity: 1, unit: 'Numbers' }
    ]
  },
  {
    id: 'dc-demo-909',
    dcNumber: 'DC-909',
    invoiceNumber: 'DC-909',
    prNumber: 'PR-905',
    prId: 'pr-demo-905',
    date: '2026-09-22',
    siteName: 'Hatchery Rawat',
    transportType: 'Pickup / Driver',
    driverName: 'Nawaz',
    vehicleNumber: 'STS-1500',
    deliveryStatus: 'In-Transit',
    documentImage: mockScan('DC-909', 'DEMO DELIVERY CHALLAN'),
    createdTimestamp: 1758550000000,
    itemsShipped: [
      { itemId: 'pr905-i2', itemName: 'Limit Switch Heavy Duty Industrial', brand: 'General Electrical', quantity: 4, unit: 'Numbers' }
    ]
  },
  {
    id: 'dc-demo-910',
    dcNumber: 'DC-910',
    invoiceNumber: 'DC-910',
    prNumber: 'PR-907',
    prId: 'pr-demo-907',
    date: '2026-09-25',
    siteName: 'Oil Extraction Khanewal',
    transportType: 'Adda / Goods Transport',
    addaName: 'Rawalpindi Goods Transport Adda',
    freightCharges: 1100,
    freightStatus: 'To Pay',
    deliveryStatus: 'Delivered',
    documentImage: mockScan('DC-910', 'DEMO DELIVERY CHALLAN'),
    createdTimestamp: 1758800000000,
    itemsShipped: [
      { itemId: 'pr907-i1', itemName: 'LED Flood Light 200W Philips', brand: 'Philips / Pak Lighting', quantity: 12, unit: 'Numbers' }
    ]
  },
  {
    id: 'dc-demo-911',
    dcNumber: 'DC-911',
    invoiceNumber: 'DC-911',
    prNumber: '',
    prId: '',
    date: '2026-09-26',
    siteName: 'Agri Farm Mankera',
    transportType: 'Delivered',
    deliveryStatus: 'Dispatched',
    remarks: 'Awaiting PR reference from site',
    documentImage: mockScan('DC-911', 'DEMO DELIVERY CHALLAN'),
    createdTimestamp: 1758900000000,
    itemsShipped: [
      { itemId: 'dc911-i1', itemName: 'PVC Socket 1" white Turk Plast', brand: 'Conduit & Accessories', quantity: 100, unit: 'Numbers' }
    ]
  }
];

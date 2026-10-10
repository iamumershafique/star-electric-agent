import type { DCRecord } from '../types';

export const JADEED_DRIVE_LINKS = {
  masterFolder: 'https://drive.google.com/drive/folders/1nVxz4_rtVUnYed8PEykDaQub61FdQHzL',
  builtyFolder: 'https://drive.google.com/drive/folders/1g7a0-mJH61IAnyvZaTNC8SdMHEYq1GTk',
  dcScanFolders: {
    '1-100': 'https://drive.google.com/drive/folders/1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_',
    '101-200': 'https://drive.google.com/drive/folders/1Iqo0pa1QMNKMdt7DZSuQqcP172P9bfG4',
    '201-300': 'https://drive.google.com/drive/folders/1Su5JfJ5jreZQEOTCa62bes0AN3gebYPE',
    '301-400': 'https://drive.google.com/drive/folders/1PAYxqvj8oxkPtmb9K8B9n4ywocc7ycaR',
    '401-500': 'https://drive.google.com/drive/folders/1CpAHo_PKsIOrXtJcynrZavkGKdJZEoal',
    '501-600': 'https://drive.google.com/drive/folders/1LZAguU5oBXo1dA2OoXLIMz36LZKOWAzp',
    '601-700': 'https://drive.google.com/drive/folders/1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW',
    '701-800': 'https://drive.google.com/drive/folders/1QirE97-gMrqZ5kQT_hZZGmRFB-efREro',
  }
};

export function getDCScanFolderLink(dcNumber: string): string {
  const match = dcNumber.match(/\d+/);
  if (!match) return JADEED_DRIVE_LINKS.masterFolder;
  const num = parseInt(match[0], 10);
  if (num <= 100) return JADEED_DRIVE_LINKS.dcScanFolders['1-100'];
  if (num <= 200) return JADEED_DRIVE_LINKS.dcScanFolders['101-200'];
  if (num <= 300) return JADEED_DRIVE_LINKS.dcScanFolders['201-300'];
  if (num <= 400) return JADEED_DRIVE_LINKS.dcScanFolders['301-400'];
  if (num <= 500) return JADEED_DRIVE_LINKS.dcScanFolders['401-500'];
  if (num <= 600) return JADEED_DRIVE_LINKS.dcScanFolders['501-600'];
  if (num <= 700) return JADEED_DRIVE_LINKS.dcScanFolders['601-700'];
  return JADEED_DRIVE_LINKS.dcScanFolders['701-800'];
}

export const JADEED_FARM_SITES: string[] = [
  "Agri Farm Bahawalpur",
  "Agri Farm Bhawalpur",
  "Agri Farm Khanewal",
  "Agri Farm Mankera",
  "Agri Farm Mankera 1",
  "Agri Farm Rangpur",
  "Bahter Farm 1",
  "Balkasar Farm",
  "Battal Farm",
  "Bhater 1 Farm",
  "Chicks Hatchery Karachi",
  "Chicks Hatchery Rawat",
  "Chicks Hatchery Sheikhupura",
  "Chicks Rawat Hatchery",
  "F-6 House 10 Isb",
  "F-6 House 10 Islamabad",
  "Farm Bahter Farm 1",
  "Farm House Mankera Bhakkar",
  "Farm Mankera Bhakkar",
  "Farm P.D Khan",
  "Feed Mill Bhawalpur",
  "Feed Mill Khanewal",
  "Feed Mill Shahkot",
  "GP-1 Farm Bhalwal",
  "Guest House",
  "Hatchery Karachi",
  "Hatchery Khanewal",
  "Hatchery Kotmomin",
  "Hatchery PR 134",
  "Head Office Rawalpindi",
  "House  451 PWD MAMOO",
  "House # 3, F-7/2 Islamabad",
  "House # 3, St. #25, F-7/2 Islamabad",
  "House 10 F-6 Isb",
  "House 10 ISB",
  "House 10 Islamabad",
  "House 10, F-6/3 ISB",
  "House 28 F-6/3 Islamabad",
  "House 28, F-6/3, Islamabad",
  "House 3, St 25, F-7/2",
  "House 451 PWD MAMOO",
  "House 8 F-6/3 Isb",
  "House 8, F-6/3 ISB",
  "House-10 Islamabad",
  "Infinaty Store Saidpur Road",
  "Infinity Adyala Road",
  "Infinity Basket Tarlaie",
  "Infinity Store C-2 Bahria",
  "Infinity Store Double Road",
  "Infinity Store Saidpur",
  "J.T.C Islamabad",
  "J.T.C. Islamabad",
  "JTC Islamabad",
  "Jadeed Farm Pirowal 1",
  "Jadeed Feed Mil Shahcoat",
  "Jadeed Group",
  "Jadeed Poltry Farm Pirowal 1",
  "Jungle Maryala Khanewal",
  "KHanewal Hatchery",
  "Khanewal Hatchery",
  "Madrasa 20/8r Mian Chuna",
  "Madrasa Khanewal",
  "Madrasa Mian Channu",
  "Mankera 2 Farm",
  "Mankera Bhakkar",
  "Marble Arch Girja Road Rwp",
  "Marble Town Rwp",
  "Masjid Chak 17-Khanewal",
  "Mosque Chak-17 Khanewal",
  "Oggi Mansera",
  "Oil Mill  Khanewal",
  "Oil Mill Khanewal",
  "P.D Khan",
  "P.D Khan Farm",
  "P.D Khan Fram",
  "Pirowal 1 Extension Khanewal",
  "Plot 35 Terial",
  "Plot 35 Terlai",
  "Poultary Farm Mankera Bhakkar",
  "Poultary Farm P.D. Khan",
  "Sanjawal Attock",
  "Sheikhupura Hachery",
  "Sohaib SB House ISB",
  "Ware House Rawat",
  "WareHouse",
  "WareHouse Khanewal",
  "WareHouse Rawalpindi",
  "WareHouse Rawat",
  "WareHouse khanewal",
  "Warehouse",
  "Warehouse Khanewal",
  "Warehouse Rawalpindi",
  "Warehouse Rawalpindi For P.D Khan",
  "Warehouse Rawat"
];

export const JADEED_HISTORY_DCS: DCRecord[] = [
  {
    "id": "dc-jad-0001",
    "dcNumber": "DC-0001",
    "invoiceNumber": "DC-0001",
    "prNumber": "PR-JAD-0001",
    "prId": "pr-jad-0001",
    "date": "2025-03-22",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000001000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0001-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1AYsDD1xjmX6DteEGf_J0LVXX8UDPUPOn=w1200"
  },
  {
    "id": "dc-jad-0002",
    "dcNumber": "DC-0002",
    "invoiceNumber": "DC-0002",
    "prNumber": "PR-JAD-0002",
    "prId": "pr-jad-0002",
    "date": "2025-03-22",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000002000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0002-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6528)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6528",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1RS4BQo6NNcf4GHUcog7EGylmeiTAfHP8=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1L0-o_0E0YR_vSmbXGIjhlBsIwXq_TM3d=w1200"
  },
  {
    "id": "dc-jad-0003",
    "dcNumber": "DC-0003",
    "invoiceNumber": "DC-0003",
    "prNumber": "PR-JAD-0003",
    "prId": "pr-jad-0003",
    "date": "2025-03-22",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000003000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0003-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6584)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6584",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1dT7Tl5WbQB9iJY9Mrakjk6Lw1Wme9uip=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/11by0hxgpy8ZozkIZbollBJ7MrRoZ2VxV=w1200"
  },
  {
    "id": "dc-jad-0004",
    "dcNumber": "DC-0004",
    "invoiceNumber": "DC-0004",
    "prNumber": "PR-JAD-0004",
    "prId": "pr-jad-0004",
    "date": "2025-03-24",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000004000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0004-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Nt1_hs0iDabg5ZRQFXJcCCtXvUi7a3uq=w1200"
  },
  {
    "id": "dc-jad-0005",
    "dcNumber": "DC-0005",
    "invoiceNumber": "DC-0005",
    "prNumber": "PR-JAD-0005",
    "prId": "pr-jad-0005",
    "date": "2025-03-25",
    "siteName": "Warehouse",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000005000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0005-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #4321)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "4321",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Warehouse",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1ntLt9RzP7OiURciSMmW1kdBu8i7yDk5c=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1al8Hn__a2ff4bCAxGwl6m3H0G5Kf3dFh=w1200"
  },
  {
    "id": "dc-jad-0006",
    "dcNumber": "DC-0006",
    "invoiceNumber": "DC-0006",
    "prNumber": "PR-JAD-0006",
    "prId": "pr-jad-0006",
    "date": "2025-03-28",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000006000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0006-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ipvSbdSz3Ola0EeF4PoJLLTz_iigC2qX=w1200"
  },
  {
    "id": "dc-jad-0007",
    "dcNumber": "DC-0007",
    "invoiceNumber": "DC-0007",
    "prNumber": "PR-JAD-0007",
    "prId": "pr-jad-0007",
    "date": "2025-03-28",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000007000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0007-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1PnXlSyCjN8c9FJEv7dj13xnLIaLFlinv=w1200"
  },
  {
    "id": "dc-jad-0008",
    "dcNumber": "DC-0008",
    "invoiceNumber": "DC-0008",
    "prNumber": "PR-JAD-0008",
    "prId": "pr-jad-0008",
    "date": "2025-03-28",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000008000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0008-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uWTYpA3NDOsrs5vd_72KxkU-kePWOZkb=w1200"
  },
  {
    "id": "dc-jad-0009",
    "dcNumber": "DC-0009",
    "invoiceNumber": "DC-0009",
    "prNumber": "PR-JAD-0009",
    "prId": "pr-jad-0009",
    "date": "2025-03-29",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000009000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0009-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Jx6f6tHBMQ9K_OiCVt9d6WQO1aIdiT4K=w1200"
  },
  {
    "id": "dc-jad-0010",
    "dcNumber": "DC-0010",
    "invoiceNumber": "DC-0010",
    "prNumber": "PR-JAD-0010",
    "prId": "pr-jad-0010",
    "date": "2025-03-29",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000010000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0010-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hslACx8UiB5ijCgGMGxji3P_lf3MXmy7=w1200"
  },
  {
    "id": "dc-jad-0011",
    "dcNumber": "DC-0011",
    "invoiceNumber": "DC-0011",
    "prNumber": "PR-JAD-0011",
    "prId": "pr-jad-0011",
    "date": "2025-03-29",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000011000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0011-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site"
  },
  {
    "id": "dc-jad-0012",
    "dcNumber": "DC-0012",
    "invoiceNumber": "DC-0012",
    "prNumber": "PR-JAD-0012",
    "prId": "pr-jad-0012",
    "date": "2025-03-29",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000012000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0012-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FQuu3EujlxhjGWJmFrkOHvH16ZF6vlPM=w1200"
  },
  {
    "id": "dc-jad-0013",
    "dcNumber": "DC-0013",
    "invoiceNumber": "DC-0013",
    "prNumber": "PR-JAD-0013",
    "prId": "pr-jad-0013",
    "date": "2025-03-29",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000013000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0013-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CAzdFkgk0b94xRBTrMGtLFpQqNlczkuw=w1200"
  },
  {
    "id": "dc-jad-0014",
    "dcNumber": "DC-0014",
    "invoiceNumber": "DC-0014",
    "prNumber": "PR-JAD-0014",
    "prId": "pr-jad-0014",
    "date": "2025-03-29",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000014000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0014-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1PhNWT0O-qCBtt7omCptxHpmctkqnvnq-=w1200"
  },
  {
    "id": "dc-jad-0015",
    "dcNumber": "DC-0015",
    "invoiceNumber": "DC-0015",
    "prNumber": "PR-JAD-0015",
    "prId": "pr-jad-0015",
    "date": "2025-07-04",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000015000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0015-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NBNr0cS2NeuEGjsGU11_01hkxKwVFlkJ=w1200"
  },
  {
    "id": "dc-jad-0016",
    "dcNumber": "DC-0016",
    "invoiceNumber": "DC-0016",
    "prNumber": "PR-JAD-0016",
    "prId": "pr-jad-0016",
    "date": "2025-08-04",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000016000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0016-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1l8GrMPndJ6Ed8R4pXBtXKdCVyoNSj8vv=w1200"
  },
  {
    "id": "dc-jad-0017",
    "dcNumber": "DC-0017",
    "invoiceNumber": "DC-0017",
    "prNumber": "PR-JAD-0017",
    "prId": "pr-jad-0017",
    "date": "2025-12-04",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000017000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0017-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hHfAzTJF78xavO46dRvZ4kwllKl7jkkY=w1200"
  },
  {
    "id": "dc-jad-0018",
    "dcNumber": "DC-0018 (Missing)",
    "invoiceNumber": "DC-0018 (Missing)",
    "prNumber": "PR-JAD-0018",
    "prId": "pr-jad-0018",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000018000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0018-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0019",
    "dcNumber": "DC-0019",
    "invoiceNumber": "DC-0019",
    "prNumber": "PR-JAD-0019",
    "prId": "pr-jad-0019",
    "date": "2025-04-14",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000019000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0019-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1e-1Ipk2PjHSnDoysYVW4s-OGYPd1EpGo=w1200"
  },
  {
    "id": "dc-jad-0020",
    "dcNumber": "DC-0020 (Missing)",
    "invoiceNumber": "DC-0020 (Missing)",
    "prNumber": "PR-JAD-0020",
    "prId": "pr-jad-0020",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000020000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0020-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0021",
    "dcNumber": "DC-0021",
    "invoiceNumber": "DC-0021",
    "prNumber": "PR-JAD-0021",
    "prId": "pr-jad-0021",
    "date": "2025-04-14",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000021000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0021-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xUGZT9Nc3_U_47Df2bESkErxIQ01taZp=w1200"
  },
  {
    "id": "dc-jad-0022",
    "dcNumber": "DC-0022",
    "invoiceNumber": "DC-0022",
    "prNumber": "PR-JAD-0022",
    "prId": "pr-jad-0022",
    "date": "2025-04-14",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000022000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0022-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site"
  },
  {
    "id": "dc-jad-0023",
    "dcNumber": "DC-0023",
    "invoiceNumber": "DC-0023",
    "prNumber": "PR-JAD-0023",
    "prId": "pr-jad-0023",
    "date": "2025-04-14",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000023000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0023-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site"
  },
  {
    "id": "dc-jad-0024",
    "dcNumber": "DC-0024",
    "invoiceNumber": "DC-0024",
    "prNumber": "PR-JAD-0024",
    "prId": "pr-jad-0024",
    "date": "2025-04-17",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000024000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0024-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ds2omZrxrQxvFJvPL5TTgKxuw2yrd8gq=w1200"
  },
  {
    "id": "dc-jad-0025",
    "dcNumber": "DC-0025",
    "invoiceNumber": "DC-0025",
    "prNumber": "PR-JAD-0025",
    "prId": "pr-jad-0025",
    "date": "2025-04-17",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000025000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0025-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1KdGD2n-0OA1YY0Fj5zKm-wukDzfXvrN7=w1200"
  },
  {
    "id": "dc-jad-0026",
    "dcNumber": "DC-0026",
    "invoiceNumber": "DC-0026",
    "prNumber": "PR-JAD-0026",
    "prId": "pr-jad-0026",
    "date": "2025-04-21",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000026000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0026-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1vhCL-ZlWGSeculo2IvAP5m9_Fq_eaoHP=w1200"
  },
  {
    "id": "dc-jad-0027",
    "dcNumber": "DC-0027",
    "invoiceNumber": "DC-0027",
    "prNumber": "PR-JAD-0027",
    "prId": "pr-jad-0027",
    "date": "2025-04-21",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000027000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0027-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hDhHEU0t6ZHPA2pklXO0xwoeJMqm_Knk=w1200"
  },
  {
    "id": "dc-jad-0028",
    "dcNumber": "DC-0028",
    "invoiceNumber": "DC-0028",
    "prNumber": "PR-JAD-0028",
    "prId": "pr-jad-0028",
    "date": "2025-04-21",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000028000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0028-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_0wE7VbDHXL85YpAy0k4ZrUjv4ouZRn4=w1200"
  },
  {
    "id": "dc-jad-0029",
    "dcNumber": "DC-0029",
    "invoiceNumber": "DC-0029",
    "prNumber": "PR-JAD-0029",
    "prId": "pr-jad-0029",
    "date": "2025-04-23",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000029000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0029-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/168exzVRR9HtFHGtZJaQ3I4VGkMRzNyrd=w1200"
  },
  {
    "id": "dc-jad-0030",
    "dcNumber": "DC-0030",
    "invoiceNumber": "DC-0030",
    "prNumber": "PR-JAD-0030",
    "prId": "pr-jad-0030",
    "date": "2025-04-28",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000030000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0030-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/12d7aLE8SMlvvStPF1jpIL5xYSzmt1pDg=w1200"
  },
  {
    "id": "dc-jad-0031",
    "dcNumber": "DC-0031",
    "invoiceNumber": "DC-0031",
    "prNumber": "PR-JAD-0031",
    "prId": "pr-jad-0031",
    "date": "2025-04-29",
    "siteName": "J.T.C. Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000031000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0031-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C. Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NwzIK2RS63NE_5RMHl2Q4S9AjQceExyN=w1200"
  },
  {
    "id": "dc-jad-0032",
    "dcNumber": "DC-0032",
    "invoiceNumber": "DC-0032",
    "prNumber": "PR-JAD-0032",
    "prId": "pr-jad-0032",
    "date": "2025-03-05",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000032000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0032-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iocjELowAAL9hEqiIcH0bqfB_25a8CuK=w1200"
  },
  {
    "id": "dc-jad-0033",
    "dcNumber": "DC-0033",
    "invoiceNumber": "DC-0033",
    "prNumber": "PR-JAD-0033",
    "prId": "pr-jad-0033",
    "date": "2025-02-05",
    "siteName": "Infinaty Store Saidpur Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000033000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0033-1",
        "itemName": "Electrical Supplies & Consumables (Infinaty Store Saidpur Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1c_upvVGVdykbOghlsP9tXuABZA2wrZ4N=w1200"
  },
  {
    "id": "dc-jad-0034",
    "dcNumber": "DC-0034",
    "invoiceNumber": "DC-0034",
    "prNumber": "PR-JAD-0034",
    "prId": "pr-jad-0034",
    "date": "2025-03-05",
    "siteName": "House-10 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000034000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0034-1",
        "itemName": "Electrical Supplies & Consumables (House-10 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hpWdnAcQvnacwRFJ-KvWelssf91nlelV=w1200"
  },
  {
    "id": "dc-jad-0035",
    "dcNumber": "DC-0035",
    "invoiceNumber": "DC-0035",
    "prNumber": "PR-JAD-0035",
    "prId": "pr-jad-0035",
    "date": "2025-07-05",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000035000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0035-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Gz1jro_oxALFQu8IDH8rlkHcJB485ZbZ=w1200"
  },
  {
    "id": "dc-jad-0036",
    "dcNumber": "DC-0036",
    "invoiceNumber": "DC-0036",
    "prNumber": "PR-JAD-0036",
    "prId": "pr-jad-0036",
    "date": "2025-07-05",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000036000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0036-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ABSSF71EgDLApB2VrVHqGNJEn3ZYO0r5=w1200"
  },
  {
    "id": "dc-jad-0037",
    "dcNumber": "DC-0037",
    "invoiceNumber": "DC-0037",
    "prNumber": "PR-JAD-0037",
    "prId": "pr-jad-0037",
    "date": "2025-07-05",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000037000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0037-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jNyxGRCP2iHhz5E5dQVPKRt_Wz5FjP3v=w1200"
  },
  {
    "id": "dc-jad-0038",
    "dcNumber": "DC-0038",
    "invoiceNumber": "DC-0038",
    "prNumber": "PR-JAD-0038",
    "prId": "pr-jad-0038",
    "date": "2025-07-05",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000038000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0038-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1qK-OyD5KDzl4tmUYIITBCShtwDZpE-ox=w1200"
  },
  {
    "id": "dc-jad-0039",
    "dcNumber": "DC-0039",
    "invoiceNumber": "DC-0039",
    "prNumber": "PR-JAD-0039",
    "prId": "pr-jad-0039",
    "date": "2025-07-05",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000039000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0039-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15pcM9CT_Qcai0TUeC4PfEgMYCwUreVAK=w1200"
  },
  {
    "id": "dc-jad-0040",
    "dcNumber": "DC-0040",
    "invoiceNumber": "DC-0040",
    "prNumber": "PR-JAD-0040",
    "prId": "pr-jad-0040",
    "date": "2025-07-05",
    "siteName": "Warehouse Rawalpindi For P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000040000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0040-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi For P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/10fIiYhDdAIrbkYPpZS2AJdDwDsZgDc_T=w1200"
  },
  {
    "id": "dc-jad-0041",
    "dcNumber": "DC-0041",
    "invoiceNumber": "DC-0041",
    "prNumber": "PR-JAD-0041",
    "prId": "pr-jad-0041",
    "date": "2025-07-05",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000041000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0041-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1BzsPO4Je2QeQ4r3UH76OheWV3A6I0RLp=w1200"
  },
  {
    "id": "dc-jad-0042",
    "dcNumber": "DC-0042",
    "invoiceNumber": "DC-0042",
    "prNumber": "PR-JAD-0042",
    "prId": "pr-jad-0042",
    "date": "2025-07-05",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000042000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0042-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1d65wafMnTOH-RIN9vNBkV30oQw-bV8n4=w1200"
  },
  {
    "id": "dc-jad-0043",
    "dcNumber": "DC-0043",
    "invoiceNumber": "DC-0043",
    "prNumber": "PR-JAD-0043",
    "prId": "pr-jad-0043",
    "date": "2025-07-05",
    "siteName": "House # 3, St. #25, F-7/2 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000043000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0043-1",
        "itemName": "Electrical Supplies & Consumables (House # 3, St. #25, F-7/2 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11_kgSynsuolPi46Iz92MwfAo3DclMNgY=w1200"
  },
  {
    "id": "dc-jad-0044",
    "dcNumber": "DC-0044",
    "invoiceNumber": "DC-0044",
    "prNumber": "PR-JAD-0044",
    "prId": "pr-jad-0044",
    "date": "2025-10-05",
    "siteName": "Poultary Farm P.D. Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000044000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0044-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm P.D. Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8988)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8988",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Poultary",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1Z6O8khSIsv-gpvQVm3p2P9COjCQKzyn8=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1L8cmhBjuQ89AtuIxV6QKZaf9orPksWTu=w1200"
  },
  {
    "id": "dc-jad-0045",
    "dcNumber": "DC-0045",
    "invoiceNumber": "DC-0045",
    "prNumber": "PR-JAD-0045",
    "prId": "pr-jad-0045",
    "date": "2025-10-05",
    "siteName": "House # 3, F-7/2 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000045000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0045-1",
        "itemName": "Electrical Supplies & Consumables (House # 3, F-7/2 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-jGQw57xIA90H6ZIJU9vcjWVPDXKJCre=w1200"
  },
  {
    "id": "dc-jad-0046",
    "dcNumber": "DC-0046",
    "invoiceNumber": "DC-0046",
    "prNumber": "PR-JAD-0046",
    "prId": "pr-jad-0046",
    "date": "2025-05-14",
    "siteName": "Poultary Farm P.D. Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000046000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0046-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm P.D. Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #205)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "205",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Poultary",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1ue6wzdOovxuzsidp6ozeZq-To7eJwRou=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/12VCUkh-6WBgnHXcYdYJchzK7sMyWp9Ni=w1200"
  },
  {
    "id": "dc-jad-0047",
    "dcNumber": "DC-0047",
    "invoiceNumber": "DC-0047",
    "prNumber": "PR-JAD-0047",
    "prId": "pr-jad-0047",
    "date": "2025-05-14",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000047000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0047-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #2519)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "2519",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Chicks",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1g2WNj7ZDvWBJLD7FVy0JKqlGbP0FMkHi=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1iHjfb3i7VIjOCnThF8MZu-BnIVPEWWZV=w1200"
  },
  {
    "id": "dc-jad-0048",
    "dcNumber": "DC-0048",
    "invoiceNumber": "DC-0048",
    "prNumber": "PR-JAD-0048",
    "prId": "pr-jad-0048",
    "date": "2025-05-15",
    "siteName": "Poultary Farm P.D. Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000048000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0048-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm P.D. Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Cb0kGCxQ2N3eRd-UbtHneufl6KRcNTrq=w1200"
  },
  {
    "id": "dc-jad-0049",
    "dcNumber": "DC-0049",
    "invoiceNumber": "DC-0049",
    "prNumber": "PR-JAD-0049",
    "prId": "pr-jad-0049",
    "date": "2025-05-19",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000049000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0049-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #1485)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "1485",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1yfxIvHKXeVIRi8Oz42_kJjnGwySxOCUV=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1WufpmYmIf310EH2ClJhrIsjI8G-zTaWc=w1200"
  },
  {
    "id": "dc-jad-0050",
    "dcNumber": "DC-0050",
    "invoiceNumber": "DC-0050",
    "prNumber": "PR-JAD-0050",
    "prId": "pr-jad-0050",
    "date": "2025-05-19",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000050000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0050-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8986)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8986",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/16IaIwpe0vGc_dnlzn7VUXhdLD8LCMhGu=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1x1Lub18hUHUT3ejv8ygIzJA_euXMb7hu=w1200"
  },
  {
    "id": "dc-jad-0051",
    "dcNumber": "DC-0051",
    "invoiceNumber": "DC-0051",
    "prNumber": "PR-JAD-0051",
    "prId": "pr-jad-0051",
    "date": "2025-05-19",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000051000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0051-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Zt65uo6U0tigMTArsfVUBFnC_h2JDLga=w1200"
  },
  {
    "id": "dc-jad-0052",
    "dcNumber": "DC-0052",
    "invoiceNumber": "DC-0052",
    "prNumber": "PR-JAD-0052",
    "prId": "pr-jad-0052",
    "date": "2025-02-06",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000052000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0052-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jJ0YNgfTh9bZ0LDLFAQnsjD2gv1TBBMN=w1200"
  },
  {
    "id": "dc-jad-0053",
    "dcNumber": "DC 0053",
    "invoiceNumber": "DC 0053",
    "prNumber": "PR-JAD-0053",
    "prId": "pr-jad-0053",
    "date": "2025-05-30",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000053000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0053-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1charJoLxmfYgtDnNuZkHK_12zasi-0uo=w1200"
  },
  {
    "id": "dc-jad-0054",
    "dcNumber": "DC 0054",
    "invoiceNumber": "DC 0054",
    "prNumber": "PR-JAD-0054",
    "prId": "pr-jad-0054",
    "date": "2025-05-31",
    "siteName": "Poultary Farm P.D. Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000054000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0054-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm P.D. Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1eiTODEM05jABovJng9Y5ZcoQXiXSKzSW=w1200"
  },
  {
    "id": "dc-jad-0055",
    "dcNumber": "DC 0055",
    "invoiceNumber": "DC 0055",
    "prNumber": "PR-JAD-0055",
    "prId": "pr-jad-0055",
    "date": "2025-06-20",
    "siteName": "Poultary Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000055000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0055-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-BpMjpYqdlsuqkBf6Cg88_JdGMQ4f_UT=w1200"
  },
  {
    "id": "dc-jad-0056",
    "dcNumber": "DC 0056",
    "invoiceNumber": "DC 0056",
    "prNumber": "PR-JAD-0056",
    "prId": "pr-jad-0056",
    "date": "2025-06-23",
    "siteName": "Poultary Farm P.D. Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000056000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0056-1",
        "itemName": "Electrical Supplies & Consumables (Poultary Farm P.D. Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bL7kyTUcctCCo8q2sZv-dW5LN1Q3TOr2=w1200"
  },
  {
    "id": "dc-jad-0057",
    "dcNumber": "DC 0057",
    "invoiceNumber": "DC 0057",
    "prNumber": "PR-JAD-0057",
    "prId": "pr-jad-0057",
    "date": "2025-06-30",
    "siteName": "Masjid Chak 17-Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000057000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0057-1",
        "itemName": "Electrical Supplies & Consumables (Masjid Chak 17-Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Aj0cVkoz8ROdwL_gt3_Y9VzgfTxfMyVH=w1200"
  },
  {
    "id": "dc-jad-0058",
    "dcNumber": "DC 0058",
    "invoiceNumber": "DC 0058",
    "prNumber": "PR-JAD-0058",
    "prId": "pr-jad-0058",
    "date": "2025-04-07",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000058000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0058-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/10f0c5Bg-YwMGgX9IoOZlUFgUqKmeGib6=w1200"
  },
  {
    "id": "dc-jad-0059",
    "dcNumber": "DC 0059",
    "invoiceNumber": "DC 0059",
    "prNumber": "PR-JAD-0059",
    "prId": "pr-jad-0059",
    "date": "2025-04-07",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000059000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0059-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16xGitsGkG79_tkB4inZgAAAB1-dQYaNt=w1200"
  },
  {
    "id": "dc-jad-0060",
    "dcNumber": "DC 0060",
    "invoiceNumber": "DC 0060",
    "prNumber": "PR-JAD-0060",
    "prId": "pr-jad-0060",
    "date": "2025-04-07",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000060000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0060-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1VXvD3CKNztlpxfrxF6LKGxFG7Fi5lb77=w1200"
  },
  {
    "id": "dc-jad-0061",
    "dcNumber": "DC 0061",
    "invoiceNumber": "DC 0061",
    "prNumber": "PR-JAD-0061",
    "prId": "pr-jad-0061",
    "date": "2025-08-07",
    "siteName": "Masjid Chak 17-Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000061000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0061-1",
        "itemName": "Electrical Supplies & Consumables (Masjid Chak 17-Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mXYov_gwkMsOBJ72bz3kDOgbvxmT8_Yn=w1200"
  },
  {
    "id": "dc-jad-0062",
    "dcNumber": "DC 0062",
    "invoiceNumber": "DC 0062",
    "prNumber": "PR-JAD-0062",
    "prId": "pr-jad-0062",
    "date": "2025-04-07",
    "siteName": "JTC Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000062000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0062-1",
        "itemName": "Electrical Supplies & Consumables (JTC Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1KW8ekdsJnw-GgG0EJiiVKIHV2bgboDJ1=w1200"
  },
  {
    "id": "dc-jad-0063",
    "dcNumber": "DC 0063",
    "invoiceNumber": "DC 0063",
    "prNumber": "PR-JAD-0063",
    "prId": "pr-jad-0063",
    "date": "2025-10-07",
    "siteName": "Sohaib SB House ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000063000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0063-1",
        "itemName": "Electrical Supplies & Consumables (Sohaib SB House ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-yGI_8SV4cSVxhtRxo9gKYo1wClQljPP=w1200"
  },
  {
    "id": "dc-jad-0064",
    "dcNumber": "DC 0064",
    "invoiceNumber": "DC 0064",
    "prNumber": "PR-JAD-0064",
    "prId": "pr-jad-0064",
    "date": "2025-11-07",
    "siteName": "Farm House Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000064000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0064-1",
        "itemName": "Electrical Supplies & Consumables (Farm House Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1gvx8bFD57COUOuXDMCBoVe8sPm400IOF=w1200"
  },
  {
    "id": "dc-jad-0065",
    "dcNumber": "DC 0065",
    "invoiceNumber": "DC 0065",
    "prNumber": "PR-JAD-0065",
    "prId": "pr-jad-0065",
    "date": "2025-11-07",
    "siteName": "Farm House Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000065000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0065-1",
        "itemName": "Electrical Supplies & Consumables (Farm House Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1W1_fcgBXKZ3exKmpcJRhqw7HGflGilWt=w1200"
  },
  {
    "id": "dc-jad-0066",
    "dcNumber": "DC 0066",
    "invoiceNumber": "DC 0066",
    "prNumber": "PR-JAD-0066",
    "prId": "pr-jad-0066",
    "date": "2025-12-07",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000066000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0066-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1lGXk4y8AcyeZQqNfdmR9mMDBg1hFX-7-=w1200"
  },
  {
    "id": "dc-jad-0067",
    "dcNumber": "DC 0067",
    "invoiceNumber": "DC 0067",
    "prNumber": "PR-JAD-0067",
    "prId": "pr-jad-0067",
    "date": "2025-07-15",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000067000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0067-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-fYkFx9RLKRuokrnbjMR1AF8-v6KSOVN=w1200"
  },
  {
    "id": "dc-jad-0068",
    "dcNumber": "DC 0068",
    "invoiceNumber": "DC 0068",
    "prNumber": "PR-JAD-0068",
    "prId": "pr-jad-0068",
    "date": "2025-07-15",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000068000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0068-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1rQpagUsJKr3mhoOPqTQAfy4YmNOYj2mG=w1200"
  },
  {
    "id": "dc-jad-0069",
    "dcNumber": "DC 0069",
    "invoiceNumber": "DC 0069",
    "prNumber": "PR-JAD-0069",
    "prId": "pr-jad-0069",
    "date": "2025-07-17",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000069000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0069-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WcPmSKaQbmuLSpHqx-q0QDHP1J8OotML=w1200"
  },
  {
    "id": "dc-jad-0070",
    "dcNumber": "DC 0070",
    "invoiceNumber": "DC 0070",
    "prNumber": "PR-JAD-0070",
    "prId": "pr-jad-0070",
    "date": "2025-07-19",
    "siteName": "House 8 F-6/3 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000070000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0070-1",
        "itemName": "Electrical Supplies & Consumables (House 8 F-6/3 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1LCodaZOceImxK0NaroKUZnrydUXzEM26=w1200"
  },
  {
    "id": "dc-jad-0071",
    "dcNumber": "DC 0071",
    "invoiceNumber": "DC 0071",
    "prNumber": "PR-JAD-0071",
    "prId": "pr-jad-0071",
    "date": "2025-07-22",
    "siteName": "House 8 F-6/3 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000071000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0071-1",
        "itemName": "Electrical Supplies & Consumables (House 8 F-6/3 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1MZeI4_-5c5TUU2vidvwdGzDmE2o-KpWD=w1200"
  },
  {
    "id": "dc-jad-0072",
    "dcNumber": "DC 0072",
    "invoiceNumber": "DC 0072",
    "prNumber": "PR-JAD-0072",
    "prId": "pr-jad-0072",
    "date": "2025-07-23",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000072000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0072-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1nwALd5Dm1lg4Gh2UxHznO4hHiy65Ycyf=w1200"
  },
  {
    "id": "dc-jad-0073",
    "dcNumber": "DC 0073",
    "invoiceNumber": "DC 0073",
    "prNumber": "PR-JAD-0073",
    "prId": "pr-jad-0073",
    "date": "2025-07-23",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000073000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0073-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1U0K8d8lKxPPcDOmmQmFeaVGtJ_OL8zJ-=w1200"
  },
  {
    "id": "dc-jad-0074",
    "dcNumber": "DC 0074",
    "invoiceNumber": "DC 0074",
    "prNumber": "PR-JAD-0074",
    "prId": "pr-jad-0074",
    "date": "2025-07-23",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000074000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0074-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Bg2Q54a6Sm1Ok_gFmrvBPkEgeYXm9zH5=w1200"
  },
  {
    "id": "dc-jad-0075",
    "dcNumber": "DC 0075",
    "invoiceNumber": "DC 0075",
    "prNumber": "PR-JAD-0075",
    "prId": "pr-jad-0075",
    "date": "2025-07-24",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000075000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0075-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1By8PysesHaXqPqqG-nyHb2_Xu4WnHxP4=w1200"
  },
  {
    "id": "dc-jad-0076",
    "dcNumber": "DC 0076",
    "invoiceNumber": "DC 0076",
    "prNumber": "PR-JAD-0076",
    "prId": "pr-jad-0076",
    "date": "2025-07-25",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000076000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0076-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1tdTnFgU3Pjx8klFR6ExoYFtbIqNH3hZp=w1200"
  },
  {
    "id": "dc-jad-0077",
    "dcNumber": "DC 0077",
    "invoiceNumber": "DC 0077",
    "prNumber": "PR-JAD-0077",
    "prId": "pr-jad-0077",
    "date": "2025-07-25",
    "siteName": "Sheikhupura Hachery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000077000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0077-1",
        "itemName": "Electrical Supplies & Consumables (Sheikhupura Hachery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1KAQR4FASIRLMOi8n2kZ4QZh2F3C0RPo8=w1200"
  },
  {
    "id": "dc-jad-0078",
    "dcNumber": "DC 0078",
    "invoiceNumber": "DC 0078",
    "prNumber": "PR-JAD-0078",
    "prId": "pr-jad-0078",
    "date": "2025-07-25",
    "siteName": "Sheikhupura Hachery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000078000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0078-1",
        "itemName": "Electrical Supplies & Consumables (Sheikhupura Hachery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bq1MGovM4mBTnsy5H1U_sd0Irv2nu7Ko=w1200"
  },
  {
    "id": "dc-jad-0079",
    "dcNumber": "DC 0079",
    "invoiceNumber": "DC 0079",
    "prNumber": "PR-JAD-0079",
    "prId": "pr-jad-0079",
    "date": "2025-07-26",
    "siteName": "Sheikhupura Hachery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000079000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0079-1",
        "itemName": "Electrical Supplies & Consumables (Sheikhupura Hachery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Q_3zT472-gnYKMbvalm136hX3CJRfn4W=w1200"
  },
  {
    "id": "dc-jad-0080",
    "dcNumber": "DC 0080",
    "invoiceNumber": "DC 0080",
    "prNumber": "PR-JAD-0080",
    "prId": "pr-jad-0080",
    "date": "2025-07-26",
    "siteName": "Sheikhupura Hachery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000080000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0080-1",
        "itemName": "Electrical Supplies & Consumables (Sheikhupura Hachery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/12LWiD663IPtrFu0qUJSIdCRvfWYLb68A=w1200"
  },
  {
    "id": "dc-jad-0081",
    "dcNumber": "DC 0081",
    "invoiceNumber": "DC 0081",
    "prNumber": "PR-JAD-0081",
    "prId": "pr-jad-0081",
    "date": "2025-07-30",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000081000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0081-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Z-yuwJUOUU7a33GXn__QfrrIeHz_5Pb4=w1200"
  },
  {
    "id": "dc-jad-0082",
    "dcNumber": "DC 0082",
    "invoiceNumber": "DC 0082",
    "prNumber": "PR-JAD-0082",
    "prId": "pr-jad-0082",
    "date": "2025-06-08",
    "siteName": "House 8 F-6/3 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000082000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0082-1",
        "itemName": "Electrical Supplies & Consumables (House 8 F-6/3 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1tz5FD8fCYl7UD6F91WJIhyFyWJi7FmD6=w1200"
  },
  {
    "id": "dc-jad-0083",
    "dcNumber": "DC 0083",
    "invoiceNumber": "DC 0083",
    "prNumber": "PR-JAD-0083",
    "prId": "pr-jad-0083",
    "date": "2025-06-08",
    "siteName": "House 8 F-6/3 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000083000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0083-1",
        "itemName": "Electrical Supplies & Consumables (House 8 F-6/3 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11B9FyzPTsq5bBVgDP_WIspssLhBqZPuF=w1200"
  },
  {
    "id": "dc-jad-0084",
    "dcNumber": "DC 0084",
    "invoiceNumber": "DC 0084",
    "prNumber": "PR-JAD-0084",
    "prId": "pr-jad-0084",
    "date": "2025-08-08",
    "siteName": "House 10 F-6 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000084000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0084-1",
        "itemName": "Electrical Supplies & Consumables (House 10 F-6 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16_lCCkSRnxmIOMaE4PRRZnKittP7qaT5=w1200"
  },
  {
    "id": "dc-jad-0085",
    "dcNumber": "DC 0085",
    "invoiceNumber": "DC 0085",
    "prNumber": "PR-JAD-0085",
    "prId": "pr-jad-0085",
    "date": "2025-09-08",
    "siteName": "Masjid Chak 17-Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000085000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0085-1",
        "itemName": "Electrical Supplies & Consumables (Masjid Chak 17-Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1VKKfpQQyEm5mBT4dyDxbawiXYQEJZk17=w1200"
  },
  {
    "id": "dc-jad-0086",
    "dcNumber": "DC 0086",
    "invoiceNumber": "DC 0086",
    "prNumber": "PR-JAD-0086",
    "prId": "pr-jad-0086",
    "date": "2025-09-08",
    "siteName": "Farm House Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000086000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0086-1",
        "itemName": "Electrical Supplies & Consumables (Farm House Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1t83kjBghsje58UReQG42LBd_1vb5w_JW=w1200"
  },
  {
    "id": "dc-jad-0087",
    "dcNumber": "DC 0087",
    "invoiceNumber": "DC 0087",
    "prNumber": "PR-JAD-0087",
    "prId": "pr-jad-0087",
    "date": "2025-12-07",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000087000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0087-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/10xhn1dXGIKjf6DX1P-jl6tuLbHS4XW2w=w1200"
  },
  {
    "id": "dc-jad-0088",
    "dcNumber": "DC 0088",
    "invoiceNumber": "DC 0088",
    "prNumber": "PR-JAD-0088",
    "prId": "pr-jad-0088",
    "date": "2025-11-08",
    "siteName": "House 10 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000088000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0088-1",
        "itemName": "Electrical Supplies & Consumables (House 10 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CBZc19VEcx1QAOVHp3e3TEfU-ebmEeo_=w1200"
  },
  {
    "id": "dc-jad-0089",
    "dcNumber": "DC 0089",
    "invoiceNumber": "DC 0089",
    "prNumber": "PR-JAD-0089",
    "prId": "pr-jad-0089",
    "date": "2025-12-08",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000089000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0089-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/107ucKBpbIejTI9AhWgF0w7nOGwEPucA1=w1200"
  },
  {
    "id": "dc-jad-0090",
    "dcNumber": "DC 0090",
    "invoiceNumber": "DC 0090",
    "prNumber": "PR-JAD-0090",
    "prId": "pr-jad-0090",
    "date": "2025-12-08",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000090000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0090-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15LfNdblMPthCYyqozWViSQ8gV5m9f2_s=w1200"
  },
  {
    "id": "dc-jad-0091",
    "dcNumber": "DC 0091",
    "invoiceNumber": "DC 0091",
    "prNumber": "PR-JAD-0091",
    "prId": "pr-jad-0091",
    "date": "2025-08-13",
    "siteName": "House 8 F-6/3 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000091000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0091-1",
        "itemName": "Electrical Supplies & Consumables (House 8 F-6/3 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RQbZO8orOtlJFO0MYZUL8VOrywnFpNjY=w1200"
  },
  {
    "id": "dc-jad-0092",
    "dcNumber": "DC 0092",
    "invoiceNumber": "DC 0092",
    "prNumber": "PR-JAD-0092",
    "prId": "pr-jad-0092",
    "date": "2025-08-15",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000092000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0092-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Z0278MlMwHg6swBhVmOdtGu7ZHYw9LuS=w1200"
  },
  {
    "id": "dc-jad-0093",
    "dcNumber": "DC 0093",
    "invoiceNumber": "DC 0093",
    "prNumber": "PR-JAD-0093",
    "prId": "pr-jad-0093",
    "date": "2025-08-16",
    "siteName": "Jadeed Feed Mil Shahcoat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000093000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0093-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Feed Mil Shahcoat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #2640)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "2640",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Jadeed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/19Skzes_zX-mkoWKbimDwtdaVlM0qdoCt=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1njP41zBG3isgXEfZVLi1E2jB0qLUIEDy=w1200"
  },
  {
    "id": "dc-jad-0094",
    "dcNumber": "DC 0094",
    "invoiceNumber": "DC 0094",
    "prNumber": "PR-JAD-0094",
    "prId": "pr-jad-0094",
    "date": "2025-08-19",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000094000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0094-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/132dC6rc_sECLW4EpEFZd_HJMonsxEpRq=w1200"
  },
  {
    "id": "dc-jad-0095",
    "dcNumber": "DC 0095",
    "invoiceNumber": "DC 0095",
    "prNumber": "PR-JAD-0095",
    "prId": "pr-jad-0095",
    "date": "2025-08-19",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000095000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0095-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1K4c-4rKKSqZ0xLGHJIXlRP4SxjtovZpT=w1200"
  },
  {
    "id": "dc-jad-0096",
    "dcNumber": "DC 0096",
    "invoiceNumber": "DC 0096",
    "prNumber": "PR-JAD-0096",
    "prId": "pr-jad-0096",
    "date": "2025-08-24",
    "siteName": "Jadeed Group",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000096000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0096-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site"
  },
  {
    "id": "dc-jad-0097",
    "dcNumber": "DC 0097",
    "invoiceNumber": "DC 0097",
    "prNumber": "PR-JAD-0097",
    "prId": "pr-jad-0097",
    "date": "2025-08-20",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000097000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0097-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1S3HwmUgu9Vu9y2yIbDthCE9M8JltlECb=w1200"
  },
  {
    "id": "dc-jad-0098",
    "dcNumber": "DC 0098",
    "invoiceNumber": "DC 0098",
    "prNumber": "PR-JAD-0098",
    "prId": "pr-jad-0098",
    "date": "2025-08-21",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000098000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0098-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1pCpkMLpxVxq1HcTz136i5syx4Uoex3ZD=w1200"
  },
  {
    "id": "dc-jad-0099",
    "dcNumber": "DC 0099",
    "invoiceNumber": "DC 0099",
    "prNumber": "PR-JAD-0099",
    "prId": "pr-jad-0099",
    "date": "2025-08-21",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000099000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0099-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1OfGQJbplqLBcd53Q-KmwJjB2jfKE3cRj=w1200"
  },
  {
    "id": "dc-jad-0100",
    "dcNumber": "DC 0100",
    "invoiceNumber": "DC 0100",
    "prNumber": "PR-JAD-0100",
    "prId": "pr-jad-0100",
    "date": "2025-08-21",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000100000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0100-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1fw3VMf4G3Pzt_tq21dpPvcZkl30GuP3V=w1200"
  },
  {
    "id": "dc-jad-0101",
    "dcNumber": "DC 101",
    "invoiceNumber": "DC 101",
    "prNumber": "PR-JAD-0101",
    "prId": "pr-jad-0101",
    "date": "2025-08-23",
    "siteName": "P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000101000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0101-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WFt1aRJq25Tcemc6O3UZZNzAEIbsqnpg=w1200"
  },
  {
    "id": "dc-jad-0102",
    "dcNumber": "DC 102",
    "invoiceNumber": "DC 102",
    "prNumber": "PR-JAD-0102",
    "prId": "pr-jad-0102",
    "date": "2025-08-23",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000102000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0102-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EhGuECE09t7bFMEQjRDyZfUfs4TKWSp5=w1200"
  },
  {
    "id": "dc-jad-0103",
    "dcNumber": "DC 103",
    "invoiceNumber": "DC 103",
    "prNumber": "PR-JAD-0103",
    "prId": "pr-jad-0103",
    "date": "2025-08-25",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000103000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0103-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3922)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3922",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1Wdds_iGBO-5OloU7f4tjSuaRwfnOEmNy=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1tGuMrE53U3vjzAsR_fCxnleCb6G2EmiH=w1200"
  },
  {
    "id": "dc-jad-0104",
    "dcNumber": "DC 104",
    "invoiceNumber": "DC 104",
    "prNumber": "PR-JAD-0104",
    "prId": "pr-jad-0104",
    "date": "2025-08-25",
    "siteName": "Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000104000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0104-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18BU1cWDYDm1qb1pzcZFoALueeb3QEAm8=w1200"
  },
  {
    "id": "dc-jad-0105",
    "dcNumber": "DC 105",
    "invoiceNumber": "DC 105",
    "prNumber": "PR-JAD-0105",
    "prId": "pr-jad-0105",
    "date": "2025-08-26",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000105000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0105-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-sQKsaCW0LRXixG2ZixQ9JU9hKV8eoEt=w1200"
  },
  {
    "id": "dc-jad-0106",
    "dcNumber": "DC 106",
    "invoiceNumber": "DC 106",
    "prNumber": "PR-JAD-0106",
    "prId": "pr-jad-0106",
    "date": "2025-08-27",
    "siteName": "House 28, F-6/3, Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000106000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0106-1",
        "itemName": "Electrical Supplies & Consumables (House 28, F-6/3, Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1kxENzp3uij8WuXd1hUjsl7haAI7br0WR=w1200"
  },
  {
    "id": "dc-jad-0107",
    "dcNumber": "DC 107",
    "invoiceNumber": "DC 107",
    "prNumber": "PR-JAD-0107",
    "prId": "pr-jad-0107",
    "date": "2025-08-28",
    "siteName": "J.T.C. Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000107000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0107-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C. Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1x5tKfmXUwQfkFzr9CNxkTdMYpbi4KQDE=w1200"
  },
  {
    "id": "dc-jad-0108",
    "dcNumber": "DC 108",
    "invoiceNumber": "DC 108",
    "prNumber": "PR-JAD-0108",
    "prId": "pr-jad-0108",
    "date": "2025-08-29",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000108000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0108-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1x7RORIpm2EpJQ1yiGNJL4JpkGX4qQGNd=w1200"
  },
  {
    "id": "dc-jad-0109",
    "dcNumber": "DC 109",
    "invoiceNumber": "DC 109",
    "prNumber": "PR-JAD-0109",
    "prId": "pr-jad-0109",
    "date": "2025-08-29",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000109000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0109-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xtFVqO0fMuOV-YoQJYCRtMna9fSYxN2E=w1200"
  },
  {
    "id": "dc-jad-0110",
    "dcNumber": "DC 110",
    "invoiceNumber": "DC 110",
    "prNumber": "PR-JAD-0110",
    "prId": "pr-jad-0110",
    "date": "2025-02-09",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000110000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0110-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ur4ye0nhLYd4gzyGYAeuqHAbmH-DwhC5=w1200"
  },
  {
    "id": "dc-jad-0111",
    "dcNumber": "DC 111",
    "invoiceNumber": "DC 111",
    "prNumber": "PR-JAD-0111",
    "prId": "pr-jad-0111",
    "date": "2025-08-09",
    "siteName": "Farm House Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000111000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0111-1",
        "itemName": "Electrical Supplies & Consumables (Farm House Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1cRYHntsH9uVp_lo9nDB9rQHG1-hoIoMp=w1200"
  },
  {
    "id": "dc-jad-0112",
    "dcNumber": "DC 112",
    "invoiceNumber": "DC 112",
    "prNumber": "PR-JAD-0112",
    "prId": "pr-jad-0112",
    "date": "2025-08-09",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000112000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0112-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NhO4l9PikD9V_lCS-AmAXjkJuT--4pdE=w1200"
  },
  {
    "id": "dc-jad-0113",
    "dcNumber": "DC 113",
    "invoiceNumber": "DC 113",
    "prNumber": "PR-JAD-0113",
    "prId": "pr-jad-0113",
    "date": "2025-10-09",
    "siteName": "Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000113000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0113-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jDw_tHPXKOv9J_cQ227Qh_GUlv4VdAjt=w1200"
  },
  {
    "id": "dc-jad-0114",
    "dcNumber": "DC-0114 (Missing)",
    "invoiceNumber": "DC-0114 (Missing)",
    "prNumber": "PR-JAD-0114",
    "prId": "pr-jad-0114",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000114000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0114-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0115",
    "dcNumber": "DC 115",
    "invoiceNumber": "DC 115",
    "prNumber": "PR-JAD-0115",
    "prId": "pr-jad-0115",
    "date": "2025-10-09",
    "siteName": "Plot 35 Terlai",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000115000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0115-1",
        "itemName": "Electrical Supplies & Consumables (Plot 35 Terlai)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1OUrwMPAwhaEES46x4TdFNbHqHy_CJ35q=w1200"
  },
  {
    "id": "dc-jad-0116",
    "dcNumber": "DC 116",
    "invoiceNumber": "DC 116",
    "prNumber": "PR-JAD-0116",
    "prId": "pr-jad-0116",
    "date": "2025-10-09",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000116000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0116-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1eZ3BMG_2owWuJubKq_B6ZcokJ8j0h-jT=w1200"
  },
  {
    "id": "dc-jad-0117",
    "dcNumber": "DC 117",
    "invoiceNumber": "DC 117",
    "prNumber": "PR-JAD-0117",
    "prId": "pr-jad-0117",
    "date": "2025-09-15",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000117000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0117-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11p1u6wjOZN94b8ecD6I_cH3wVgTcMMN8=w1200"
  },
  {
    "id": "dc-jad-0118",
    "dcNumber": "DC 118",
    "invoiceNumber": "DC 118",
    "prNumber": "PR-JAD-0118",
    "prId": "pr-jad-0118",
    "date": "2025-09-15",
    "siteName": "Madrasa Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000118000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0118-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xxf4yXLcOfLeDUei9dxlQBcdzU36KjSc=w1200"
  },
  {
    "id": "dc-jad-0119",
    "dcNumber": "DC 119",
    "invoiceNumber": "DC 119",
    "prNumber": "PR-JAD-0119",
    "prId": "pr-jad-0119",
    "date": "2025-09-15",
    "siteName": "Madrasa Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000119000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0119-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1QsY3LDRZnrkhTfhjJk8CFv3YR_TYuYlX=w1200"
  },
  {
    "id": "dc-jad-0120",
    "dcNumber": "DC 120",
    "invoiceNumber": "DC 120",
    "prNumber": "PR-JAD-0120",
    "prId": "pr-jad-0120",
    "date": "2025-09-15",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000120000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0120-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mZcS1ThDHmXVWF7GPKO39CmoDo3HUBpK=w1200"
  },
  {
    "id": "dc-jad-0121",
    "dcNumber": "DC 121",
    "invoiceNumber": "DC 121",
    "prNumber": "PR-JAD-0121",
    "prId": "pr-jad-0121",
    "date": "2025-09-15",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000121000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0121-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NVBpTU3MlmpIkArvGkLDr75tkS8riRjF=w1200"
  },
  {
    "id": "dc-jad-0122",
    "dcNumber": "DC 122",
    "invoiceNumber": "DC 122",
    "prNumber": "PR-JAD-0122",
    "prId": "pr-jad-0122",
    "date": "2025-09-17",
    "siteName": "WareHouse",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000122000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0122-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1MkjGTUeDXH_KZ7pBhEj4TyiwDc0BTAMt=w1200"
  },
  {
    "id": "dc-jad-0123",
    "dcNumber": "DC 123",
    "invoiceNumber": "DC 123",
    "prNumber": "PR-JAD-0123",
    "prId": "pr-jad-0123",
    "date": "2025-09-17",
    "siteName": "WareHouse",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000123000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0123-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1I6iRy-fwgFb3daQKn8E2mJO38PfqUs0M=w1200"
  },
  {
    "id": "dc-jad-0124",
    "dcNumber": "DC 124",
    "invoiceNumber": "DC 124",
    "prNumber": "PR-JAD-0124",
    "prId": "pr-jad-0124",
    "date": "2025-09-19",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000124000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0124-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/14_-YlPhOQ2mm4Tqzv2w7CBgKzqGZXRRV=w1200"
  },
  {
    "id": "dc-jad-0125",
    "dcNumber": "DC 125",
    "invoiceNumber": "DC 125",
    "prNumber": "PR-JAD-0125",
    "prId": "pr-jad-0125",
    "date": "2025-09-20",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000125000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0125-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1nL-Ov6Nlts1yTWuSuTE5XN2IdQ9oVExr=w1200"
  },
  {
    "id": "dc-jad-0126",
    "dcNumber": "DC 126",
    "invoiceNumber": "DC 126",
    "prNumber": "PR-JAD-0126",
    "prId": "pr-jad-0126",
    "date": "2025-09-20",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000126000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0126-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/14UOLA_YTe9tC_suRUftLS9kT6sSVDVlk=w1200"
  },
  {
    "id": "dc-jad-0127",
    "dcNumber": "DC 127",
    "invoiceNumber": "DC 127",
    "prNumber": "PR-JAD-0127",
    "prId": "pr-jad-0127",
    "date": "2025-09-20",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000127000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0127-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1s-OelvEU2xpv7sdLK-X97ALuhi3DSTYD=w1200"
  },
  {
    "id": "dc-jad-0128",
    "dcNumber": "DC 128",
    "invoiceNumber": "DC 128",
    "prNumber": "PR-JAD-0128",
    "prId": "pr-jad-0128",
    "date": "2025-09-22",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000128000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0128-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/17YA9PlIpJwbv6HfRzbp58H1Urqfj-RA5=w1200"
  },
  {
    "id": "dc-jad-0129",
    "dcNumber": "DC 129",
    "invoiceNumber": "DC 129",
    "prNumber": "PR-JAD-0129",
    "prId": "pr-jad-0129",
    "date": "2025-09-22",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000129000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0129-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1BEhJoJ1s0ugSHoDocU6TvWKLIt-yExn7=w1200"
  },
  {
    "id": "dc-jad-0130",
    "dcNumber": "DC 130",
    "invoiceNumber": "DC 130",
    "prNumber": "PR-JAD-0130",
    "prId": "pr-jad-0130",
    "date": "2025-09-23",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000130000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0130-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mSr5DzKvmj0bQpxSfeHLUt-lWN9Rwn3m=w1200"
  },
  {
    "id": "dc-jad-0131",
    "dcNumber": "DC 131",
    "invoiceNumber": "DC 131",
    "prNumber": "PR-JAD-0131",
    "prId": "pr-jad-0131",
    "date": "2025-09-23",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000131000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0131-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1p0v0tL_pJLJ4Ct9DxwNCYUSicfOCgATd=w1200"
  },
  {
    "id": "dc-jad-0132",
    "dcNumber": "DC 132",
    "invoiceNumber": "DC 132",
    "prNumber": "PR-JAD-0132",
    "prId": "pr-jad-0132",
    "date": "2025-09-23",
    "siteName": "Oggi Mansera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000132000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0132-1",
        "itemName": "Electrical Supplies & Consumables (Oggi Mansera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/171kNhDvBblgLdsdK1UIiUV7Ippr_ZAs5=w1200"
  },
  {
    "id": "dc-jad-0133",
    "dcNumber": "DC 133",
    "invoiceNumber": "DC 133",
    "prNumber": "PR-JAD-0133",
    "prId": "pr-jad-0133",
    "date": "2025-09-23",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000133000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0133-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16rKLOWQ8EE1yjqfr1MJIADIvnzXpYPxO=w1200"
  },
  {
    "id": "dc-jad-0134",
    "dcNumber": "DC 134",
    "invoiceNumber": "DC 134",
    "prNumber": "PR-JAD-0134",
    "prId": "pr-jad-0134",
    "date": "2025-09-24",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000134000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0134-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-JWYj2281Dj-Qfe9DuaHVWy1y4Yjto_f=w1200"
  },
  {
    "id": "dc-jad-0135",
    "dcNumber": "DC 135",
    "invoiceNumber": "DC 135",
    "prNumber": "PR-JAD-0135",
    "prId": "pr-jad-0135",
    "date": "2025-09-24",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000135000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0135-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1b59yoUMAxRo4DxFtTAyvvttrLda0zUs7=w1200"
  },
  {
    "id": "dc-jad-0136",
    "dcNumber": "DC 136",
    "invoiceNumber": "DC 136",
    "prNumber": "PR-JAD-0136",
    "prId": "pr-jad-0136",
    "date": "2025-09-23",
    "siteName": "Mosque Chak-17 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000136000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0136-1",
        "itemName": "Electrical Supplies & Consumables (Mosque Chak-17 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_I3Ouirt1SefXnXJpj_f7ExOwPT7OvGq=w1200"
  },
  {
    "id": "dc-jad-0137",
    "dcNumber": "DC 137",
    "invoiceNumber": "DC 137",
    "prNumber": "PR-JAD-0137",
    "prId": "pr-jad-0137",
    "date": "2025-09-26",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000137000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0137-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Npn1F9T7_D3_JSKj9MqvHlIkgHrVAiG2=w1200"
  },
  {
    "id": "dc-jad-0138",
    "dcNumber": "DC 138",
    "invoiceNumber": "DC 138",
    "prNumber": "PR-JAD-0138",
    "prId": "pr-jad-0138",
    "date": "2025-09-20",
    "siteName": "Oggi Mansera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000138000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0138-1",
        "itemName": "Electrical Supplies & Consumables (Oggi Mansera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8966)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8966",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Oggi",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1E0zVYFPGlU8Dy9cNMlXu0HEGHN8zIAX6=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1z6EV3KUIbw3Rp6_g7B-ILH-Nk51Gt_rH=w1200"
  },
  {
    "id": "dc-jad-0139",
    "dcNumber": "DC 139",
    "invoiceNumber": "DC 139",
    "prNumber": "PR-JAD-0139",
    "prId": "pr-jad-0139",
    "date": "2025-09-27",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000139000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0139-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #2628)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "2628",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1qRLKe_ubRI6oVge1Ta5DTQOfAjlcfIXX=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1etbLhqGyHwnK5hM2EaHZEApVJcyiddkb=w1200"
  },
  {
    "id": "dc-jad-0140",
    "dcNumber": "DC-0140 (Missing)",
    "invoiceNumber": "DC-0140 (Missing)",
    "prNumber": "PR-JAD-0140",
    "prId": "pr-jad-0140",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000140000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0140-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book",
    "documentImage": "https://lh3.googleusercontent.com/d/1djPZul3W3Y-YUM_iBpWZVO7bX256xJig=w1200"
  },
  {
    "id": "dc-jad-0141",
    "dcNumber": "DC 141",
    "invoiceNumber": "DC 141",
    "prNumber": "PR-JAD-0141",
    "prId": "pr-jad-0141",
    "date": "2025-09-24",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000141000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0141-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1J0H53c2kjeyXxGga7tVtHYISWmj7J-jz=w1200"
  },
  {
    "id": "dc-jad-0142",
    "dcNumber": "DC 142",
    "invoiceNumber": "DC 142",
    "prNumber": "PR-JAD-0142",
    "prId": "pr-jad-0142",
    "date": "2025-09-24",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000142000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0142-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1C12OEQ8vaTcaFyAbwRerAc_MYBUYy3jL=w1200"
  },
  {
    "id": "dc-jad-0143",
    "dcNumber": "DC 143",
    "invoiceNumber": "DC 143",
    "prNumber": "PR-JAD-0143",
    "prId": "pr-jad-0143",
    "date": "2025-09-26",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000143000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0143-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1L3iNjeCZKFSA7y2i9jNgiibxv5UK07tm=w1200"
  },
  {
    "id": "dc-jad-0144",
    "dcNumber": "DC 144",
    "invoiceNumber": "DC 144",
    "prNumber": "PR-JAD-0144",
    "prId": "pr-jad-0144",
    "date": "2025-09-26",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000144000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0144-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1m0ZkI7yhccHU0jXRJINUQ61pI3hQziXW=w1200"
  },
  {
    "id": "dc-jad-0145",
    "dcNumber": "DC 145",
    "invoiceNumber": "DC 145",
    "prNumber": "PR-JAD-0145",
    "prId": "pr-jad-0145",
    "date": "2025-09-26",
    "siteName": "Bhater 1 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000145000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0145-1",
        "itemName": "Electrical Supplies & Consumables (Bhater 1 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/13FceFwxkhorhE6zrrA62xZPyXNfcCkdu=w1200"
  },
  {
    "id": "dc-jad-0146",
    "dcNumber": "DC 146",
    "invoiceNumber": "DC 146",
    "prNumber": "PR-JAD-0146",
    "prId": "pr-jad-0146",
    "date": "2025-09-27",
    "siteName": "Bhater 1 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000146000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0146-1",
        "itemName": "Electrical Supplies & Consumables (Bhater 1 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1GCNeQ-xYv2nlwG7Sw8JddVl6bjM3V6EA=w1200"
  },
  {
    "id": "dc-jad-0147",
    "dcNumber": "DC 147",
    "invoiceNumber": "DC 147",
    "prNumber": "PR-JAD-0147",
    "prId": "pr-jad-0147",
    "date": "2025-09-29",
    "siteName": "Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000147000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0147-1",
        "itemName": "Electrical Supplies & Consumables (Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EIsloBSazAIGdOA_BUE5p8KFWYiTydBM=w1200"
  },
  {
    "id": "dc-jad-0148",
    "dcNumber": "DC 148",
    "invoiceNumber": "DC 148",
    "prNumber": "PR-JAD-0148",
    "prId": "pr-jad-0148",
    "date": "2025-01-10",
    "siteName": "WareHouse khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000148000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0148-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WD0qNTYywfsWtl5TO5FzYYLkYXOUVvcX=w1200"
  },
  {
    "id": "dc-jad-0149",
    "dcNumber": "DC 149",
    "invoiceNumber": "DC 149",
    "prNumber": "PR-JAD-0149",
    "prId": "pr-jad-0149",
    "date": "2025-01-10",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000149000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0149-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xSx-qFas8IAlCrwgjns3hvsyLu4TUX_V=w1200"
  },
  {
    "id": "dc-jad-0150",
    "dcNumber": "DC 150",
    "invoiceNumber": "DC 150",
    "prNumber": "PR-JAD-0150",
    "prId": "pr-jad-0150",
    "date": "2025-01-10",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000150000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0150-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mMQ6NGAt7ZUOeLlCTtM0BOGoKXVsZkmS=w1200"
  },
  {
    "id": "dc-jad-0151",
    "dcNumber": "DC 151",
    "invoiceNumber": "DC 151",
    "prNumber": "PR-JAD-0151",
    "prId": "pr-jad-0151",
    "date": "2025-01-10",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000151000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0151-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1qbL-lW2rZa6kmR1r3m3LVjnuWNTckooN=w1200"
  },
  {
    "id": "dc-jad-0152",
    "dcNumber": "DC 152",
    "invoiceNumber": "DC 152",
    "prNumber": "PR-JAD-0152",
    "prId": "pr-jad-0152",
    "date": "2025-01-10",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000152000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0152-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Xk75RpeBCNfQSXDoKG_IWpOjZX92aBw-=w1200"
  },
  {
    "id": "dc-jad-0153",
    "dcNumber": "DC 153",
    "invoiceNumber": "DC 153",
    "prNumber": "PR-JAD-0153",
    "prId": "pr-jad-0153",
    "date": "2025-02-10",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000153000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0153-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iG__eB5wQ9-xTqKtJqMrRWuLt55VYvP-=w1200"
  },
  {
    "id": "dc-jad-0154",
    "dcNumber": "DC 154",
    "invoiceNumber": "DC 154",
    "prNumber": "PR-JAD-0154",
    "prId": "pr-jad-0154",
    "date": "2025-09-15",
    "siteName": "Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000154000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0154-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1sHPsYqg4ExlQNmynChvonqb1LxkSAftL=w1200"
  },
  {
    "id": "dc-jad-0155",
    "dcNumber": "DC 155",
    "invoiceNumber": "DC 155",
    "prNumber": "PR-JAD-0155",
    "prId": "pr-jad-0155",
    "date": "2025-02-10",
    "siteName": "Infinity Basket Tarlaie",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000155000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0155-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Basket Tarlaie)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1aD2od92zA0A53zMXWeBMB0zQ5AiH8RvA=w1200"
  },
  {
    "id": "dc-jad-0156",
    "dcNumber": "DC 156",
    "invoiceNumber": "DC 156",
    "prNumber": "PR-JAD-0156",
    "prId": "pr-jad-0156",
    "date": "2025-03-10",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000156000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0156-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1vqI8v83LlnRmSS2QzTxea68AlBR0NAz7=w1200"
  },
  {
    "id": "dc-jad-0157",
    "dcNumber": "DC 157",
    "invoiceNumber": "DC 157",
    "prNumber": "PR-JAD-0157",
    "prId": "pr-jad-0157",
    "date": "2025-03-10",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000157000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0157-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1snlOia8UH1x_YzanZA3VyHKTAhL6xWx5=w1200"
  },
  {
    "id": "dc-jad-0158",
    "dcNumber": "DC 158",
    "invoiceNumber": "DC 158",
    "prNumber": "PR-JAD-0158",
    "prId": "pr-jad-0158",
    "date": "2025-03-10",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000158000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0158-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1gzd8pexg3YhkBLIB-twVXXyTxJTFMcV-=w1200"
  },
  {
    "id": "dc-jad-0159",
    "dcNumber": "DC 159",
    "invoiceNumber": "DC 159",
    "prNumber": "PR-JAD-0159",
    "prId": "pr-jad-0159",
    "date": "2025-04-10",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000159000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0159-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Imu-8OZ705fvfps8UHEc3w4uUQLn33JR=w1200"
  },
  {
    "id": "dc-jad-0160",
    "dcNumber": "DC 160",
    "invoiceNumber": "DC 160",
    "prNumber": "PR-JAD-0160",
    "prId": "pr-jad-0160",
    "date": "2025-04-10",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000160000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0160-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1csm0u2vkGICVdnvzRa_r_IyUl8yyvvgP=w1200"
  },
  {
    "id": "dc-jad-0161",
    "dcNumber": "DC 161",
    "invoiceNumber": "DC 161",
    "prNumber": "PR-JAD-0161",
    "prId": "pr-jad-0161",
    "date": "2025-06-10",
    "siteName": "Infinity Store Saidpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000161000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0161-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Saidpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1oefKWavwQhSt0uH3EjnL26vB3pasQJix=w1200"
  },
  {
    "id": "dc-jad-0162",
    "dcNumber": "DC 162",
    "invoiceNumber": "DC 162",
    "prNumber": "PR-JAD-0162",
    "prId": "pr-jad-0162",
    "date": "2025-09-29",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000162000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0162-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1tYz5lrj5m8hAXU7CJ4snFVg5e_Kxw2eU=w1200"
  },
  {
    "id": "dc-jad-0163",
    "dcNumber": "DC 163",
    "invoiceNumber": "DC 163",
    "prNumber": "PR-JAD-0163",
    "prId": "pr-jad-0163",
    "date": "2025-03-10",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000163000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0163-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1i5LIibAo-OEUdcI4LOuzgYZHz4RQfvvY=w1200"
  },
  {
    "id": "dc-jad-0164",
    "dcNumber": "DC 164",
    "invoiceNumber": "DC 164",
    "prNumber": "PR-JAD-0164",
    "prId": "pr-jad-0164",
    "date": "2025-02-10",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000164000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0164-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1P6Az83nGpaRm0Un-4KJWLJcq_6Cf_7uh=w1200"
  },
  {
    "id": "dc-jad-0165",
    "dcNumber": "DC 165",
    "invoiceNumber": "DC 165",
    "prNumber": "PR-JAD-0165",
    "prId": "pr-jad-0165",
    "date": "2025-07-10",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000165000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0165-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11ViwXlLvXD2AFjlM1HE-2Do95ODDbgNQ=w1200"
  },
  {
    "id": "dc-jad-0166",
    "dcNumber": "DC 166",
    "invoiceNumber": "DC 166",
    "prNumber": "PR-JAD-0166",
    "prId": "pr-jad-0166",
    "date": "2025-07-10",
    "siteName": "Infinity Store Double Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000166000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0166-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Double Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1F_BOXbxWk25fT5v0GiBUscENs0Hjz25s=w1200"
  },
  {
    "id": "dc-jad-0167",
    "dcNumber": "DC 167",
    "invoiceNumber": "DC 167",
    "prNumber": "PR-JAD-0167",
    "prId": "pr-jad-0167",
    "date": "2025-07-10",
    "siteName": "Infinity Adyala Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000167000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0167-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Adyala Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1BE8c59wdKnCoB_ONraIGNRiZjQL6TGMN=w1200"
  },
  {
    "id": "dc-jad-0168",
    "dcNumber": "DC 168",
    "invoiceNumber": "DC 168",
    "prNumber": "PR-JAD-0168",
    "prId": "pr-jad-0168",
    "date": "2025-07-10",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000168000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0168-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1UAXQiU2j0XcndH-u4qon7RH8OdZGwz2l=w1200"
  },
  {
    "id": "dc-jad-0169",
    "dcNumber": "DC 169",
    "invoiceNumber": "DC 169",
    "prNumber": "PR-JAD-0169",
    "prId": "pr-jad-0169",
    "date": "2025-10-10",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000169000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0169-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1aFpQeN3Gg6fr-ZlCIi9L3LpNetO_L25y=w1200"
  },
  {
    "id": "dc-jad-0170",
    "dcNumber": "DC 170",
    "invoiceNumber": "DC 170",
    "prNumber": "PR-JAD-0170",
    "prId": "pr-jad-0170",
    "date": "2025-10-10",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000170000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0170-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #1712)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "1712",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1rGkPxLJa5qN0Vrc0VJF3Juj8-OVB1TLu=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1L9PgNQyDLqsXbxEtbchfthX65B3__MDa=w1200"
  },
  {
    "id": "dc-jad-0171",
    "dcNumber": "DC 171",
    "invoiceNumber": "DC 171",
    "prNumber": "PR-JAD-0171",
    "prId": "pr-jad-0171",
    "date": "2025-10-13",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000171000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0171-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1egnNi-A4t5R-aLlOu13T3pZ36NGiCPoS=w1200"
  },
  {
    "id": "dc-jad-0172",
    "dcNumber": "DC 172",
    "invoiceNumber": "DC 172",
    "prNumber": "PR-JAD-0172",
    "prId": "pr-jad-0172",
    "date": "2025-10-13",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000172000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0172-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bV9GPwHiR-mn_-QmpxfYuhi5CYEBpF-Z=w1200"
  },
  {
    "id": "dc-jad-0173",
    "dcNumber": "DC 173",
    "invoiceNumber": "DC 173",
    "prNumber": "PR-JAD-0173",
    "prId": "pr-jad-0173",
    "date": "2025-10-16",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000173000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0173-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1X9BSqL95U5RJVh6NjDKEPCuXxvSIJtSZ=w1200"
  },
  {
    "id": "dc-jad-0174",
    "dcNumber": "DC 174",
    "invoiceNumber": "DC 174",
    "prNumber": "PR-JAD-0174",
    "prId": "pr-jad-0174",
    "date": "2025-10-13",
    "siteName": "Chicks Rawat Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000174000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0174-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Rawat Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/17GSQKgHdHWUCzoWJuS--OEw_v_VkoAyr=w1200"
  },
  {
    "id": "dc-jad-0175",
    "dcNumber": "DC 175",
    "invoiceNumber": "DC 175",
    "prNumber": "PR-JAD-0175",
    "prId": "pr-jad-0175",
    "date": "2025-10-13",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000175000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0175-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1G8uvUBIb-qUhk4S7Sv1CtQgbAh1-0_Tj=w1200"
  },
  {
    "id": "dc-jad-0176",
    "dcNumber": "DC 176",
    "invoiceNumber": "DC 176",
    "prNumber": "PR-JAD-0176",
    "prId": "pr-jad-0176",
    "date": "2025-10-13",
    "siteName": "Infinity Store Double Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000176000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0176-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Double Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1PkZo-TVtC3TEaCb7D2Y3VsovjEtSldv5=w1200"
  },
  {
    "id": "dc-jad-0177",
    "dcNumber": "DC 177",
    "invoiceNumber": "DC 177",
    "prNumber": "PR-JAD-0177",
    "prId": "pr-jad-0177",
    "date": "2025-10-13",
    "siteName": "Infinity Store Double Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000177000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0177-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Double Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1QA2mL3eeArvkRiyuhD5AZJ9_tQQ7AKCo=w1200"
  },
  {
    "id": "dc-jad-0178",
    "dcNumber": "DC 178",
    "invoiceNumber": "DC 178",
    "prNumber": "PR-JAD-0178",
    "prId": "pr-jad-0178",
    "date": "2025-10-14",
    "siteName": "Infinity Store Double Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000178000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0178-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Double Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18IJwPXCOY_zPvVh79Q6NHAkKS_4L1OnE=w1200"
  },
  {
    "id": "dc-jad-0179",
    "dcNumber": "DC 179",
    "invoiceNumber": "DC 179",
    "prNumber": "PR-JAD-0179",
    "prId": "pr-jad-0179",
    "date": "2025-10-15",
    "siteName": "F-6 House 10 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000179000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0179-1",
        "itemName": "Electrical Supplies & Consumables (F-6 House 10 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Sm29x_c18HHSRuPri3oG7QqUtnuzK2uI=w1200"
  },
  {
    "id": "dc-jad-0180",
    "dcNumber": "DC 180",
    "invoiceNumber": "DC 180",
    "prNumber": "PR-JAD-0180",
    "prId": "pr-jad-0180",
    "date": "2025-10-17",
    "siteName": "Chicks Rawat Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000180000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0180-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Rawat Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1F1dveynFbcxP2Ph5Ao76SXogRIVSY32M=w1200"
  },
  {
    "id": "dc-jad-0181",
    "dcNumber": "DC 181",
    "invoiceNumber": "DC 181",
    "prNumber": "PR-JAD-0181",
    "prId": "pr-jad-0181",
    "date": "2025-10-17",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000181000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0181-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1aJpyujPLOLT6A_isOIipnz8VnLIThTd7=w1200"
  },
  {
    "id": "dc-jad-0182",
    "dcNumber": "DC 182",
    "invoiceNumber": "DC 182",
    "prNumber": "PR-JAD-0182",
    "prId": "pr-jad-0182",
    "date": "2025-10-18",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000182000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0182-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1fCUDuA2fZqxFW7TNsYCbsMMHU4rWftH0=w1200"
  },
  {
    "id": "dc-jad-0183",
    "dcNumber": "DC 183",
    "invoiceNumber": "DC 183",
    "prNumber": "PR-JAD-0183",
    "prId": "pr-jad-0183",
    "date": "2025-10-18",
    "siteName": "WareHouse khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000183000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0183-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1koKmKaLXX28XLvO-aIDVkfJVnUF5iabY=w1200"
  },
  {
    "id": "dc-jad-0184",
    "dcNumber": "DC 184",
    "invoiceNumber": "DC 184",
    "prNumber": "PR-JAD-0184",
    "prId": "pr-jad-0184",
    "date": "2025-10-18",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000184000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0184-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RBd8R2VsTDwCEcETKCGApO6iUeow0WpV=w1200"
  },
  {
    "id": "dc-jad-0185",
    "dcNumber": "DC 185",
    "invoiceNumber": "DC 185",
    "prNumber": "PR-JAD-0185",
    "prId": "pr-jad-0185",
    "date": "2025-10-18",
    "siteName": "House 28 F-6/3 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000185000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0185-1",
        "itemName": "Electrical Supplies & Consumables (House 28 F-6/3 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ilZqgAh7fE8Uk4p_Qbwv20s_njgVJ4gJ=w1200"
  },
  {
    "id": "dc-jad-0186",
    "dcNumber": "DC 186",
    "invoiceNumber": "DC 186",
    "prNumber": "PR-JAD-0186",
    "prId": "pr-jad-0186",
    "date": "2025-10-18",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000186000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0186-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #858283)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "858283",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1oV0EzHBXcmOztbruXinsId0WneWVh6Gv=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1AYelbYFjBNbhLZk8yE8dRLLUhQEcPrIm=w1200"
  },
  {
    "id": "dc-jad-0187",
    "dcNumber": "DC 187",
    "invoiceNumber": "DC 187",
    "prNumber": "PR-JAD-0187",
    "prId": "pr-jad-0187",
    "date": "2025-10-21",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000187000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0187-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hEi-GHHz3sMeudipVT5yUtpHKW7W6aX7=w1200"
  },
  {
    "id": "dc-jad-0188",
    "dcNumber": "DC 188",
    "invoiceNumber": "DC 188",
    "prNumber": "PR-JAD-0188",
    "prId": "pr-jad-0188",
    "date": "2025-10-21",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000188000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0188-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16hJtrqD1QEew5CiV7o4ufLbilYsHuB_m=w1200"
  },
  {
    "id": "dc-jad-0189",
    "dcNumber": "DC 189",
    "invoiceNumber": "DC 189",
    "prNumber": "PR-JAD-0189",
    "prId": "pr-jad-0189",
    "date": "2025-10-21",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000189000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0189-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1AhhXeztQwlJC7TtPwivaGsZLIgFZxv8D=w1200"
  },
  {
    "id": "dc-jad-0190",
    "dcNumber": "DC 190",
    "invoiceNumber": "DC 190",
    "prNumber": "PR-JAD-0190",
    "prId": "pr-jad-0190",
    "date": "2025-10-16",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000190000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0190-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jk5zBaRjA67N7GDnGZE2APMsHxErZ3Fe=w1200"
  },
  {
    "id": "dc-jad-0191",
    "dcNumber": "DC 191",
    "invoiceNumber": "DC 191",
    "prNumber": "PR-JAD-0191",
    "prId": "pr-jad-0191",
    "date": "2025-10-15",
    "siteName": "Infinity Store Double Road",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000191000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0191-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store Double Road)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-Jvijnl15nHIvSKJ0OGBP5z4h8rRL9U5=w1200"
  },
  {
    "id": "dc-jad-0192",
    "dcNumber": "DC 192",
    "invoiceNumber": "DC 192",
    "prNumber": "PR-JAD-0192",
    "prId": "pr-jad-0192",
    "date": "2025-10-15",
    "siteName": "Sanjawal Attock",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000192000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0192-1",
        "itemName": "Electrical Supplies & Consumables (Sanjawal Attock)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1atG84v7tDVtRGIAKsARdvZV7Qi9_3UGE=w1200"
  },
  {
    "id": "dc-jad-0193",
    "dcNumber": "DC 193",
    "invoiceNumber": "DC 193",
    "prNumber": "PR-JAD-0193",
    "prId": "pr-jad-0193",
    "date": "2025-10-15",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000193000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0193-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1fRnqqgvr-C42vITOWor0VnR_FhjIOZ0D=w1200"
  },
  {
    "id": "dc-jad-0194",
    "dcNumber": "DC 194",
    "invoiceNumber": "DC 194",
    "prNumber": "PR-JAD-0194",
    "prId": "pr-jad-0194",
    "date": "2025-10-15",
    "siteName": "Agri Farm Mankera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000194000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0194-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #7045)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "7045",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1k4myGPWlzxa2P9AI4IrF1iVr2K4VWnxz=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1ALOZ-kiqe--yLCr95KikX-AGS77AprWs=w1200"
  },
  {
    "id": "dc-jad-0195",
    "dcNumber": "DC 195",
    "invoiceNumber": "DC 195",
    "prNumber": "PR-JAD-0195",
    "prId": "pr-jad-0195",
    "date": "2025-10-18",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000195000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0195-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1pGv-Saj4qemaBgYk-RnIK56Z4RlHOWh9=w1200"
  },
  {
    "id": "dc-jad-0196",
    "dcNumber": "DC 196",
    "invoiceNumber": "DC 196",
    "prNumber": "PR-JAD-0196",
    "prId": "pr-jad-0196",
    "date": "2025-10-20",
    "siteName": "Chicks Rawat Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000196000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0196-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Rawat Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1QRBiej2J3UKHdXUNG3dv74fEhLaIs0Rq=w1200"
  },
  {
    "id": "dc-jad-0197",
    "dcNumber": "DC 197",
    "invoiceNumber": "DC 197",
    "prNumber": "PR-JAD-0197",
    "prId": "pr-jad-0197",
    "date": "2025-10-24",
    "siteName": "F-6 House 10 Isb",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000197000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0197-1",
        "itemName": "Electrical Supplies & Consumables (F-6 House 10 Isb)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1YhpGDosMGhF9Xc-a8TsI6vaVdb6QAULo=w1200"
  },
  {
    "id": "dc-jad-0198",
    "dcNumber": "DC 198",
    "invoiceNumber": "DC 198",
    "prNumber": "PR-JAD-0198",
    "prId": "pr-jad-0198",
    "date": "2025-10-24",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000198000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0198-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1w6Q3VdJN2g-1Y2CGATo15cdLlNrE1721=w1200"
  },
  {
    "id": "dc-jad-0199",
    "dcNumber": "DC 199",
    "invoiceNumber": "DC 199",
    "prNumber": "PR-JAD-0199",
    "prId": "pr-jad-0199",
    "date": "2025-10-24",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000199000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0199-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ShqJOTAxy1T2ZGX9GhubGj23-ZUi1BS9=w1200"
  },
  {
    "id": "dc-jad-0200",
    "dcNumber": "DC 200",
    "invoiceNumber": "DC 200",
    "prNumber": "PR-JAD-0200",
    "prId": "pr-jad-0200",
    "date": "2025-10-25",
    "siteName": "Farm P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000200000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0200-1",
        "itemName": "Electrical Supplies & Consumables (Farm P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1A6Rx1nZxVrZ6SIpbPBS35FUXHiy51Ckg=w1200"
  },
  {
    "id": "dc-jad-0201",
    "dcNumber": "DC 201",
    "invoiceNumber": "DC 201",
    "prNumber": "PR-JAD-0201",
    "prId": "pr-jad-0201",
    "date": "2025-10-27",
    "siteName": "House  451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000201000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0201-1",
        "itemName": "Electrical Supplies & Consumables (House  451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1yYtcJ6S-u3GZR-uGj6aYCLpdRZt6m-fL=w1200"
  },
  {
    "id": "dc-jad-0202",
    "dcNumber": "DC 202",
    "invoiceNumber": "DC 202",
    "prNumber": "PR-JAD-0202",
    "prId": "pr-jad-0202",
    "date": "2025-10-27",
    "siteName": "Madrasa 20/8r Mian Chuna",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000202000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0202-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa 20/8r Mian Chuna)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11YwaBw7bXcwOdUFz_sywc9iC813lzsq_=w1200"
  },
  {
    "id": "dc-jad-0203",
    "dcNumber": "DC 203",
    "invoiceNumber": "DC 203",
    "prNumber": "PR-JAD-0203",
    "prId": "pr-jad-0203",
    "date": "2025-10-27",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000203000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0203-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1lZDKOYYRhdxgt8WbwUQS2sqozenvRydE=w1200"
  },
  {
    "id": "dc-jad-0204",
    "dcNumber": "DC 204",
    "invoiceNumber": "DC 204",
    "prNumber": "PR-JAD-0204",
    "prId": "pr-jad-0204",
    "date": "2025-10-28",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000204000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0204-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1TGxijkeR68gFtSzKFs7yNISofbJ0VL7e=w1200"
  },
  {
    "id": "dc-jad-0205",
    "dcNumber": "DC 205",
    "invoiceNumber": "DC 205",
    "prNumber": "PR-JAD-0205",
    "prId": "pr-jad-0205",
    "date": "2025-10-28",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000205000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0205-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1k7VD3y3JE_7bdgZcDB5xD69Yo0MYYRoR=w1200"
  },
  {
    "id": "dc-jad-0206",
    "dcNumber": "DC 206",
    "invoiceNumber": "DC 206",
    "prNumber": "PR-JAD-0206",
    "prId": "pr-jad-0206",
    "date": "2025-10-30",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000206000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0206-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1SWwsAWdHjhIPZKKUy9TRJfkVqay6hXnx=w1200"
  },
  {
    "id": "dc-jad-0207",
    "dcNumber": "DC 207",
    "invoiceNumber": "DC 207",
    "prNumber": "PR-JAD-0207",
    "prId": "pr-jad-0207",
    "date": "2025-01-11",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000207000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0207-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/17fJGY8M2WWAzrUWDBfNd3257_HtgXopP=w1200"
  },
  {
    "id": "dc-jad-0208",
    "dcNumber": "DC 208",
    "invoiceNumber": "DC 208",
    "prNumber": "PR-JAD-0208",
    "prId": "pr-jad-0208",
    "date": "2025-04-11",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000208000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0208-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EUudvoZDaOLtkbFOFWJsYsAAoE0-IitR=w1200"
  },
  {
    "id": "dc-jad-0209",
    "dcNumber": "DC 209",
    "invoiceNumber": "DC 209",
    "prNumber": "PR-JAD-0209",
    "prId": "pr-jad-0209",
    "date": "2025-04-11",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000209000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0209-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ni6d97GQ3HbSS7BD-08RGbYHbn3ImuSW=w1200"
  },
  {
    "id": "dc-jad-0210",
    "dcNumber": "DC 210",
    "invoiceNumber": "DC 210",
    "prNumber": "PR-JAD-0210",
    "prId": "pr-jad-0210",
    "date": "2025-05-11",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000210000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0210-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/14alhP5zDLDUSkFNKTKcWXp2bu6d3mvrj=w1200"
  },
  {
    "id": "dc-jad-0211",
    "dcNumber": "DC 211",
    "invoiceNumber": "DC 211",
    "prNumber": "PR-JAD-0211",
    "prId": "pr-jad-0211",
    "date": "2025-05-11",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000211000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0211-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WZupW5LBvVO5W4RQZFNsf2n2nRcrfVCi=w1200"
  },
  {
    "id": "dc-jad-0212",
    "dcNumber": "DC 212",
    "invoiceNumber": "DC 212",
    "prNumber": "PR-JAD-0212",
    "prId": "pr-jad-0212",
    "date": "2025-05-11",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000212000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0212-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bWzY2LtT4C1tPWX-L6vc6jSIIBbnF6Jr=w1200"
  },
  {
    "id": "dc-jad-0213",
    "dcNumber": "DC 213",
    "invoiceNumber": "DC 213",
    "prNumber": "PR-JAD-0213",
    "prId": "pr-jad-0213",
    "date": "2025-12-11",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000213000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0213-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Vs998P0N4mV8_IXyd8_3VRV8kEJf40V4=w1200"
  },
  {
    "id": "dc-jad-0214",
    "dcNumber": "DC 214",
    "invoiceNumber": "DC 214",
    "prNumber": "PR-JAD-0214",
    "prId": "pr-jad-0214",
    "date": "2025-11-14",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000214000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0214-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/112lT5fU2WWLPbSZ-HELiDVlWn2qfcuRt=w1200"
  },
  {
    "id": "dc-jad-0215",
    "dcNumber": "DC 215",
    "invoiceNumber": "DC 215",
    "prNumber": "PR-JAD-0215",
    "prId": "pr-jad-0215",
    "date": "2025-11-15",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000215000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0215-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FZpnuQftmC1ZZiU9M2G4kADPwUtsejay=w1200"
  },
  {
    "id": "dc-jad-0216",
    "dcNumber": "DC 216",
    "invoiceNumber": "DC 216",
    "prNumber": "PR-JAD-0216",
    "prId": "pr-jad-0216",
    "date": "2025-11-17",
    "siteName": "Hatchery PR 134",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000216000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0216-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery PR 134)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16U2QjGHfjk5ValmrKit98_Z4tvBtfghk=w1200"
  },
  {
    "id": "dc-jad-0217",
    "dcNumber": "DC 217",
    "invoiceNumber": "DC 217",
    "prNumber": "PR-JAD-0217",
    "prId": "pr-jad-0217",
    "date": "2025-11-17",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000217000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0217-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hZf7cU4xBtTXyvlIcQ4RPFymBVFIA5wO=w1200"
  },
  {
    "id": "dc-jad-0218",
    "dcNumber": "DC 218",
    "invoiceNumber": "DC 218",
    "prNumber": "PR-JAD-0218",
    "prId": "pr-jad-0218",
    "date": "2025-11-17",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000218000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0218-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1x9rCAIjy6aGv2YCuAlEb-jVyUzpqnGX2=w1200"
  },
  {
    "id": "dc-jad-0219",
    "dcNumber": "DC 219",
    "invoiceNumber": "DC 219",
    "prNumber": "PR-JAD-0219",
    "prId": "pr-jad-0219",
    "date": "2025-11-17",
    "siteName": "Marble Town Rwp",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000219000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0219-1",
        "itemName": "Electrical Supplies & Consumables (Marble Town Rwp)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1kitB1ucTrT5iHz26MhFmVFgDEkqp6NjI=w1200"
  },
  {
    "id": "dc-jad-0220",
    "dcNumber": "DC 220",
    "invoiceNumber": "DC 220",
    "prNumber": "PR-JAD-0220",
    "prId": "pr-jad-0220",
    "date": "2025-11-19",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000220000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0220-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1MPWAY9DOcI7TyXI_dfRWCmfAau17t3JP=w1200"
  },
  {
    "id": "dc-jad-0221",
    "dcNumber": "DC 221",
    "invoiceNumber": "DC 221",
    "prNumber": "PR-JAD-0221",
    "prId": "pr-jad-0221",
    "date": "2025-11-21",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000221000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0221-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xNldWyGmgEERQD3clIjsjOM8UG8FXB1L=w1200"
  },
  {
    "id": "dc-jad-0222",
    "dcNumber": "DC 222",
    "invoiceNumber": "DC 222",
    "prNumber": "PR-JAD-0222",
    "prId": "pr-jad-0222",
    "date": "2025-11-25",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000222000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0222-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1lvYaqJw7SlztKL6LQKHVRwckli0rwbGL=w1200"
  },
  {
    "id": "dc-jad-0223",
    "dcNumber": "DC 223",
    "invoiceNumber": "DC 223",
    "prNumber": "PR-JAD-0223",
    "prId": "pr-jad-0223",
    "date": "2025-12-13",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000223000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0223-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1GzDgC4f0GCn6nDIfyQVNmRn-krdgJZfG=w1200"
  },
  {
    "id": "dc-jad-0224",
    "dcNumber": "DC-0224 (Missing)",
    "invoiceNumber": "DC-0224 (Missing)",
    "prNumber": "PR-JAD-0224",
    "prId": "pr-jad-0224",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000224000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0224-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0225",
    "dcNumber": "DC 225",
    "invoiceNumber": "DC 225",
    "prNumber": "PR-JAD-0225",
    "prId": "pr-jad-0225",
    "date": "2025-11-27",
    "siteName": "Marble Arch Girja Road Rwp",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000225000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0225-1",
        "itemName": "Electrical Supplies & Consumables (Marble Arch Girja Road Rwp)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19dbJuaBOeEKINEfbTb3gMVSOwrsqZhX_=w1200"
  },
  {
    "id": "dc-jad-0226",
    "dcNumber": "DC 226",
    "invoiceNumber": "DC 226",
    "prNumber": "PR-JAD-0226",
    "prId": "pr-jad-0226",
    "date": "2025-11-29",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000226000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0226-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Zg_Qlz9CsQv1hETHDrJ-qsERK3p82Lsp=w1200"
  },
  {
    "id": "dc-jad-0227",
    "dcNumber": "DC 227",
    "invoiceNumber": "DC 227",
    "prNumber": "PR-JAD-0227",
    "prId": "pr-jad-0227",
    "date": "2026-02-01",
    "siteName": "F-6 House 10 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000227000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0227-1",
        "itemName": "Electrical Supplies & Consumables (F-6 House 10 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1D0uwKb_3HYl5wHzey9aVTJDA5z3jlOpI=w1200"
  },
  {
    "id": "dc-jad-0228",
    "dcNumber": "DC 228",
    "invoiceNumber": "DC 228",
    "prNumber": "PR-JAD-0228",
    "prId": "pr-jad-0228",
    "date": "2025-12-22",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000228000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0228-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1C_2isxFC4z107Ea9wei7BdDrEjoPPLWh=w1200"
  },
  {
    "id": "dc-jad-0229",
    "dcNumber": "DC 229",
    "invoiceNumber": "DC 229",
    "prNumber": "PR-JAD-0229",
    "prId": "pr-jad-0229",
    "date": "2025-03-12",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000229000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0229-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1VEf_uTycOiF2quFx3Y9lcyPFEVN-n-gK=w1200"
  },
  {
    "id": "dc-jad-0230",
    "dcNumber": "DC 230",
    "invoiceNumber": "DC 230",
    "prNumber": "PR-JAD-0230",
    "prId": "pr-jad-0230",
    "date": "2025-12-27",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000230000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0230-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1OMLmhuI0AwGFJ0L6A_VAXfZnjQQqPoxt=w1200"
  },
  {
    "id": "dc-jad-0231",
    "dcNumber": "DC 231",
    "invoiceNumber": "DC 231",
    "prNumber": "PR-JAD-0231",
    "prId": "pr-jad-0231",
    "date": "2025-04-12",
    "siteName": "Madrasa 20/8r Mian Chuna",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000231000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0231-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa 20/8r Mian Chuna)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1VhZVjfPpDuWAlwdQ6lM0MoMWsky90EUx=w1200"
  },
  {
    "id": "dc-jad-0232",
    "dcNumber": "DC 232",
    "invoiceNumber": "DC 232",
    "prNumber": "PR-JAD-0232",
    "prId": "pr-jad-0232",
    "date": "2025-04-12",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000232000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0232-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1R1a8mFEsJkSYWkShjHLtic7WnDGSEKeG=w1200"
  },
  {
    "id": "dc-jad-0233",
    "dcNumber": "DC 233",
    "invoiceNumber": "DC 233",
    "prNumber": "PR-JAD-0233",
    "prId": "pr-jad-0233",
    "date": "2025-12-13",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000233000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0233-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1nSOy4YCCvKaCEpPrYCZ-vqkoe12Wl8C5=w1200"
  },
  {
    "id": "dc-jad-0234",
    "dcNumber": "DC 234",
    "invoiceNumber": "DC 234",
    "prNumber": "PR-JAD-0234",
    "prId": "pr-jad-0234",
    "date": "2025-11-12",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000234000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0234-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1BZuClDEGe1fR06S0mj5oSM8kJ6QXHprH=w1200"
  },
  {
    "id": "dc-jad-0235",
    "dcNumber": "DC 235",
    "invoiceNumber": "DC 235",
    "prNumber": "PR-JAD-0235",
    "prId": "pr-jad-0235",
    "date": "2025-12-13",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000235000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0235-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ts1lrZnmpVUaEka8PMg6VIcuOKyCZw-J=w1200"
  },
  {
    "id": "dc-jad-0236",
    "dcNumber": "DC-0236 (Missing)",
    "invoiceNumber": "DC-0236 (Missing)",
    "prNumber": "PR-JAD-0236",
    "prId": "pr-jad-0236",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000236000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0236-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0237",
    "dcNumber": "DC 237",
    "invoiceNumber": "DC 237",
    "prNumber": "PR-JAD-0237",
    "prId": "pr-jad-0237",
    "date": "2025-12-16",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000237000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0237-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1s3vSe_PtTkdq3ESMVfc_vs1VyKC_eQAh=w1200"
  },
  {
    "id": "dc-jad-0238",
    "dcNumber": "DC 238",
    "invoiceNumber": "DC 238",
    "prNumber": "PR-JAD-0238",
    "prId": "pr-jad-0238",
    "date": "2025-12-15",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000238000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0238-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xp660RfHjOJo3bGsJiFGroVcNJ1JkK2K=w1200"
  },
  {
    "id": "dc-jad-0239",
    "dcNumber": "DC 239",
    "invoiceNumber": "DC 239",
    "prNumber": "PR-JAD-0239",
    "prId": "pr-jad-0239",
    "date": "2025-12-20",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000239000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0239-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CSpLME0rGwFXK4lIVW6chPKgpQn99p0H=w1200"
  },
  {
    "id": "dc-jad-0240",
    "dcNumber": "DC 240",
    "invoiceNumber": "DC 240",
    "prNumber": "PR-JAD-0240",
    "prId": "pr-jad-0240",
    "date": "2025-12-23",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000240000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0240-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Y0VXKx3AwlbthBgLw_8Tg7t-ErCMU--H=w1200"
  },
  {
    "id": "dc-jad-0241",
    "dcNumber": "DC 241",
    "invoiceNumber": "DC 241",
    "prNumber": "PR-JAD-0241",
    "prId": "pr-jad-0241",
    "date": "2026-06-01",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000241000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0241-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #804)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "804",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Farm",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1cdOWoM5vzbCy0GSIHdRLtIR1w2JY8leo=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1bBAHNfpv8mMa8UX7ys27sxxOdm2lD9Sg=w1200"
  },
  {
    "id": "dc-jad-0242",
    "dcNumber": "DC 242",
    "invoiceNumber": "DC 242",
    "prNumber": "PR-JAD-0242",
    "prId": "pr-jad-0242",
    "date": "2025-12-27",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000242000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0242-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1HYCY8Md72EODca20-TwnvNK6nFkEyXoh=w1200"
  },
  {
    "id": "dc-jad-0243",
    "dcNumber": "DC 243",
    "invoiceNumber": "DC 243",
    "prNumber": "PR-JAD-0243",
    "prId": "pr-jad-0243",
    "date": "2026-06-01",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000243000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0243-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #805)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "805",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Farm",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/18JgW169DsGwd5qzFfQkMVMxcEYnK6FpI=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1k5nvmGEZURCKi0gEQDZVDPxyb0AyMeX3=w1200"
  },
  {
    "id": "dc-jad-0244",
    "dcNumber": "DC 244",
    "invoiceNumber": "DC 244",
    "prNumber": "PR-JAD-0244",
    "prId": "pr-jad-0244",
    "date": "2026-06-01",
    "siteName": "P.D Khan Fram",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000244000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0244-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Fram)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #292)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "292",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1YSxTC12UTSp1Ftf2rFqCRgycan8yS74f=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1dDDasRkew9bmRbO3cgBDPQq6INmvrc3U=w1200"
  },
  {
    "id": "dc-jad-0245",
    "dcNumber": "DC 245",
    "invoiceNumber": "DC 245",
    "prNumber": "PR-JAD-0245",
    "prId": "pr-jad-0245",
    "date": "2026-08-01",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000245000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0245-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Kcm1svqazHkfxb4AMOHFf3YcnLVUf7K9=w1200"
  },
  {
    "id": "dc-jad-0246",
    "dcNumber": "DC 246",
    "invoiceNumber": "DC 246",
    "prNumber": "PR-JAD-0246",
    "prId": "pr-jad-0246",
    "date": "2026-09-01",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000246000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0246-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1fmxRP8qLeYm7FKbBibbUtYbwSAczuqqL=w1200"
  },
  {
    "id": "dc-jad-0247",
    "dcNumber": "DC 247",
    "invoiceNumber": "DC 247",
    "prNumber": "PR-JAD-0247",
    "prId": "pr-jad-0247",
    "date": "2026-10-01",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000247000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0247-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1xC3Opr3uCxVwBTg-CQUVYazO-x-Dlv-P=w1200"
  },
  {
    "id": "dc-jad-0248",
    "dcNumber": "DC 248",
    "invoiceNumber": "DC 248",
    "prNumber": "PR-JAD-0248",
    "prId": "pr-jad-0248",
    "date": "2026-01-13",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000248000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0248-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uPG7WpB5hrWkHB7x91KsIuJdDcfG9E25=w1200"
  },
  {
    "id": "dc-jad-0249",
    "dcNumber": "DC 249",
    "invoiceNumber": "DC 249",
    "prNumber": "PR-JAD-0249",
    "prId": "pr-jad-0249",
    "date": "2026-01-13",
    "siteName": "Chicks Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000249000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0249-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #852776)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "852776",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Chicks",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1I3bVuYAEaY6BMcE4Eu4qBL7Syk6_mc5y=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1cl913cpYzgA4ey8nvLKkI_XGJWHC41Dt=w1200"
  },
  {
    "id": "dc-jad-0250",
    "dcNumber": "DC 250",
    "invoiceNumber": "DC 250",
    "prNumber": "PR-JAD-0250",
    "prId": "pr-jad-0250",
    "date": "2026-01-14",
    "siteName": "Farm Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000250000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0250-1",
        "itemName": "Electrical Supplies & Consumables (Farm Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/184D41Tx--JlVVDqMTv41eL3--h8mXt3w=w1200"
  },
  {
    "id": "dc-jad-0251",
    "dcNumber": "DC 251",
    "invoiceNumber": "DC 251",
    "prNumber": "PR-JAD-0251",
    "prId": "pr-jad-0251",
    "date": "2026-01-14",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000251000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0251-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/172LP_MCkhKcOxDzdIkoPuTsabt8Gs70m=w1200"
  },
  {
    "id": "dc-jad-0252",
    "dcNumber": "DC 252",
    "invoiceNumber": "DC 252",
    "prNumber": "PR-JAD-0252",
    "prId": "pr-jad-0252",
    "date": "2026-01-14",
    "siteName": "Chicks Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000252000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0252-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6463)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6463",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Chicks",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1gU55OwTLznjSx6oeEHvpXJmvL_RijXoV=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1piDLIiT7PNmUZG2wBOf8fbcbAqY4SstH=w1200"
  },
  {
    "id": "dc-jad-0253",
    "dcNumber": "DC 253",
    "invoiceNumber": "DC 253",
    "prNumber": "PR-JAD-0253",
    "prId": "pr-jad-0253",
    "date": "2026-01-15",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000253000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0253-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1BdKy9CMTMnWTdjXNJVrvLA8NYWC3tn7S=w1200"
  },
  {
    "id": "dc-jad-0254",
    "dcNumber": "DC 254",
    "invoiceNumber": "DC 254",
    "prNumber": "PR-JAD-0254",
    "prId": "pr-jad-0254",
    "date": "2026-01-17",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000254000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0254-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jvnyz0_Rbb50Pd_aGiOI1S9YMaf_J0fN=w1200"
  },
  {
    "id": "dc-jad-0255",
    "dcNumber": "DC 255",
    "invoiceNumber": "DC 255",
    "prNumber": "PR-JAD-0255",
    "prId": "pr-jad-0255",
    "date": "2026-01-17",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000255000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0255-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1u8wbrRyiyLzVMbgKRP-7eQhtXgsvB1gA=w1200"
  },
  {
    "id": "dc-jad-0256",
    "dcNumber": "DC 256",
    "invoiceNumber": "DC 256",
    "prNumber": "PR-JAD-0256",
    "prId": "pr-jad-0256",
    "date": "2026-01-20",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000256000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0256-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #856170)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "856170",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Feed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1ym48EpynFCxycG97pXz5Ap1VmrEtPCs4=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/10FJ9XKnsfVMxl0-j7P_1z1mZlm7mNWQN=w1200"
  },
  {
    "id": "dc-jad-0257",
    "dcNumber": "DC 257",
    "invoiceNumber": "DC 257",
    "prNumber": "PR-JAD-0257",
    "prId": "pr-jad-0257",
    "date": "2026-01-26",
    "siteName": "Madrasa Mian Channu",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000257000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0257-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Mian Channu)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/14goG1LJBsOoivfjfsxEhTLvdMJEdKKz2=w1200"
  },
  {
    "id": "dc-jad-0258",
    "dcNumber": "DC 258",
    "invoiceNumber": "DC 258",
    "prNumber": "PR-JAD-0258",
    "prId": "pr-jad-0258",
    "date": "2026-01-31",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000258000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0258-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/12PsduTsAJapjArsRq4f--Le8RNyA5ry3=w1200"
  },
  {
    "id": "dc-jad-0259",
    "dcNumber": "DC 259",
    "invoiceNumber": "DC 259",
    "prNumber": "PR-JAD-0259",
    "prId": "pr-jad-0259",
    "date": "2026-02-02",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000259000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0259-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1I908Js32c16hASvAkPAOGfORiSQDzuct=w1200"
  },
  {
    "id": "dc-jad-0260",
    "dcNumber": "DC 260",
    "invoiceNumber": "DC 260",
    "prNumber": "PR-JAD-0260",
    "prId": "pr-jad-0260",
    "date": "2026-02-02",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000260000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0260-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1t7mBxKIsti27aTj1vXr00zYBuVbA60LB=w1200"
  },
  {
    "id": "dc-jad-0261",
    "dcNumber": "DC 261",
    "invoiceNumber": "DC 261",
    "prNumber": "PR-JAD-0261",
    "prId": "pr-jad-0261",
    "date": "2026-03-02",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000261000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0261-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZGl9QA-8nz7_MEB8gTtCzDiD5IG9myip=w1200"
  },
  {
    "id": "dc-jad-0262",
    "dcNumber": "DC 262",
    "invoiceNumber": "DC 262",
    "prNumber": "PR-JAD-0262",
    "prId": "pr-jad-0262",
    "date": "2026-04-02",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000262000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0262-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FBeB_UDxrAB944-IqkoRr8b3ZNgDd9Ce=w1200"
  },
  {
    "id": "dc-jad-0263",
    "dcNumber": "DC 263",
    "invoiceNumber": "DC 263",
    "prNumber": "PR-JAD-0263",
    "prId": "pr-jad-0263",
    "date": "2026-04-02",
    "siteName": "WareHouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000263000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0263-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FBVpBl1G9JDunbOMCLo-Szn3Y0LfGhKC=w1200"
  },
  {
    "id": "dc-jad-0264",
    "dcNumber": "DC 264",
    "invoiceNumber": "DC 264",
    "prNumber": "PR-JAD-0264",
    "prId": "pr-jad-0264",
    "date": "2026-04-02",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000264000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0264-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_NsKRUmYX1Q9vgfQT-yUOMM_cMJI7gM6=w1200"
  },
  {
    "id": "dc-jad-0265",
    "dcNumber": "DC 265",
    "invoiceNumber": "DC 265",
    "prNumber": "PR-JAD-0265",
    "prId": "pr-jad-0265",
    "date": "2026-05-02",
    "siteName": "Madrasa Mian Channu",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000265000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0265-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Mian Channu)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Lz2QfgdQTMj6qMBTGKUhC8khdGDqpIQC=w1200"
  },
  {
    "id": "dc-jad-0266",
    "dcNumber": "DC 266",
    "invoiceNumber": "DC 266",
    "prNumber": "PR-JAD-0266",
    "prId": "pr-jad-0266",
    "date": "2026-06-02",
    "siteName": "Madrasa Mian Channu",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000266000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0266-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Mian Channu)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1PDLN4CQTr21uwQzUNuP8JYwZLwMIWK9M=w1200"
  },
  {
    "id": "dc-jad-0267",
    "dcNumber": "DC 267",
    "invoiceNumber": "DC 267",
    "prNumber": "PR-JAD-0267",
    "prId": "pr-jad-0267",
    "date": "2026-11-02",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000267000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0267-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1sR2IBIOzGEhTZTTd1u_FpLdkZmiXli6b=w1200"
  },
  {
    "id": "dc-jad-0268",
    "dcNumber": "DC 268",
    "invoiceNumber": "DC 268",
    "prNumber": "PR-JAD-0268",
    "prId": "pr-jad-0268",
    "date": "2026-11-02",
    "siteName": "Farm P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000268000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0268-1",
        "itemName": "Electrical Supplies & Consumables (Farm P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iURGJEU-rGO1MplWSng8Lf_XcR6wpEmI=w1200"
  },
  {
    "id": "dc-jad-0269",
    "dcNumber": "DC 269",
    "invoiceNumber": "DC 269",
    "prNumber": "PR-JAD-0269",
    "prId": "pr-jad-0269",
    "date": "2026-11-02",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000269000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0269-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_A-UqZiKM47G88OoRy193fU3oKS2omfa=w1200"
  },
  {
    "id": "dc-jad-0270",
    "dcNumber": "DC 270",
    "invoiceNumber": "DC 270",
    "prNumber": "PR-JAD-0270",
    "prId": "pr-jad-0270",
    "date": "2026-12-02",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000270000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0270-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hr5uTMkdWY6wQizJESDxSPU8Zk-SiFh8=w1200"
  },
  {
    "id": "dc-jad-0271",
    "dcNumber": "DC 271",
    "invoiceNumber": "DC 271",
    "prNumber": "PR-JAD-0271",
    "prId": "pr-jad-0271",
    "date": "2026-12-02",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000271000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0271-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #7354)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "7354",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Head",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1ZvG7G0I_FtNG0xdCtXN7H37kFoAXqSPg=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1sqMLWQZs7gOIaMdYsqrt9ZA3z9va_lyl=w1200"
  },
  {
    "id": "dc-jad-0272",
    "dcNumber": "DC 272",
    "invoiceNumber": "DC 272",
    "prNumber": "PR-JAD-0272",
    "prId": "pr-jad-0272",
    "date": "2026-12-02",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000272000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0272-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1UVuNyZ-xpBofVnGRGhC6rodwxvmAXkaX=w1200"
  },
  {
    "id": "dc-jad-0273",
    "dcNumber": "DC 273",
    "invoiceNumber": "DC 273",
    "prNumber": "PR-JAD-0273",
    "prId": "pr-jad-0273",
    "date": "2026-02-13",
    "siteName": "Farm P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000273000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0273-1",
        "itemName": "Electrical Supplies & Consumables (Farm P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EF9mJfTVqW2HKTnNE44Gvj149ooDXPRF=w1200"
  },
  {
    "id": "dc-jad-0274",
    "dcNumber": "DC 274",
    "invoiceNumber": "DC 274",
    "prNumber": "PR-JAD-0274",
    "prId": "pr-jad-0274",
    "date": "2026-02-14",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000274000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0274-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Cuqz_44zEkYDiV5TClDmW3Io801rBr-E=w1200"
  },
  {
    "id": "dc-jad-0275",
    "dcNumber": "DC 275",
    "invoiceNumber": "DC 275",
    "prNumber": "PR-JAD-0275",
    "prId": "pr-jad-0275",
    "date": "2026-02-16",
    "siteName": "GP-1 Farm Bhalwal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000275000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0275-1",
        "itemName": "Electrical Supplies & Consumables (GP-1 Farm Bhalwal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1by1B8AsDKez9BVg-zKsG9qJa8gzN9JiF=w1200"
  },
  {
    "id": "dc-jad-0276",
    "dcNumber": "DC 276",
    "invoiceNumber": "DC 276",
    "prNumber": "PR-JAD-0276",
    "prId": "pr-jad-0276",
    "date": "2026-02-17",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000276000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0276-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1l3TWYyzb-vFYtjp5TO7BSLDkmFmcc3TF=w1200"
  },
  {
    "id": "dc-jad-0277",
    "dcNumber": "DC 277",
    "invoiceNumber": "DC 277",
    "prNumber": "PR-JAD-0277",
    "prId": "pr-jad-0277",
    "date": "2026-02-17",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000277000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0277-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1t1fkP6TkMxrwoZ_q8N4pcj3ZmEqLByz6=w1200"
  },
  {
    "id": "dc-jad-0278",
    "dcNumber": "DC 278",
    "invoiceNumber": "DC 278",
    "prNumber": "PR-JAD-0278",
    "prId": "pr-jad-0278",
    "date": "2026-02-19",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000278000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0278-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/147Svp8KPbR_ReIA_4vpgUr4NCWeNLeyp=w1200"
  },
  {
    "id": "dc-jad-0279",
    "dcNumber": "DC 279",
    "invoiceNumber": "DC 279",
    "prNumber": "PR-JAD-0279",
    "prId": "pr-jad-0279",
    "date": "2026-02-19",
    "siteName": "Infinity Store C-2 Bahria",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000279000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0279-1",
        "itemName": "Electrical Supplies & Consumables (Infinity Store C-2 Bahria)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1JZJMRYHYKIR27sRuIk5qfoBdaJb0mrYJ=w1200"
  },
  {
    "id": "dc-jad-0280",
    "dcNumber": "DC 280",
    "invoiceNumber": "DC 280",
    "prNumber": "PR-JAD-0280",
    "prId": "pr-jad-0280",
    "date": "2026-02-19",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000280000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0280-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18Ky4dERts9DfBi46eZeyn4BtYn_Vrw7u=w1200"
  },
  {
    "id": "dc-jad-0281",
    "dcNumber": "DC 281",
    "invoiceNumber": "DC 281",
    "prNumber": "PR-JAD-0281",
    "prId": "pr-jad-0281",
    "date": "2026-02-19",
    "siteName": "House 8, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000281000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0281-1",
        "itemName": "Electrical Supplies & Consumables (House 8, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1DrtQkZVnrRz3rz4ZKTqEOwPw43Zd5ENt=w1200"
  },
  {
    "id": "dc-jad-0282",
    "dcNumber": "DC 282",
    "invoiceNumber": "DC 282",
    "prNumber": "PR-JAD-0282",
    "prId": "pr-jad-0282",
    "date": "2026-02-20",
    "siteName": "Farm P.D Khan",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000282000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0282-1",
        "itemName": "Electrical Supplies & Consumables (Farm P.D Khan)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CDjXOyEJpRPFV1scryx8RpjT8ZkBfvew=w1200"
  },
  {
    "id": "dc-jad-0283",
    "dcNumber": "DC 283",
    "invoiceNumber": "DC 283",
    "prNumber": "PR-JAD-0283",
    "prId": "pr-jad-0283",
    "date": "2026-02-24",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000283000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0283-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1f0LsXOEuwM-AJdpv8UMwuGo2sXBccU2H=w1200"
  },
  {
    "id": "dc-jad-0284",
    "dcNumber": "DC 284",
    "invoiceNumber": "DC 284",
    "prNumber": "PR-JAD-0284",
    "prId": "pr-jad-0284",
    "date": "2026-02-23",
    "siteName": "House 10, F-6/3 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000284000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0284-1",
        "itemName": "Electrical Supplies & Consumables (House 10, F-6/3 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RY84iz25zzV-uOc8uudZo7ye6frralRR=w1200"
  },
  {
    "id": "dc-jad-0285",
    "dcNumber": "DC 285",
    "invoiceNumber": "DC 285",
    "prNumber": "PR-JAD-0285",
    "prId": "pr-jad-0285",
    "date": "2026-02-25",
    "siteName": "KHanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000285000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0285-1",
        "itemName": "Electrical Supplies & Consumables (KHanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15VpYD0cDAiWpyoh8kMOaou4ldeMAKYBV=w1200"
  },
  {
    "id": "dc-jad-0286",
    "dcNumber": "DC 286",
    "invoiceNumber": "DC 286",
    "prNumber": "PR-JAD-0286",
    "prId": "pr-jad-0286",
    "date": "2026-02-25",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000286000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0286-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1rFds8jXlyNtzFcddhVQx5tk7qsCbZVwy=w1200"
  },
  {
    "id": "dc-jad-0287",
    "dcNumber": "DC 287",
    "invoiceNumber": "DC 287",
    "prNumber": "PR-JAD-0287",
    "prId": "pr-jad-0287",
    "date": "2026-02-26",
    "siteName": "Jungle Maryala Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000287000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0287-1",
        "itemName": "Electrical Supplies & Consumables (Jungle Maryala Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1V-TdGJeEqXauSyhEzRzxkPBH8E_0WYc3=w1200"
  },
  {
    "id": "dc-jad-0288",
    "dcNumber": "DC 288",
    "invoiceNumber": "DC 288",
    "prNumber": "PR-JAD-0288",
    "prId": "pr-jad-0288",
    "date": "2026-02-27",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000288000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0288-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IepopoS5l8DSlU4AGAPwmYBAzhhkvLpC=w1200"
  },
  {
    "id": "dc-jad-0289",
    "dcNumber": "DC 289",
    "invoiceNumber": "DC 289",
    "prNumber": "PR-JAD-0289",
    "prId": "pr-jad-0289",
    "date": "2026-02-28",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000289000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0289-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8996)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8996",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Farm",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1KBc3pyfDyA3gRET94lxcF1NwJzbThW6t=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1XD29hillFdmU6f5K1991qmmaxyrTy9el=w1200"
  },
  {
    "id": "dc-jad-0290",
    "dcNumber": "DC 290",
    "invoiceNumber": "DC 290",
    "prNumber": "PR-JAD-0290",
    "prId": "pr-jad-0290",
    "date": "2026-03-03",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000290000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0290-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1MKLQs8bvyeqyF1ybWLEMRZ2_sK4QtqQI=w1200"
  },
  {
    "id": "dc-jad-0291",
    "dcNumber": "DC 291",
    "invoiceNumber": "DC 291",
    "prNumber": "PR-JAD-0291",
    "prId": "pr-jad-0291",
    "date": "2026-03-03",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000291000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0291-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bNKxKH9iqBedsS5ZTw6sToJwxLmEzCN8=w1200"
  },
  {
    "id": "dc-jad-0292",
    "dcNumber": "DC 292",
    "invoiceNumber": "DC 292",
    "prNumber": "PR-JAD-0292",
    "prId": "pr-jad-0292",
    "date": "2026-03-03",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000292000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0292-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #604)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "604",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Farm",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1-URAsJ7NGCeNcNqgMNKVYifzOm_TuKir=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1HXogND5uM_YJPGWMgoc6lfaLKVozdpmm=w1200"
  },
  {
    "id": "dc-jad-0293",
    "dcNumber": "DC 293",
    "invoiceNumber": "DC 293",
    "prNumber": "PR-JAD-0293",
    "prId": "pr-jad-0293",
    "date": "2026-03-03",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000293000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0293-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_WUNH3jE3mM04vQhI609LFkuWCYkt7fN=w1200"
  },
  {
    "id": "dc-jad-0294",
    "dcNumber": "DC 294",
    "invoiceNumber": "DC 294",
    "prNumber": "PR-JAD-0294",
    "prId": "pr-jad-0294",
    "date": "2026-05-03",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000294000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0294-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16nSrycLEuj2GWI4yhbm1EyHBc2YyD7SD=w1200"
  },
  {
    "id": "dc-jad-0295",
    "dcNumber": "DC 295",
    "invoiceNumber": "DC 295",
    "prNumber": "PR-JAD-0295",
    "prId": "pr-jad-0295",
    "date": "2026-05-03",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000295000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0295-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CR7jSU-wyK9eT0DJZGTZwzbAHUHxzft7=w1200"
  },
  {
    "id": "dc-jad-0296",
    "dcNumber": "DC 296",
    "invoiceNumber": "DC 296",
    "prNumber": "PR-JAD-0296",
    "prId": "pr-jad-0296",
    "date": "2026-05-03",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000296000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0296-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1LP5HPjWCgCkN_lkzhKLOe_-VmDmLrD39=w1200"
  },
  {
    "id": "dc-jad-0297",
    "dcNumber": "DC 297",
    "invoiceNumber": "DC 297",
    "prNumber": "PR-JAD-0297",
    "prId": "pr-jad-0297",
    "date": "2026-06-03",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000297000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0297-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1sDvbJCvEF07km5C1hj5OpQF0tXERDcir=w1200"
  },
  {
    "id": "dc-jad-0298",
    "dcNumber": "DC 298",
    "invoiceNumber": "DC 298",
    "prNumber": "PR-JAD-0298",
    "prId": "pr-jad-0298",
    "date": "2026-06-03",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000298000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0298-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1i6YA0eKiq6m7UdBdtE4qx_QGzegzg6_C=w1200"
  },
  {
    "id": "dc-jad-0299",
    "dcNumber": "DC 299",
    "invoiceNumber": "DC 299",
    "prNumber": "PR-JAD-0299",
    "prId": "pr-jad-0299",
    "date": "2026-06-03",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000299000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0299-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1egwzOBdngA_n6tBSkK569BQr1zWCwG92=w1200"
  },
  {
    "id": "dc-jad-0300",
    "dcNumber": "DC 300",
    "invoiceNumber": "DC 300",
    "prNumber": "PR-JAD-0300",
    "prId": "pr-jad-0300",
    "date": "2026-06-03",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000300000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0300-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WC5GgV3_3mRHFmLJWeZKM6vNxM4655F3=w1200"
  },
  {
    "id": "dc-jad-0301",
    "dcNumber": "DC 301",
    "invoiceNumber": "DC 301",
    "prNumber": "PR-JAD-0301",
    "prId": "pr-jad-0301",
    "date": "2026-06-03",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000301000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0301-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Rexp4-aVoxPcqdcvkTQwo6-2yrT8Eyuz=w1200"
  },
  {
    "id": "dc-jad-0302",
    "dcNumber": "DC 302",
    "invoiceNumber": "DC 302",
    "prNumber": "PR-JAD-0302",
    "prId": "pr-jad-0302",
    "date": "2026-06-03",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000302000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0302-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #853703)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "853703",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Hatchery",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1dntcCkArbxIqakMSZiNXU_MaDGdvtsug=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/12v00nwXnCHKhJp7nYXObSVbjqAcOd5EW=w1200"
  },
  {
    "id": "dc-jad-0303",
    "dcNumber": "DC 303",
    "invoiceNumber": "DC 303",
    "prNumber": "PR-JAD-0303",
    "prId": "pr-jad-0303",
    "date": "2026-07-03",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000303000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0303-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RfuvtEi2IweDZ6I8GsoULQ01jFpm0Sfs=w1200"
  },
  {
    "id": "dc-jad-0304",
    "dcNumber": "DC 304",
    "invoiceNumber": "DC 304",
    "prNumber": "PR-JAD-0304",
    "prId": "pr-jad-0304",
    "date": "2026-09-03",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000304000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0304-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1zkP-JlIXPlaohBQZcJzc5LLQ5Jv1qJfc=w1200"
  },
  {
    "id": "dc-jad-0305",
    "dcNumber": "DC 305",
    "invoiceNumber": "DC 305",
    "prNumber": "PR-JAD-0305",
    "prId": "pr-jad-0305",
    "date": "2026-09-03",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000305000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0305-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uXuOy3toUgR4HYjHkRBRgJeDsVb60EPc=w1200"
  },
  {
    "id": "dc-jad-0306",
    "dcNumber": "DC 306",
    "invoiceNumber": "DC 306",
    "prNumber": "PR-JAD-0306",
    "prId": "pr-jad-0306",
    "date": "2026-09-03",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000306000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0306-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #9790)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "9790",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Chicks",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1jDb8VMncUcHSkHaYZuMIiqqaeJ2sIv70=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1nJepfO-W7v0lT5oh--f9eKwd9snJGjaY=w1200"
  },
  {
    "id": "dc-jad-0307",
    "dcNumber": "DC 307",
    "invoiceNumber": "DC 307",
    "prNumber": "PR-JAD-0307",
    "prId": "pr-jad-0307",
    "date": "2026-09-03",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000307000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0307-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #4554)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "4554",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/166swS0WXQ9ttyG55s9q0cwcuoMKdyIVU=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1s-czolyjTNtaNZdr-Orob2sy1iaVTBlB=w1200"
  },
  {
    "id": "dc-jad-0308",
    "dcNumber": "DC 308",
    "invoiceNumber": "DC 308",
    "prNumber": "PR-JAD-0308",
    "prId": "pr-jad-0308",
    "date": "2026-09-03",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000308000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0308-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18Ws_eLY1azthGMT5RWjMREILd5eK51fR=w1200"
  },
  {
    "id": "dc-jad-0309",
    "dcNumber": "DC 309",
    "invoiceNumber": "DC 309",
    "prNumber": "PR-JAD-0309",
    "prId": "pr-jad-0309",
    "date": "2026-10-03",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000309000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0309-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1x6wWlDi81y-9C2sY7fxk2frgbTMlcRhr=w1200"
  },
  {
    "id": "dc-jad-0310",
    "dcNumber": "DC 310",
    "invoiceNumber": "DC 310",
    "prNumber": "PR-JAD-0310",
    "prId": "pr-jad-0310",
    "date": "2026-10-03",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000310000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0310-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/12i7vEYebF8E_4sFHQQkMx5RlXRyEOvIP=w1200"
  },
  {
    "id": "dc-jad-0311",
    "dcNumber": "DC 311",
    "invoiceNumber": "DC 311",
    "prNumber": "PR-JAD-0311",
    "prId": "pr-jad-0311",
    "date": "2026-10-03",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000311000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0311-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_0xIAKCGiXgKSTGNkrvICUdAP0zICoP3=w1200"
  },
  {
    "id": "dc-jad-0312",
    "dcNumber": "DC 312",
    "invoiceNumber": "DC 312",
    "prNumber": "PR-JAD-0312",
    "prId": "pr-jad-0312",
    "date": "2026-10-03",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000312000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0312-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WGhOa9FKe0Xjd7TK6igcHu5I1ShA-_30=w1200"
  },
  {
    "id": "dc-jad-0313",
    "dcNumber": "DC 313",
    "invoiceNumber": "DC 313",
    "prNumber": "PR-JAD-0313",
    "prId": "pr-jad-0313",
    "date": "2026-11-03",
    "siteName": "Madrasa Mian Channu",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000313000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0313-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Mian Channu)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RLBhXYcXX9AiIn6x0LS7_80oAbsTp6Bk=w1200"
  },
  {
    "id": "dc-jad-0314",
    "dcNumber": "DC 314",
    "invoiceNumber": "DC 314",
    "prNumber": "PR-JAD-0314",
    "prId": "pr-jad-0314",
    "date": "2026-11-03",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000314000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0314-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1d6SWFR1EBgrk0pufX74Cib263cAFq5sb=w1200"
  },
  {
    "id": "dc-jad-0315",
    "dcNumber": "DC 315",
    "invoiceNumber": "DC 315",
    "prNumber": "PR-JAD-0315",
    "prId": "pr-jad-0315",
    "date": "2026-12-03",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000315000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0315-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EikWVI5AdRFFUgRVuIPubgX3uiUhWdhS=w1200"
  },
  {
    "id": "dc-jad-0316",
    "dcNumber": "DC 316",
    "invoiceNumber": "DC 316",
    "prNumber": "PR-JAD-0316",
    "prId": "pr-jad-0316",
    "date": "2026-12-03",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000316000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0316-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1W89dX0ZK6Ln0XU_FmKYsfjroab2Z-U1E=w1200"
  },
  {
    "id": "dc-jad-0317",
    "dcNumber": "DC 317",
    "invoiceNumber": "DC 317",
    "prNumber": "PR-JAD-0317",
    "prId": "pr-jad-0317",
    "date": "2026-12-03",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000317000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0317-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1thfsOlcKOaXtwyX2lCZ-lVndAJS0JW-F=w1200"
  },
  {
    "id": "dc-jad-0318",
    "dcNumber": "DC 318",
    "invoiceNumber": "DC 318",
    "prNumber": "PR-JAD-0318",
    "prId": "pr-jad-0318",
    "date": "2026-12-03",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000318000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0318-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1CJjNe18GVne56MSE5DFcnN3vYarYeJMS=w1200"
  },
  {
    "id": "dc-jad-0319",
    "dcNumber": "DC 319",
    "invoiceNumber": "DC 319",
    "prNumber": "PR-JAD-0319",
    "prId": "pr-jad-0319",
    "date": "2026-12-03",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000319000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0319-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/13aJV099ziyXF4vKqRrrBevM1LJnzK_4F=w1200"
  },
  {
    "id": "dc-jad-0320",
    "dcNumber": "DC 320",
    "invoiceNumber": "DC 320",
    "prNumber": "PR-JAD-0320",
    "prId": "pr-jad-0320",
    "date": "2026-12-03",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000320000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0320-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WoKC5GoqLrJE7n51rnKRTgipzgT4FFOm=w1200"
  },
  {
    "id": "dc-jad-0321",
    "dcNumber": "DC 321",
    "invoiceNumber": "DC 321",
    "prNumber": "PR-JAD-0321",
    "prId": "pr-jad-0321",
    "date": "2026-12-03",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000321000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0321-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IdjEAILyYge9TI1q8nwWS6bgI4DdtdaA=w1200"
  },
  {
    "id": "dc-jad-0322",
    "dcNumber": "DC 322",
    "invoiceNumber": "DC 322",
    "prNumber": "PR-JAD-0322",
    "prId": "pr-jad-0322",
    "date": "2026-03-13",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000322000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0322-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1fL0IVnGjz-aTK12sl2X3guX6KZ2VjiAa=w1200"
  },
  {
    "id": "dc-jad-0323",
    "dcNumber": "DC 323",
    "invoiceNumber": "DC 323",
    "prNumber": "PR-JAD-0323",
    "prId": "pr-jad-0323",
    "date": "2026-03-13",
    "siteName": "Mosque Chak-17 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000323000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0323-1",
        "itemName": "Electrical Supplies & Consumables (Mosque Chak-17 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1wGkkl3-GLFbkrFb7oL7tmqztsDj6hqDn=w1200"
  },
  {
    "id": "dc-jad-0324",
    "dcNumber": "DC 324",
    "invoiceNumber": "DC 324",
    "prNumber": "PR-JAD-0324",
    "prId": "pr-jad-0324",
    "date": "2026-03-14",
    "siteName": "KHanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000324000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0324-1",
        "itemName": "Electrical Supplies & Consumables (KHanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1y33oF2Zqker9swH35PnWz4CwuVU1fWlN=w1200"
  },
  {
    "id": "dc-jad-0325",
    "dcNumber": "DC 325",
    "invoiceNumber": "DC 325",
    "prNumber": "PR-JAD-0325",
    "prId": "pr-jad-0325",
    "date": "2026-03-14",
    "siteName": "House 28 F-6/3 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000325000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0325-1",
        "itemName": "Electrical Supplies & Consumables (House 28 F-6/3 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_ghEqHukonQf7QMH6tMnjqnVBaUojrbc=w1200"
  },
  {
    "id": "dc-jad-0326",
    "dcNumber": "DC 326",
    "invoiceNumber": "DC 326",
    "prNumber": "PR-JAD-0326",
    "prId": "pr-jad-0326",
    "date": "2026-03-14",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000326000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0326-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/13LuN8ttdLvuP3enjxf9A3IlLLxxHiEWM=w1200"
  },
  {
    "id": "dc-jad-0327",
    "dcNumber": "DC 327",
    "invoiceNumber": "DC 327",
    "prNumber": "PR-JAD-0327",
    "prId": "pr-jad-0327",
    "date": "2026-03-16",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000327000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0327-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uLPvjufY_QgAIEirZAH8Y4-62gBBkXiq=w1200"
  },
  {
    "id": "dc-jad-0328",
    "dcNumber": "DC 328",
    "invoiceNumber": "DC 328",
    "prNumber": "PR-JAD-0328",
    "prId": "pr-jad-0328",
    "date": "2026-03-16",
    "siteName": "Agri Farm Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000328000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0328-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1YUlppAa6F8sa48wa9chj0I_0Ao4kXNfP=w1200"
  },
  {
    "id": "dc-jad-0329",
    "dcNumber": "DC 329",
    "invoiceNumber": "DC 329",
    "prNumber": "PR-JAD-0329",
    "prId": "pr-jad-0329",
    "date": "2026-03-16",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000329000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0329-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1K9ZPR9_0SHS8uLZWNxDvfyui3KwwUsa4=w1200"
  },
  {
    "id": "dc-jad-0330",
    "dcNumber": "DC 330",
    "invoiceNumber": "DC 330",
    "prNumber": "PR-JAD-0330",
    "prId": "pr-jad-0330",
    "date": "2026-03-17",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000330000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0330-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1SEWrsyVX9YBT2fhhksjv7x4xjQBIsZ5L=w1200"
  },
  {
    "id": "dc-jad-0331",
    "dcNumber": "DC 331",
    "invoiceNumber": "DC 331",
    "prNumber": "PR-JAD-0331",
    "prId": "pr-jad-0331",
    "date": "2026-03-18",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000331000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0331-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IzAtqLKsNZHvaVka3hfk-nHBwIYhoNyU=w1200"
  },
  {
    "id": "dc-jad-0332",
    "dcNumber": "DC 332",
    "invoiceNumber": "DC 332",
    "prNumber": "PR-JAD-0332",
    "prId": "pr-jad-0332",
    "date": "2026-03-18",
    "siteName": "P.D Khan Fram",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000332000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0332-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Fram)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1x8ny8R_40ThvKag0Ksk59ZlaihoaYd7y=w1200"
  },
  {
    "id": "dc-jad-0333",
    "dcNumber": "DC 333",
    "invoiceNumber": "DC 333",
    "prNumber": "PR-JAD-0333",
    "prId": "pr-jad-0333",
    "date": "2026-03-18",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000333000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0333-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1muyphuhxw1oD6g4k1vGM1_ovlNVGGrSm=w1200"
  },
  {
    "id": "dc-jad-0334",
    "dcNumber": "DC 334",
    "invoiceNumber": "DC 334",
    "prNumber": "PR-JAD-0334",
    "prId": "pr-jad-0334",
    "date": "2026-03-18",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000334000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0334-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1vXaAkN5IYlsAD6_6T1jNGDbSarXfv6BG=w1200"
  },
  {
    "id": "dc-jad-0335",
    "dcNumber": "DC 335",
    "invoiceNumber": "DC 335",
    "prNumber": "PR-JAD-0335",
    "prId": "pr-jad-0335",
    "date": "2026-03-19",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000335000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0335-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NvRHzn3PF2_PRGaSmRcCq6s01bRn9nl4=w1200"
  },
  {
    "id": "dc-jad-0336",
    "dcNumber": "DC 336",
    "invoiceNumber": "DC 336",
    "prNumber": "PR-JAD-0336",
    "prId": "pr-jad-0336",
    "date": "2026-03-19",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000336000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0336-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZQao_3lc3lg5s9h9ypnqSoxAbfudoERJ=w1200"
  },
  {
    "id": "dc-jad-0337",
    "dcNumber": "DC 337",
    "invoiceNumber": "DC 337",
    "prNumber": "PR-JAD-0337",
    "prId": "pr-jad-0337",
    "date": "2026-03-19",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000337000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0337-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1lO-mFESlZ2JqKqeByyxe3mSN-yv-OqnZ=w1200"
  },
  {
    "id": "dc-jad-0338",
    "dcNumber": "DC 338",
    "invoiceNumber": "DC 338",
    "prNumber": "PR-JAD-0338",
    "prId": "pr-jad-0338",
    "date": "2026-03-25",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000338000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0338-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1tklwvfk2InO3OICkoPtNp5Oz_5X8g93W=w1200"
  },
  {
    "id": "dc-jad-0339",
    "dcNumber": "DC 339",
    "invoiceNumber": "DC 339",
    "prNumber": "PR-JAD-0339",
    "prId": "pr-jad-0339",
    "date": "2026-03-25",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000339000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0339-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mswn_TeYe_s-NoA6QOu10vbXVtFTVo7r=w1200"
  },
  {
    "id": "dc-jad-0340",
    "dcNumber": "DC 340",
    "invoiceNumber": "DC 340",
    "prNumber": "PR-JAD-0340",
    "prId": "pr-jad-0340",
    "date": "2026-03-25",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000340000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0340-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/10-V-IvpPF33UWB7wW5vBdY3cCHHoIujU=w1200"
  },
  {
    "id": "dc-jad-0341",
    "dcNumber": "DC 341",
    "invoiceNumber": "DC 341",
    "prNumber": "PR-JAD-0341",
    "prId": "pr-jad-0341",
    "date": "2026-03-28",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000341000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0341-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-JzIo5Vsh9oRn8DKXi8OMnnfM7bOpBJv=w1200"
  },
  {
    "id": "dc-jad-0342",
    "dcNumber": "DC 342",
    "invoiceNumber": "DC 342",
    "prNumber": "PR-JAD-0342",
    "prId": "pr-jad-0342",
    "date": "2026-03-28",
    "siteName": "Guest House",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000342000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0342-1",
        "itemName": "Electrical Supplies & Consumables (Guest House)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mSq5EihfDbUPu99rjhG3JCToxjxchabC=w1200"
  },
  {
    "id": "dc-jad-0343",
    "dcNumber": "DC 343",
    "invoiceNumber": "DC 343",
    "prNumber": "PR-JAD-0343",
    "prId": "pr-jad-0343",
    "date": "2026-02-04",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000343000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0343-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1g3aiIysp-uymGDCeXd8THosUKbIiM6zV=w1200"
  },
  {
    "id": "dc-jad-0344",
    "dcNumber": "DC 344",
    "invoiceNumber": "DC 344",
    "prNumber": "PR-JAD-0344",
    "prId": "pr-jad-0344",
    "date": "2026-03-31",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000344000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0344-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Z8B3ax6LE_5JrsslOI68YPvmcOW-lB63=w1200"
  },
  {
    "id": "dc-jad-0345",
    "dcNumber": "DC 345",
    "invoiceNumber": "DC 345",
    "prNumber": "PR-JAD-0345",
    "prId": "pr-jad-0345",
    "date": "2026-02-04",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000345000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0345-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1JdrwExsD0YSkf-v5G6DQeXL-dnXcdwiQ=w1200"
  },
  {
    "id": "dc-jad-0346",
    "dcNumber": "DC 346",
    "invoiceNumber": "DC 346",
    "prNumber": "PR-JAD-0346",
    "prId": "pr-jad-0346",
    "date": "2026-02-04",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000346000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0346-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1a4FQ7sZDpI83R3ZOqMdYjjEeXjwueCZO=w1200"
  },
  {
    "id": "dc-jad-0347",
    "dcNumber": "DC 347",
    "invoiceNumber": "DC 347",
    "prNumber": "PR-JAD-0347",
    "prId": "pr-jad-0347",
    "date": "2026-03-04",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000347000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0347-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-cxpGxLKlb-1MtwkjAY5z2cyFJ__g3Ew=w1200"
  },
  {
    "id": "dc-jad-0348",
    "dcNumber": "DC 348",
    "invoiceNumber": "DC 348",
    "prNumber": "PR-JAD-0348",
    "prId": "pr-jad-0348",
    "date": "2026-04-04",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000348000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0348-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19Hp7twrvI60FcR_ivWYFgsoq5-iED5v7=w1200"
  },
  {
    "id": "dc-jad-0349",
    "dcNumber": "DC 349",
    "invoiceNumber": "DC 349",
    "prNumber": "PR-JAD-0349",
    "prId": "pr-jad-0349",
    "date": "2026-08-04",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000349000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0349-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/13AMkKSHvWRL424zd4R73Ngj1WYxAWE9S=w1200"
  },
  {
    "id": "dc-jad-0350",
    "dcNumber": "DC 350",
    "invoiceNumber": "DC 350",
    "prNumber": "PR-JAD-0350",
    "prId": "pr-jad-0350",
    "date": "2026-08-04",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000350000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0350-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NancnBZMODuDhKZgHGCEHSXBaJA5TDQq=w1200"
  },
  {
    "id": "dc-jad-0351",
    "dcNumber": "DC 351",
    "invoiceNumber": "DC 351",
    "prNumber": "PR-JAD-0351",
    "prId": "pr-jad-0351",
    "date": "2026-08-04",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000351000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0351-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1hoolYqqMsEy-adWcWMdGjxz-imXVzpAF=w1200"
  },
  {
    "id": "dc-jad-0352",
    "dcNumber": "DC 352",
    "invoiceNumber": "DC 352",
    "prNumber": "PR-JAD-0352",
    "prId": "pr-jad-0352",
    "date": "2026-08-04",
    "siteName": "Agri Farm Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000352000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0352-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZoadvZtSZMQN38zItD0NLx_9RsAOYnog=w1200"
  },
  {
    "id": "dc-jad-0353",
    "dcNumber": "DC 353",
    "invoiceNumber": "DC 353",
    "prNumber": "PR-JAD-0353",
    "prId": "pr-jad-0353",
    "date": "2026-08-04",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000353000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0353-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1z3VAbUCn1JlKZQ-vFjinTEkPRHm_lfGD=w1200"
  },
  {
    "id": "dc-jad-0354",
    "dcNumber": "DC 354",
    "invoiceNumber": "DC 354",
    "prNumber": "PR-JAD-0354",
    "prId": "pr-jad-0354",
    "date": "2026-08-04",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000354000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0354-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_IdmyjQUzCgGr7MvDooyCoMFC-6hmNpj=w1200"
  },
  {
    "id": "dc-jad-0355",
    "dcNumber": "DC 355",
    "invoiceNumber": "DC 355",
    "prNumber": "PR-JAD-0355",
    "prId": "pr-jad-0355",
    "date": "2026-08-04",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000355000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0355-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/111K1SIjk_nsRBUeBLocHzjHipjyLZX-y=w1200"
  },
  {
    "id": "dc-jad-0356",
    "dcNumber": "DC 356",
    "invoiceNumber": "DC 356",
    "prNumber": "PR-JAD-0356",
    "prId": "pr-jad-0356",
    "date": "2026-08-04",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000356000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0356-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1W487_DqXJUgewcI2f7i1kTB4COxcp8ob=w1200"
  },
  {
    "id": "dc-jad-0357",
    "dcNumber": "DC 357",
    "invoiceNumber": "DC 357",
    "prNumber": "PR-JAD-0357",
    "prId": "pr-jad-0357",
    "date": "2026-08-04",
    "siteName": "Plot 35 Terial",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000357000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0357-1",
        "itemName": "Electrical Supplies & Consumables (Plot 35 Terial)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1e-OMcTj1wafnZlr_SZqAH8S7VrPXnCSy=w1200"
  },
  {
    "id": "dc-jad-0358",
    "dcNumber": "DC 358",
    "invoiceNumber": "DC 358",
    "prNumber": "PR-JAD-0358",
    "prId": "pr-jad-0358",
    "date": "2026-09-04",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000358000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0358-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1S894jP6T-FaDMameRDaCE-osbcMpKSuM=w1200"
  },
  {
    "id": "dc-jad-0359",
    "dcNumber": "DC 359",
    "invoiceNumber": "DC 359",
    "prNumber": "PR-JAD-0359",
    "prId": "pr-jad-0359",
    "date": "2026-09-04",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000359000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0359-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1N_e2JtzM-3mDgu4jyr42hbHaEtUX7hgQ=w1200"
  },
  {
    "id": "dc-jad-0360",
    "dcNumber": "DC 360",
    "invoiceNumber": "DC 360",
    "prNumber": "PR-JAD-0360",
    "prId": "pr-jad-0360",
    "date": "2026-09-04",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000360000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0360-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ajp2vNn1F_BOtIX8uwFPsrhrFR29ozL9=w1200"
  },
  {
    "id": "dc-jad-0361",
    "dcNumber": "DC 361",
    "invoiceNumber": "DC 361",
    "prNumber": "PR-JAD-0361",
    "prId": "pr-jad-0361",
    "date": "2026-09-04",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000361000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0361-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uxgq3y5PFwb5jhYA4nW4TeHUXB9daT0g=w1200"
  },
  {
    "id": "dc-jad-0362",
    "dcNumber": "DC 362",
    "invoiceNumber": "DC 362",
    "prNumber": "PR-JAD-0362",
    "prId": "pr-jad-0362",
    "date": "2026-04-13",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000362000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0362-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IDYp58gTYk2gk9iMjXjeLDrqwmJpYqSw=w1200"
  },
  {
    "id": "dc-jad-0363",
    "dcNumber": "DC 363",
    "invoiceNumber": "DC 363",
    "prNumber": "PR-JAD-0363",
    "prId": "pr-jad-0363",
    "date": "2026-04-13",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000363000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0363-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1G_1cwCnvn5EYIcvUdv50nrKKhYvr-f06=w1200"
  },
  {
    "id": "dc-jad-0364",
    "dcNumber": "DC 364",
    "invoiceNumber": "DC 364",
    "prNumber": "PR-JAD-0364",
    "prId": "pr-jad-0364",
    "date": "2026-04-13",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000364000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0364-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1-_zJaqpx0k9mkXWkhV1xqYv48ZtnXcJo=w1200"
  },
  {
    "id": "dc-jad-0365",
    "dcNumber": "DC 365",
    "invoiceNumber": "DC 365",
    "prNumber": "PR-JAD-0365",
    "prId": "pr-jad-0365",
    "date": "2026-04-14",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000365000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0365-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Bs2YBNj3PfQKiqCuS2mwWAosiNoiUbCB=w1200"
  },
  {
    "id": "dc-jad-0366",
    "dcNumber": "DC 366",
    "invoiceNumber": "DC 366",
    "prNumber": "PR-JAD-0366",
    "prId": "pr-jad-0366",
    "date": "2026-04-14",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000366000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0366-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8974)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8974",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Bahter",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1DsAc57FTDPZbpryvpClDwWmmn2R7ceJg=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1T32TEE8ZwtAg_NiUgHmrfMDqJpxXJAhJ=w1200"
  },
  {
    "id": "dc-jad-0367",
    "dcNumber": "DC 367",
    "invoiceNumber": "DC 367",
    "prNumber": "PR-JAD-0367",
    "prId": "pr-jad-0367",
    "date": "2026-04-14",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000367000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0367-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ikvCBYag2GS2wE22yAeeD1TVrfIU8fPO=w1200"
  },
  {
    "id": "dc-jad-0368",
    "dcNumber": "DC 368",
    "invoiceNumber": "DC 368",
    "prNumber": "PR-JAD-0368",
    "prId": "pr-jad-0368",
    "date": "2026-04-17",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000368000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0368-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1TsiT1eke-keg8T9DLt4NXk4YBJTCs_Xl=w1200"
  },
  {
    "id": "dc-jad-0369",
    "dcNumber": "DC 369",
    "invoiceNumber": "DC 369",
    "prNumber": "PR-JAD-0369",
    "prId": "pr-jad-0369",
    "date": "2026-04-17",
    "siteName": "Battal Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000369000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0369-1",
        "itemName": "Electrical Supplies & Consumables (Battal Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1qCZ8rJSJjQD52opDx2RjQn6p_UC9u0At=w1200"
  },
  {
    "id": "dc-jad-0370",
    "dcNumber": "DC 370",
    "invoiceNumber": "DC 370",
    "prNumber": "PR-JAD-0370",
    "prId": "pr-jad-0370",
    "date": "2026-04-17",
    "siteName": "Agri Farm Rangpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000370000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0370-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Rangpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ALvBbKdDyH0Z8IA8JIjFgqgrQO4tdWJD=w1200"
  },
  {
    "id": "dc-jad-0371",
    "dcNumber": "DC-0371 (Missing)",
    "invoiceNumber": "DC-0371 (Missing)",
    "prNumber": "PR-JAD-0371",
    "prId": "pr-jad-0371",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000371000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0371-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0372",
    "dcNumber": "DC 372",
    "invoiceNumber": "DC 372",
    "prNumber": "PR-JAD-0372",
    "prId": "pr-jad-0372",
    "date": "2026-04-17",
    "siteName": "Agri Farm Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000372000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0372-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1UsZYkORojwBqyxCq2MXXncD54BI2BB6K=w1200"
  },
  {
    "id": "dc-jad-0373",
    "dcNumber": "DC 373",
    "invoiceNumber": "DC 373",
    "prNumber": "PR-JAD-0373",
    "prId": "pr-jad-0373",
    "date": "2026-04-17",
    "siteName": "Agri Farm Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000373000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0373-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iYg4S5hX7NW0NdYhy2qbP-1cggS33Awh=w1200"
  },
  {
    "id": "dc-jad-0374",
    "dcNumber": "DC 374",
    "invoiceNumber": "DC 374",
    "prNumber": "PR-JAD-0374",
    "prId": "pr-jad-0374",
    "date": "2026-04-18",
    "siteName": "Agri Farm Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000374000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0374-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1B1vuN0Oz0OewFMvwY0Xv4FcOeWdg8Vgi=w1200"
  },
  {
    "id": "dc-jad-0375",
    "dcNumber": "DC 375",
    "invoiceNumber": "DC 375",
    "prNumber": "PR-JAD-0375",
    "prId": "pr-jad-0375",
    "date": "2026-04-20",
    "siteName": "Oil Mill  Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000375000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0375-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill  Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/13fzZ8Mxzs7ymMnTJJgcSSTJZ0UIHjOad=w1200"
  },
  {
    "id": "dc-jad-0376",
    "dcNumber": "DC-0376 (Missing)",
    "invoiceNumber": "DC-0376 (Missing)",
    "prNumber": "PR-JAD-0376",
    "prId": "pr-jad-0376",
    "date": "2025-03-22",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000376000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0376-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered / Missing physical page in book"
  },
  {
    "id": "dc-jad-0377",
    "dcNumber": "DC 377",
    "invoiceNumber": "DC 377",
    "prNumber": "PR-JAD-0377",
    "prId": "pr-jad-0377",
    "date": "2026-04-20",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000377000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0377-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Jl3Q8BS33bSvkT83NLq6HijX6hY1GuW3=w1200"
  },
  {
    "id": "dc-jad-0378",
    "dcNumber": "DC 378",
    "invoiceNumber": "DC 378",
    "prNumber": "PR-JAD-0378",
    "prId": "pr-jad-0378",
    "date": "2026-04-21",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000378000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0378-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1p0hoCKNX_jM3gmkOAxTTah8sgxZHt5GL=w1200"
  },
  {
    "id": "dc-jad-0379",
    "dcNumber": "DC 379",
    "invoiceNumber": "DC 379",
    "prNumber": "PR-JAD-0379",
    "prId": "pr-jad-0379",
    "date": "2026-04-21",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000379000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0379-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1m7QB7nwEL3VIfgcW5G-QGexklKKnzPbM=w1200"
  },
  {
    "id": "dc-jad-0380",
    "dcNumber": "DC 380",
    "invoiceNumber": "DC 380",
    "prNumber": "PR-JAD-0380",
    "prId": "pr-jad-0380",
    "date": "2026-04-24",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000380000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0380-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1gTmIWynGa2KNMfPgwlGfwMLcCjKgLAjP=w1200"
  },
  {
    "id": "dc-jad-0381",
    "dcNumber": "DC 381",
    "invoiceNumber": "DC 381",
    "prNumber": "PR-JAD-0381",
    "prId": "pr-jad-0381",
    "date": "2026-04-24",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000381000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0381-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1EXjouhQ-cGD14RKXfrIZv8m6HX75jZYe=w1200"
  },
  {
    "id": "dc-jad-0382",
    "dcNumber": "DC 382",
    "invoiceNumber": "DC 382",
    "prNumber": "PR-JAD-0382",
    "prId": "pr-jad-0382",
    "date": "2026-04-24",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000382000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0382-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6870)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6870",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1ZQOku_Qp1v5FFeV3GfobQksgmy0n4ru5=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1dJIvDEBIll8puwL4g6IZGiqgFJ2VoM2o=w1200"
  },
  {
    "id": "dc-jad-0383",
    "dcNumber": "DC 383",
    "invoiceNumber": "DC 383",
    "prNumber": "PR-JAD-0383",
    "prId": "pr-jad-0383",
    "date": "2026-04-24",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000383000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0383-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1qZ_S2_R3htix5AZ9PLqMJ2XY6JBPwaZl=w1200"
  },
  {
    "id": "dc-jad-0384",
    "dcNumber": "DC 384",
    "invoiceNumber": "DC 384",
    "prNumber": "PR-JAD-0384",
    "prId": "pr-jad-0384",
    "date": "2026-04-24",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000384000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0384-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8645)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8645",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Oil",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1RLen198IquuNlvnn95MYwHmtojL2_fgj=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1ko2O4r7UKoUrLSXJKnZ4nmOod-arEGPx=w1200"
  },
  {
    "id": "dc-jad-0385",
    "dcNumber": "DC 385",
    "invoiceNumber": "DC 385",
    "prNumber": "PR-JAD-0385",
    "prId": "pr-jad-0385",
    "date": "2026-04-24",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000385000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0385-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6373)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6373",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Bahter",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1UgHq1VtoVP2PG6Aoj68v2y0okKhcaXNX=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1YKJQhFDmqS2VvI_5-a_48oqmBTJLAGGL=w1200"
  },
  {
    "id": "dc-jad-0386",
    "dcNumber": "DC 386",
    "invoiceNumber": "DC 386",
    "prNumber": "PR-JAD-0386",
    "prId": "pr-jad-0386",
    "date": "2026-04-24",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000386000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0386-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15acIkYcAFlinFiEuSr8HdWrHYcaTcL9G=w1200"
  },
  {
    "id": "dc-jad-0387",
    "dcNumber": "DC 387",
    "invoiceNumber": "DC 387",
    "prNumber": "PR-JAD-0387",
    "prId": "pr-jad-0387",
    "date": "2026-04-25",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000387000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0387-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1S5BW8DLvlaVb3_AtUt0e6KGhw8swiWsc=w1200"
  },
  {
    "id": "dc-jad-0388",
    "dcNumber": "DC 388",
    "invoiceNumber": "DC 388",
    "prNumber": "PR-JAD-0388",
    "prId": "pr-jad-0388",
    "date": "2026-04-27",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000388000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0388-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1vQxMOAfhXbHbLfDh7W21IHAr4diNTtEL=w1200"
  },
  {
    "id": "dc-jad-0389",
    "dcNumber": "DC 389",
    "invoiceNumber": "DC 389",
    "prNumber": "PR-JAD-0389",
    "prId": "pr-jad-0389",
    "date": "2026-04-27",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000389000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0389-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/136yjA867HPz7j8ncbrkhyX_CK1vbUPeh=w1200"
  },
  {
    "id": "dc-jad-0390",
    "dcNumber": "DC 390",
    "invoiceNumber": "DC 390",
    "prNumber": "PR-JAD-0390",
    "prId": "pr-jad-0390",
    "date": "2026-04-27",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000390000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0390-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8644)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8644",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Khanewal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1jp_r2XdZDnm1ZpYWbotvzBcVORgk8iw1=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1XmYDYrFm-y4ZRJVq6SHMsYZNk-CERmLu=w1200"
  },
  {
    "id": "dc-jad-0391",
    "dcNumber": "DC 391",
    "invoiceNumber": "DC 391",
    "prNumber": "PR-JAD-0391",
    "prId": "pr-jad-0391",
    "date": "2026-04-27",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000391000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0391-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/113tWPO8egjCdqS039QBMg_SYPdtMNADL=w1200"
  },
  {
    "id": "dc-jad-0392",
    "dcNumber": "DC 392",
    "invoiceNumber": "DC 392",
    "prNumber": "PR-JAD-0392",
    "prId": "pr-jad-0392",
    "date": "2026-04-28",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000392000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0392-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Fl08Fhcva2YKDe5K7-crly1Xn2MnEJW8=w1200"
  },
  {
    "id": "dc-jad-0393",
    "dcNumber": "DC 393",
    "invoiceNumber": "DC 393",
    "prNumber": "PR-JAD-0393",
    "prId": "pr-jad-0393",
    "date": "2026-04-28",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000393000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0393-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ENdNe72nwe9XlzVIushSxuIQDJypXoXP=w1200"
  },
  {
    "id": "dc-jad-0394",
    "dcNumber": "DC 394",
    "invoiceNumber": "DC 394",
    "prNumber": "PR-JAD-0394",
    "prId": "pr-jad-0394",
    "date": "2026-04-28",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000394000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0394-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1RgwgR89KkbnSKMSycgd-pPYbtGjXSfnS=w1200"
  },
  {
    "id": "dc-jad-0395",
    "dcNumber": "DC 395",
    "invoiceNumber": "DC 395",
    "prNumber": "PR-JAD-0395",
    "prId": "pr-jad-0395",
    "date": "2026-04-28",
    "siteName": "Hatchery Kotmomin",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000395000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0395-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Kotmomin)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #766)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "766",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Hatchery",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1xEfe00Fa7bvPpXlgXciZ4XLAd4U-Y1fb=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1l-M9MHPoOwtJwq4TKw6usZgFKbOGHvGr=w1200"
  },
  {
    "id": "dc-jad-0396",
    "dcNumber": "DC 396",
    "invoiceNumber": "DC 396",
    "prNumber": "PR-JAD-0396",
    "prId": "pr-jad-0396",
    "date": "2026-04-29",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000396000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0396-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3177)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3177",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1OSX6YlixdCHEhwZi_9JZitr_VODxgKqd=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1z1vGsPtJM4GObL8Ti3To5_7QrwbATH65=w1200"
  },
  {
    "id": "dc-jad-0397",
    "dcNumber": "DC 397",
    "invoiceNumber": "DC 397",
    "prNumber": "PR-JAD-0397",
    "prId": "pr-jad-0397",
    "date": "2026-01-05",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000397000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0397-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #5091)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "5091",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "P.D",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1u5MUXRljJ9F5s6_YY10h87ye1j_ZarNt=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1gYmrtbV4VieARgKvcMkHAuVId-Rts75u=w1200"
  },
  {
    "id": "dc-jad-0398",
    "dcNumber": "DC 398",
    "invoiceNumber": "DC 398",
    "prNumber": "PR-JAD-0398",
    "prId": "pr-jad-0398",
    "date": "2026-01-05",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000398000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0398-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1217r6lROGy61Cw8-weJcgoFxNUHejceS=w1200"
  },
  {
    "id": "dc-jad-0399",
    "dcNumber": "DC 399",
    "invoiceNumber": "DC 399",
    "prNumber": "PR-JAD-0399",
    "prId": "pr-jad-0399",
    "date": "2026-04-05",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000399000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0399-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1UmlScbJt3JSOR7VWj3unyguBFzWVphSo=w1200"
  },
  {
    "id": "dc-jad-0400",
    "dcNumber": "DC 400",
    "invoiceNumber": "DC 400",
    "prNumber": "PR-JAD-0400",
    "prId": "pr-jad-0400",
    "date": "2026-04-05",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000400000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0400-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1rVl7JvSh4pByptRl_fqOD-rABM6C1OwY=w1200"
  },
  {
    "id": "dc-jad-0401",
    "dcNumber": "DC 401",
    "invoiceNumber": "DC 401",
    "prNumber": "PR-JAD-0401",
    "prId": "pr-jad-0401",
    "date": "2026-06-05",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000401000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0401-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19THGFPsjBP4j6Uj4UjtGw5oiPPlnJbOH=w1200"
  },
  {
    "id": "dc-jad-0402",
    "dcNumber": "DC 402",
    "invoiceNumber": "DC 402",
    "prNumber": "PR-JAD-0402",
    "prId": "pr-jad-0402",
    "date": "2026-05-05",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000402000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0402-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8242)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8242",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Oil",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1Fz9Kp5PYrEsiq1qlGXLXXs4KC5xcCtW9=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1xV3meC3rcepzZCI-0BvyNEEJoxoEJ92E=w1200"
  },
  {
    "id": "dc-jad-0403",
    "dcNumber": "DC 403",
    "invoiceNumber": "DC 403",
    "prNumber": "PR-JAD-0403",
    "prId": "pr-jad-0403",
    "date": "2026-05-13",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000403000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0403-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZbL88D79y5Y56FvpoNYNCAhS-t1iWpab=w1200"
  },
  {
    "id": "dc-jad-0404",
    "dcNumber": "DC 404",
    "invoiceNumber": "DC 404",
    "prNumber": "PR-JAD-0404",
    "prId": "pr-jad-0404",
    "date": "2026-05-13",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000404000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0404-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3957)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3957",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/10xsA9ooSylJ0xQhylpKM3tsx9EuHgR0p=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/12jB92S9I1wiqV3MjT7RzI2mr9avfqSnJ=w1200"
  },
  {
    "id": "dc-jad-0405",
    "dcNumber": "DC 405",
    "invoiceNumber": "DC 405",
    "prNumber": "PR-JAD-0405",
    "prId": "pr-jad-0405",
    "date": "2026-05-13",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000405000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0405-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8513)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8513",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1-t8cKQs7OROu2Iyu0fpF3MXz4Ly3jTVU=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1Em4ah7k2-yhVRZyLYeDiAs-dNJesL-Eq=w1200"
  },
  {
    "id": "dc-jad-0406",
    "dcNumber": "DC 406",
    "invoiceNumber": "DC 406",
    "prNumber": "PR-JAD-0406",
    "prId": "pr-jad-0406",
    "date": "2026-11-05",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000406000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0406-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8511)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8511",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Feed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1iYwZHADb_OutpIpXT0a7XU-IvJybSeXc=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1lZpAsMvNanWIkiKVLepmU7LbcRuSurI_=w1200"
  },
  {
    "id": "dc-jad-0407",
    "dcNumber": "DC 407",
    "invoiceNumber": "DC 407",
    "prNumber": "PR-JAD-0407",
    "prId": "pr-jad-0407",
    "date": "2026-11-05",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000407000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0407-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/10k46S_FPD9tHz-455IWHpp2-BZTr_U7h=w1200"
  },
  {
    "id": "dc-jad-0408",
    "dcNumber": "DC 408",
    "invoiceNumber": "DC 408",
    "prNumber": "PR-JAD-0408",
    "prId": "pr-jad-0408",
    "date": "2026-12-05",
    "siteName": "House 28 F-6/3 Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000408000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0408-1",
        "itemName": "Electrical Supplies & Consumables (House 28 F-6/3 Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1yd9QImEi_XmW9jmOwzEdLkWZEeuhu7U-=w1200"
  },
  {
    "id": "dc-jad-0409",
    "dcNumber": "DC 409",
    "invoiceNumber": "DC 409",
    "prNumber": "PR-JAD-0409",
    "prId": "pr-jad-0409",
    "date": "2026-05-13",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000409000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0409-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8511)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8511",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Feed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1iYwZHADb_OutpIpXT0a7XU-IvJybSeXc=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1O0-CLkb6MTM77ltdOVkiMfMayTnlHLQ8=w1200"
  },
  {
    "id": "dc-jad-0410",
    "dcNumber": "DC 410",
    "invoiceNumber": "DC 410",
    "prNumber": "PR-JAD-0410",
    "prId": "pr-jad-0410",
    "date": "2026-05-13",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000410000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0410-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #8512)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "8512",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Khanewal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1aTNPk4CP8DFATHDZi2oWOV0S41l2R1wM=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1DWwDypMEFX4t8p1ZqUBisLfyHCdYNP-8=w1200"
  },
  {
    "id": "dc-jad-0411",
    "dcNumber": "DC 411",
    "invoiceNumber": "DC 411",
    "prNumber": "PR-JAD-0411",
    "prId": "pr-jad-0411",
    "date": "2026-05-14",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000411000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0411-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1y5l-ec67e6vPUUIoFn_0BFsx1kr86wVJ=w1200"
  },
  {
    "id": "dc-jad-0412",
    "dcNumber": "DC 412",
    "invoiceNumber": "DC 412",
    "prNumber": "PR-JAD-0412",
    "prId": "pr-jad-0412",
    "date": "2026-05-15",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000412000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0412-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1wYVKSTcPygp4myvlcBXIn2Nkna5vN2Ib=w1200"
  },
  {
    "id": "dc-jad-0413",
    "dcNumber": "DC 413",
    "invoiceNumber": "DC 413",
    "prNumber": "PR-JAD-0413",
    "prId": "pr-jad-0413",
    "date": "2026-05-15",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000413000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0413-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1DsUpoeJFL7puA30hHua1KqqVep_xnjeP=w1200"
  },
  {
    "id": "dc-jad-0414",
    "dcNumber": "DC 414",
    "invoiceNumber": "DC 414",
    "prNumber": "PR-JAD-0414",
    "prId": "pr-jad-0414",
    "date": "2026-05-15",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000414000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0414-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #1480)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "1480",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Bahter",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1JYS03zwVCysuZXOtPD1t54MnYAjzAXSS=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1dkE3Erkn4iXvsSIdF3g04nlPKj2_WiCz=w1200"
  },
  {
    "id": "dc-jad-0415",
    "dcNumber": "DC 415",
    "invoiceNumber": "DC 415",
    "prNumber": "PR-JAD-0415",
    "prId": "pr-jad-0415",
    "date": "2026-05-15",
    "siteName": "Madrasa Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000415000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0415-1",
        "itemName": "Electrical Supplies & Consumables (Madrasa Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/16J0kx5-CkLiZCbc13Nfuo8sro7p1umlc=w1200"
  },
  {
    "id": "dc-jad-0416",
    "dcNumber": "DC 416",
    "invoiceNumber": "DC 416",
    "prNumber": "PR-JAD-0416",
    "prId": "pr-jad-0416",
    "date": "2026-05-16",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000416000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0416-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19ddTf9VYIdeLgbe76eztZMcKOsoTEihK=w1200"
  },
  {
    "id": "dc-jad-0417",
    "dcNumber": "DC 417",
    "invoiceNumber": "DC 417",
    "prNumber": "PR-JAD-0417",
    "prId": "pr-jad-0417",
    "date": "2026-05-18",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000417000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0417-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1eQsqrIYao5SLGkBysGhQMgJehtjS-093=w1200"
  },
  {
    "id": "dc-jad-0418",
    "dcNumber": "DC 418",
    "invoiceNumber": "DC 418",
    "prNumber": "PR-JAD-0418",
    "prId": "pr-jad-0418",
    "date": "2026-05-18",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000418000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0418-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #792)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "792",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Chicks",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/15RClfY61V1NCUDMGJBswBTBiuv2_fvlc=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1c7HtsMviBZQXDeymlw5JUKBh5asbSXzQ=w1200"
  },
  {
    "id": "dc-jad-0419",
    "dcNumber": "DC 419",
    "invoiceNumber": "DC 419",
    "prNumber": "PR-JAD-0419",
    "prId": "pr-jad-0419",
    "date": "2026-05-18",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000419000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0419-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #5945)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "5945",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1diiJnHxUyZHYMzR3dlkIgE4nZueS3j15=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1BSm9c7NmQhNoz8m6XfTNqLNS4Qqezneg=w1200"
  },
  {
    "id": "dc-jad-0420",
    "dcNumber": "DC 420",
    "invoiceNumber": "DC 420",
    "prNumber": "PR-JAD-0420",
    "prId": "pr-jad-0420",
    "date": "2026-05-20",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000420000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0420-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #45173)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "45173",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1wSOPcVKqNjMThIsu5M6775lb-7qrkUIA=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1EnJ9jTNoTuAZa94UhjZmejaPZuCm9n1Z=w1200"
  },
  {
    "id": "dc-jad-0421",
    "dcNumber": "DC 421",
    "invoiceNumber": "DC 421",
    "prNumber": "PR-JAD-0421",
    "prId": "pr-jad-0421",
    "date": "2026-05-20",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000421000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0421-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #45174)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "45174",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1mrEE_y4SZjDAicIqbBPTQ6_yjgQLB7-1=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1p5KDUzSUgoK-hqvoCyPoy_G2F3Qt64kw=w1200"
  },
  {
    "id": "dc-jad-0422",
    "dcNumber": "DC 422",
    "invoiceNumber": "DC 422",
    "prNumber": "PR-JAD-0422",
    "prId": "pr-jad-0422",
    "date": "2026-05-21",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000422000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0422-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18kYgv-rPc3DMNHUe7RUjZaShNSJu_17x=w1200"
  },
  {
    "id": "dc-jad-0423",
    "dcNumber": "DC 423",
    "invoiceNumber": "DC 423",
    "prNumber": "PR-JAD-0423",
    "prId": "pr-jad-0423",
    "date": "2026-05-21",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000423000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0423-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #6956)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "6956",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1PpgcLJTY2mSboqzuF5u2E7eqVOy1ajBg=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/105X4FzG2gOTjG4RiirwCGjpP4fOeydYY=w1200"
  },
  {
    "id": "dc-jad-0424",
    "dcNumber": "DC 424",
    "invoiceNumber": "DC 424",
    "prNumber": "PR-JAD-0424",
    "prId": "pr-jad-0424",
    "date": "2026-05-21",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000424000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0424-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1DwlDwok-2vbODKg_X1MdcpJG-VTVInn7=w1200"
  },
  {
    "id": "dc-jad-0425",
    "dcNumber": "DC 425",
    "invoiceNumber": "DC 425",
    "prNumber": "PR-JAD-0425",
    "prId": "pr-jad-0425",
    "date": "2026-05-21",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000425000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0425-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FLz-fdQS5n4oBjPHgnZCMlxObu7q8XiV=w1200"
  },
  {
    "id": "dc-jad-0426",
    "dcNumber": "DC 426",
    "invoiceNumber": "DC 426",
    "prNumber": "PR-JAD-0426",
    "prId": "pr-jad-0426",
    "date": "2026-05-21",
    "siteName": "Warehouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000426000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0426-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1D9zV_cdlnFM08prbm32GpbEyCsQxeo44=w1200"
  },
  {
    "id": "dc-jad-0427",
    "dcNumber": "DC 427",
    "invoiceNumber": "DC 427",
    "prNumber": "PR-JAD-0427",
    "prId": "pr-jad-0427",
    "date": "2026-05-22",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000427000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0427-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Us6P-1ZzyLZl5e2E255WDYVz7_vD-rX6=w1200"
  },
  {
    "id": "dc-jad-0428",
    "dcNumber": "DC 428",
    "invoiceNumber": "DC 428",
    "prNumber": "PR-JAD-0428",
    "prId": "pr-jad-0428",
    "date": "2026-05-22",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000428000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0428-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #7918)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "7918",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1U4OylLUdT2Xjjtn2EGV_hEx3rlmyOe8a=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/14Fo4skiW3pa8howkv73oXOL0wwrqw7W2=w1200"
  },
  {
    "id": "dc-jad-0429",
    "dcNumber": "DC 429",
    "invoiceNumber": "DC 429",
    "prNumber": "PR-JAD-0429",
    "prId": "pr-jad-0429",
    "date": "2026-05-22",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000429000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0429-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NTMHI274GsdRONvZ4AzhsgBGK0UAvxQs=w1200"
  },
  {
    "id": "dc-jad-0430",
    "dcNumber": "DC 430",
    "invoiceNumber": "DC 430",
    "prNumber": "PR-JAD-0430",
    "prId": "pr-jad-0430",
    "date": "2026-05-24",
    "siteName": "Jadeed Poltry Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000430000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0430-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Poltry Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15OSRHJ8yEfbIv75fX7nDhWjVRt9rq8Lk=w1200"
  },
  {
    "id": "dc-jad-0431",
    "dcNumber": "DC 431",
    "invoiceNumber": "DC 431",
    "prNumber": "PR-JAD-0431",
    "prId": "pr-jad-0431",
    "date": "2026-05-25",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000431000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0431-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1cqpWsBnjZ1p3TatqCId43kLVr5iiXgLh=w1200"
  },
  {
    "id": "dc-jad-0432",
    "dcNumber": "DC 432",
    "invoiceNumber": "DC 432",
    "prNumber": "PR-JAD-0432",
    "prId": "pr-jad-0432",
    "date": "2026-05-24",
    "siteName": "Jadeed Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000432000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0432-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #168872)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "168872",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Jadeed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1v0LSum0r5X0Tbe1n0qVHKm-Orz8iGXxW=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1MyQYkiKmYMo4tBa07buNBp2XRaJdJ86i=w1200"
  },
  {
    "id": "dc-jad-0433",
    "dcNumber": "DC 433",
    "invoiceNumber": "DC 433",
    "prNumber": "PR-JAD-0433",
    "prId": "pr-jad-0433",
    "date": "2026-03-06",
    "siteName": "Warehouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000433000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0433-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #2492)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "2492",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Warehouse",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1bogNfyxgcMCyebxXVTQdjfnB_CjdgII_=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1FX_786XVgqPcdtyGSDisG5a_OWiVBjL3=w1200"
  },
  {
    "id": "dc-jad-0434",
    "dcNumber": "DC 434",
    "invoiceNumber": "DC 434",
    "prNumber": "PR-JAD-0434",
    "prId": "pr-jad-0434",
    "date": "2026-03-06",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000434000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0434-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ix495wpIDn-xyEHYelAe9oGE9yROYMh2=w1200"
  },
  {
    "id": "dc-jad-0435",
    "dcNumber": "DC 435",
    "invoiceNumber": "DC 435",
    "prNumber": "PR-JAD-0435",
    "prId": "pr-jad-0435",
    "date": "2026-03-06",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000435000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0435-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1oQwPEt3x_Z9rbKVt6fDs5QCxx6ZPAy1V=w1200"
  },
  {
    "id": "dc-jad-0436",
    "dcNumber": "DC 436",
    "invoiceNumber": "DC 436",
    "prNumber": "PR-JAD-0436",
    "prId": "pr-jad-0436",
    "date": "2026-03-06",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000436000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0436-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18q2HtqkStxegYOqT0DStduLfXovfUkn3=w1200"
  },
  {
    "id": "dc-jad-0437",
    "dcNumber": "DC 437",
    "invoiceNumber": "DC 437",
    "prNumber": "PR-JAD-0437",
    "prId": "pr-jad-0437",
    "date": "2026-05-20",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000437000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0437-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uUqJ_xPFJwgBjLUR4jRMNciGTl006Kys=w1200"
  },
  {
    "id": "dc-jad-0438",
    "dcNumber": "DC 438",
    "invoiceNumber": "DC 438",
    "prNumber": "PR-JAD-0438",
    "prId": "pr-jad-0438",
    "date": "2026-05-29",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000438000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0438-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1nyNydBJ1wSEk2fhA95NQFjno0dMfB_UU=w1200"
  },
  {
    "id": "dc-jad-0439",
    "dcNumber": "DC 439",
    "invoiceNumber": "DC 439",
    "prNumber": "PR-JAD-0439",
    "prId": "pr-jad-0439",
    "date": "2026-09-06",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000439000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0439-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3037)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3037",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1z4m8ru_57wmaAV5qpwbv_ewq9fZHo7gV=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1CTQTH8Mos9I9x4Y_gcsRkPNnVGhJpn0X=w1200"
  },
  {
    "id": "dc-jad-0440",
    "dcNumber": "DC 440",
    "invoiceNumber": "DC 440",
    "prNumber": "PR-JAD-0440",
    "prId": "pr-jad-0440",
    "date": "2026-06-06",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000440000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0440-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1NSHEDxD3ddBcBBXbTzOTQBGh1mdixYzG=w1200"
  },
  {
    "id": "dc-jad-0441",
    "dcNumber": "DC 441",
    "invoiceNumber": "DC 441",
    "prNumber": "PR-JAD-0441",
    "prId": "pr-jad-0441",
    "date": "2026-06-06",
    "siteName": "House 451 PWD MAMOO",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000441000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0441-1",
        "itemName": "Electrical Supplies & Consumables (House 451 PWD MAMOO)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19KwbXrc77f7Odo8ojGvk1eZSEh94_18s=w1200"
  },
  {
    "id": "dc-jad-0442",
    "dcNumber": "DC 442",
    "invoiceNumber": "DC 442",
    "prNumber": "PR-JAD-0442",
    "prId": "pr-jad-0442",
    "date": "2026-08-06",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000442000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0442-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #920)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "920",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Mankera",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1Aj7oSzFNf_WFisCrSZVhWRBag6TkhjXm=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1K8Z5-TSO3twpnPJqdOjQOptBsgjEWLpj=w1200"
  },
  {
    "id": "dc-jad-0443",
    "dcNumber": "DC 443",
    "invoiceNumber": "DC 443",
    "prNumber": "PR-JAD-0443",
    "prId": "pr-jad-0443",
    "date": "2026-08-06",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000443000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0443-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/15vdH3n6PwcZv8-WJDa03JaQdYzg3nIgU=w1200"
  },
  {
    "id": "dc-jad-0444",
    "dcNumber": "DC 444",
    "invoiceNumber": "DC 444",
    "prNumber": "PR-JAD-0444",
    "prId": "pr-jad-0444",
    "date": "2026-08-06",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000444000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0444-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1gEBOdHMrX2GO6iAoB07t-7KN54DaXidb=w1200"
  },
  {
    "id": "dc-jad-0445",
    "dcNumber": "DC 445",
    "invoiceNumber": "DC 445",
    "prNumber": "PR-JAD-0445",
    "prId": "pr-jad-0445",
    "date": "2026-06-16",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000445000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0445-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #4691)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "4691",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1nJuI05ITJClIbiG89iGo6SPUWQyjm0IH=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1M8-VJGT-yzXg9geLW2xrm9_T87Ha-1b4=w1200"
  },
  {
    "id": "dc-jad-0446",
    "dcNumber": "DC 446",
    "invoiceNumber": "DC 446",
    "prNumber": "PR-JAD-0446",
    "prId": "pr-jad-0446",
    "date": "2026-08-06",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000446000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0446-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1eaxZPz81bMBUzqBJcCLA4E081sXIkF83=w1200"
  },
  {
    "id": "dc-jad-0447",
    "dcNumber": "DC 447",
    "invoiceNumber": "DC 447",
    "prNumber": "PR-JAD-0447",
    "prId": "pr-jad-0447",
    "date": "2026-08-06",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000447000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0447-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #4551)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "4551",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Feed",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1e_-r34DV0Gm5wiMpQdUriQPOJglDSOcN=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/106U4EZS3DlYABJDKKQqW8Y3n7llBtyQD=w1200"
  },
  {
    "id": "dc-jad-0448",
    "dcNumber": "DC 448",
    "invoiceNumber": "DC 448",
    "prNumber": "PR-JAD-0448",
    "prId": "pr-jad-0448",
    "date": "2026-09-06",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000448000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0448-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1vJilmbS27C6xFWMH6s-HI1aidTOfIwvG=w1200"
  },
  {
    "id": "dc-jad-0449",
    "dcNumber": "DC 449",
    "invoiceNumber": "DC 449",
    "prNumber": "PR-JAD-0449",
    "prId": "pr-jad-0449",
    "date": "2026-09-06",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000449000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0449-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #472)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "472",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Mankera",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1U6LBD9Tu5SQpt8PTmxRk1JIFKi1Q4UqT=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ylk7-YxdxCouMg40RWplyNOowwM-2gLU=w1200"
  },
  {
    "id": "dc-jad-0450",
    "dcNumber": "DC 450",
    "invoiceNumber": "DC 450",
    "prNumber": "PR-JAD-0450",
    "prId": "pr-jad-0450",
    "date": "2026-06-15",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000450000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0450-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3303)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3303",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1n1wvAcb0txTAYn98NfSnwBcGrvmih-9-=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1wGoI_UTdOpePjSN7tGONipHQ3SGIDNh6=w1200"
  },
  {
    "id": "dc-jad-0451",
    "dcNumber": "DC 451",
    "invoiceNumber": "DC 451",
    "prNumber": "PR-JAD-0451",
    "prId": "pr-jad-0451",
    "date": "2026-06-15",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000451000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0451-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #4550)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "4550",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/114FU9kV4CURdNsngIG0qqPzEtxRk32LN=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1UeD376b9DxUWf6hNoqy1TpeG9foEMxeN=w1200"
  },
  {
    "id": "dc-jad-0452",
    "dcNumber": "DC 452",
    "invoiceNumber": "DC 452",
    "prNumber": "PR-JAD-0452",
    "prId": "pr-jad-0452",
    "date": "2026-06-15",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000452000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0452-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/12PvlBqRz2IhA2MB8cLFxOLGs-5PKsnIb=w1200"
  },
  {
    "id": "dc-jad-0453",
    "dcNumber": "DC 453",
    "invoiceNumber": "DC 453",
    "prNumber": "PR-JAD-0453",
    "prId": "pr-jad-0453",
    "date": "2026-06-16",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000453000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0453-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3297)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3297",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1e4lFkDW304WAyzsIkUkRHoSF5dxETVYn=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1HbHk0UBBPEGoX2wRgM_A6dwq5wxi4xDM=w1200"
  },
  {
    "id": "dc-jad-0454",
    "dcNumber": "DC 454",
    "invoiceNumber": "DC 454",
    "prNumber": "PR-JAD-0454",
    "prId": "pr-jad-0454",
    "date": "2026-06-16",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000454000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0454-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3912)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3912",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Pirowal",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1AA_1t0lXJWjpoS_XNPlcCHnmY3wrRUHe=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1Pk4uOUZ5AbXypcq6SBCa7YCzQa-kaYZs=w1200"
  },
  {
    "id": "dc-jad-0455",
    "dcNumber": "DC 455",
    "invoiceNumber": "DC 455",
    "prNumber": "PR-JAD-0455",
    "prId": "pr-jad-0455",
    "date": "2026-06-16",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000455000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0455-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3438)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3438",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1BUF9YQ_Vyrbz-FrnnBAqyxD-1NKJp2zl=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1gUSMp4DhPDcYAURHR09Z3AsYdLXSJx6W=w1200"
  },
  {
    "id": "dc-jad-0456",
    "dcNumber": "DC 456",
    "invoiceNumber": "DC 456",
    "prNumber": "PR-JAD-0456",
    "prId": "pr-jad-0456",
    "date": "2026-06-17",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000456000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0456-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1sqSN4g5vUj2ucIjgHOIK561vImbtU75V=w1200"
  },
  {
    "id": "dc-jad-0457",
    "dcNumber": "DC 457",
    "invoiceNumber": "DC 457",
    "prNumber": "PR-JAD-0457",
    "prId": "pr-jad-0457",
    "date": "2026-06-18",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000457000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0457-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Delivered via Goods Transport (Builty #3817)",
    "isBuiltyAttached": true,
    "addaName": "Goods Transport (General)",
    "biltyNumber": "3817",
    "freightCharges": 0,
    "isFreightFree": true,
    "freightStatus": "Paid",
    "destinationCity": "Agri",
    "packagesCount": "1 Pkg",
    "builtyImage": "https://lh3.googleusercontent.com/d/1hZE1AIp04zvBUtenUxcYEbyR_Tbt3aBc=w1200",
    "documentImage": "https://lh3.googleusercontent.com/d/1IaxNiTfU9nrFC5aXxx7fM5TqjtR71Isf=w1200"
  },
  {
    "id": "dc-jad-0458",
    "dcNumber": "DC 458",
    "invoiceNumber": "DC 458",
    "prNumber": "PR-JAD-0458",
    "prId": "pr-jad-0458",
    "date": "2026-06-19",
    "siteName": "House 3, St 25, F-7/2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000458000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0458-1",
        "itemName": "Electrical Supplies & Consumables (House 3, St 25, F-7/2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/11YKiUhPxP-GkEoEAF4UOlbauelobZeqj=w1200"
  },
  {
    "id": "dc-jad-0459",
    "dcNumber": "DC 459",
    "invoiceNumber": "DC 459",
    "prNumber": "PR-JAD-0459",
    "prId": "pr-jad-0459",
    "date": "2026-06-19",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000459000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0459-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1h2VerrCfSEcNbpWHJXdXh7U8ySvGbihx=w1200"
  },
  {
    "id": "dc-jad-0460",
    "dcNumber": "DC 460",
    "invoiceNumber": "DC 460",
    "prNumber": "PR-JAD-0460",
    "prId": "pr-jad-0460",
    "date": "2026-06-20",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000460000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0460-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iQVvH6fcgYFh5uwrNKlrgFqn-HlsaEIg=w1200"
  },
  {
    "id": "dc-jad-0461",
    "dcNumber": "DC 461",
    "invoiceNumber": "DC 461",
    "prNumber": "PR-JAD-0461",
    "prId": "pr-jad-0461",
    "date": "2026-06-20",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000461000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0461-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZqHMeFGe3LagGxoRx2PiVkxUcLmL-5Ys=w1200"
  },
  {
    "id": "dc-jad-0462",
    "dcNumber": "DC 462",
    "invoiceNumber": "DC 462",
    "prNumber": "PR-JAD-0462",
    "prId": "pr-jad-0462",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000462000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0462-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1GMBqzS_LbkERfvSGbliyjsH7YRZbujMj=w1200"
  },
  {
    "id": "dc-jad-0463",
    "dcNumber": "DC 463",
    "invoiceNumber": "DC 463",
    "prNumber": "PR-JAD-0463",
    "prId": "pr-jad-0463",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000463000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0463-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IjmLdopYhNacylFxXb9-dE3eFICNj690=w1200"
  },
  {
    "id": "dc-jad-0464",
    "dcNumber": "DC 464",
    "invoiceNumber": "DC 464",
    "prNumber": "PR-JAD-0464",
    "prId": "pr-jad-0464",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000464000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0464-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18ESJVtlWQq1e0-eK673mZvxbd5AOFt8P=w1200"
  },
  {
    "id": "dc-jad-0465",
    "dcNumber": "DC 465",
    "invoiceNumber": "DC 465",
    "prNumber": "PR-JAD-0465",
    "prId": "pr-jad-0465",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000465000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0465-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1k9sbApgHATwlRJHtUkeSM2M9FLaJyPVb=w1200"
  },
  {
    "id": "dc-jad-0466",
    "dcNumber": "DC 466",
    "invoiceNumber": "DC 466",
    "prNumber": "PR-JAD-0466",
    "prId": "pr-jad-0466",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000466000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0466-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Ls3CK_IvEnGBhup1UTmbjVrYB8jVCWSf=w1200"
  },
  {
    "id": "dc-jad-0467",
    "dcNumber": "DC 467",
    "invoiceNumber": "DC 467",
    "prNumber": "PR-JAD-0467",
    "prId": "pr-jad-0467",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000467000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0467-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/17YwG-E8Nda5qkFDPz3nw_ej4l5JR0FvY=w1200"
  },
  {
    "id": "dc-jad-0468",
    "dcNumber": "DC 468",
    "invoiceNumber": "DC 468",
    "prNumber": "PR-JAD-0468",
    "prId": "pr-jad-0468",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000468000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0468-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bnNgtWZn4DsOFkNrRQfxJi52oXtyVvuZ=w1200"
  },
  {
    "id": "dc-jad-0469",
    "dcNumber": "DC 469",
    "invoiceNumber": "DC 469",
    "prNumber": "PR-JAD-0469",
    "prId": "pr-jad-0469",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000469000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0469-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1q9Abu32Pg-3paZeiciemzPZEZFSFcGTS=w1200"
  },
  {
    "id": "dc-jad-0470",
    "dcNumber": "DC 470",
    "invoiceNumber": "DC 470",
    "prNumber": "PR-JAD-0470",
    "prId": "pr-jad-0470",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000470000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0470-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1ZZKdHELNr0A8LZ5epV265e62bJpsuzoU=w1200"
  },
  {
    "id": "dc-jad-0471",
    "dcNumber": "DC 471",
    "invoiceNumber": "DC 471",
    "prNumber": "PR-JAD-0471",
    "prId": "pr-jad-0471",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000471000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0471-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1N3TrilllDsBYXE4BFrD12zAE6Ofjo7Mz=w1200"
  },
  {
    "id": "dc-jad-0472",
    "dcNumber": "DC 472",
    "invoiceNumber": "DC 472",
    "prNumber": "PR-JAD-0472",
    "prId": "pr-jad-0472",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000472000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0472-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1lu2b_N4O-btcfw7pLT7e5rRz-7OZRUt6=w1200"
  },
  {
    "id": "dc-jad-0473",
    "dcNumber": "DC 473",
    "invoiceNumber": "DC 473",
    "prNumber": "PR-JAD-0473",
    "prId": "pr-jad-0473",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000473000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0473-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1_T2n0cfDaOSO2PtBkn4EdLAaK-BVHFs5=w1200"
  },
  {
    "id": "dc-jad-0474",
    "dcNumber": "DC 474",
    "invoiceNumber": "DC 474",
    "prNumber": "PR-JAD-0474",
    "prId": "pr-jad-0474",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000474000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0474-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1M1lb64xUx_7Xrk9n1r0kaXAUgL7dDdv_=w1200"
  },
  {
    "id": "dc-jad-0475",
    "dcNumber": "DC 475",
    "invoiceNumber": "DC 475",
    "prNumber": "PR-JAD-0475",
    "prId": "pr-jad-0475",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000475000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0475-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1gsE5aKSnSsl4frBKQ98tWzZOMkzlvLi1=w1200"
  },
  {
    "id": "dc-jad-0476",
    "dcNumber": "DC 476",
    "invoiceNumber": "DC 476",
    "prNumber": "PR-JAD-0476",
    "prId": "pr-jad-0476",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000476000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0476-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1jlWes5cj20ONXERA8hbQOd6B9kjpNfJD=w1200"
  },
  {
    "id": "dc-jad-0477",
    "dcNumber": "DC 477",
    "invoiceNumber": "DC 477",
    "prNumber": "PR-JAD-0477",
    "prId": "pr-jad-0477",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000477000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0477-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1c3uAAKDYl5DjlCXxaDbP6uMPgdIhRsRU=w1200"
  },
  {
    "id": "dc-jad-0478",
    "dcNumber": "DC 478",
    "invoiceNumber": "DC 478",
    "prNumber": "PR-JAD-0478",
    "prId": "pr-jad-0478",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000478000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0478-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1Pl_YK4bO82vMMu6LkmQ7SWDu_JR9_l42=w1200"
  },
  {
    "id": "dc-jad-0479",
    "dcNumber": "DC 479",
    "invoiceNumber": "DC 479",
    "prNumber": "PR-JAD-0479",
    "prId": "pr-jad-0479",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000479000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0479-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1qnlrHYoaj_6gqXIJz7kFajtqNdLUcUBm=w1200"
  },
  {
    "id": "dc-jad-0480",
    "dcNumber": "DC 480",
    "invoiceNumber": "DC 480",
    "prNumber": "PR-JAD-0480",
    "prId": "pr-jad-0480",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000480000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0480-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1YWBKLKbnkKWJzWRrd054nLqUmuAy5in5=w1200"
  },
  {
    "id": "dc-jad-0481",
    "dcNumber": "DC 481",
    "invoiceNumber": "DC 481",
    "prNumber": "PR-JAD-0481",
    "prId": "pr-jad-0481",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000481000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0481-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18zJeqAjyvxOknyrASCQum9Upbsr2g79J=w1200"
  },
  {
    "id": "dc-jad-0482",
    "dcNumber": "DC 482",
    "invoiceNumber": "DC 482",
    "prNumber": "PR-JAD-0482",
    "prId": "pr-jad-0482",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000482000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0482-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1mu6IIJLtN71dDPjeRN_6GQh4jgZMk3SZ=w1200"
  },
  {
    "id": "dc-jad-0483",
    "dcNumber": "DC 483",
    "invoiceNumber": "DC 483",
    "prNumber": "PR-JAD-0483",
    "prId": "pr-jad-0483",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000483000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0483-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1JPgaQ1u0oLaNtWj4DMJ31fDSsxz2AgN0=w1200"
  },
  {
    "id": "dc-jad-0484",
    "dcNumber": "DC 484",
    "invoiceNumber": "DC 484",
    "prNumber": "PR-JAD-0484",
    "prId": "pr-jad-0484",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000484000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0484-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1IoBPZGLqERHlmLjBdxH_UihkouO6XFh6=w1200"
  },
  {
    "id": "dc-jad-0485",
    "dcNumber": "DC 485",
    "invoiceNumber": "DC 485",
    "prNumber": "PR-JAD-0485",
    "prId": "pr-jad-0485",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000485000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0485-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1FbxTbSVEsVvCS8QidmTgd4GPLu8l-2j5=w1200"
  },
  {
    "id": "dc-jad-0486",
    "dcNumber": "DC 486",
    "invoiceNumber": "DC 486",
    "prNumber": "PR-JAD-0486",
    "prId": "pr-jad-0486",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000486000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0486-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1YzfyOAZjk3tMdg7JwAipJKv8qBqf6Jii=w1200"
  },
  {
    "id": "dc-jad-0487",
    "dcNumber": "DC 487",
    "invoiceNumber": "DC 487",
    "prNumber": "PR-JAD-0487",
    "prId": "pr-jad-0487",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000487000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0487-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/17JSFinkuHdWE9Hw33f4c34ZfHDWL0lih=w1200"
  },
  {
    "id": "dc-jad-0488",
    "dcNumber": "DC 488",
    "invoiceNumber": "DC 488",
    "prNumber": "PR-JAD-0488",
    "prId": "pr-jad-0488",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000488000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0488-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/19egAYkcJWVl9yw2rvfjo45LxTf_U9jT9=w1200"
  },
  {
    "id": "dc-jad-0489",
    "dcNumber": "DC 489",
    "invoiceNumber": "DC 489",
    "prNumber": "PR-JAD-0489",
    "prId": "pr-jad-0489",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000489000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0489-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1UaQkjzvdNrKx4SkOSUqmWOlmerT5f2Ex=w1200"
  },
  {
    "id": "dc-jad-0490",
    "dcNumber": "DC 490",
    "invoiceNumber": "DC 490",
    "prNumber": "PR-JAD-0490",
    "prId": "pr-jad-0490",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000490000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0490-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1iJFEXgJ9kxRxJBL-ljuhUrL36eAOlMz9=w1200"
  },
  {
    "id": "dc-jad-0491",
    "dcNumber": "DC 491",
    "invoiceNumber": "DC 491",
    "prNumber": "PR-JAD-0491",
    "prId": "pr-jad-0491",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000491000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0491-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1uNzeH-DO_OlQiM2dq_t38rNop0TPizB8=w1200"
  },
  {
    "id": "dc-jad-0492",
    "dcNumber": "DC 492",
    "invoiceNumber": "DC 492",
    "prNumber": "PR-JAD-0492",
    "prId": "pr-jad-0492",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000492000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0492-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1y3ysE77xDWQRAD_f1ectag0OlBkTtSWx=w1200"
  },
  {
    "id": "dc-jad-0493",
    "dcNumber": "DC 493",
    "invoiceNumber": "DC 493",
    "prNumber": "PR-JAD-0493",
    "prId": "pr-jad-0493",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000493000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0493-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1g7RJRQrEmAXZ07rBBNG4kNFYWaxcU9sP=w1200"
  },
  {
    "id": "dc-jad-0494",
    "dcNumber": "DC 494",
    "invoiceNumber": "DC 494",
    "prNumber": "PR-JAD-0494",
    "prId": "pr-jad-0494",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000494000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0494-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1kuYcwtAiW_xlbsbmll_RyR-YPgaWiefJ=w1200"
  },
  {
    "id": "dc-jad-0495",
    "dcNumber": "DC 495",
    "invoiceNumber": "DC 495",
    "prNumber": "PR-JAD-0495",
    "prId": "pr-jad-0495",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000495000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0495-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/18la0tgtlCKWWfmKitR-WQmnh8P4HQ9VC=w1200"
  },
  {
    "id": "dc-jad-0496",
    "dcNumber": "DC 496",
    "invoiceNumber": "DC 496",
    "prNumber": "PR-JAD-0496",
    "prId": "pr-jad-0496",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000496000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0496-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1WrL_F49H3E9dRNV308Zlvh71J04bZW3V=w1200"
  },
  {
    "id": "dc-jad-0497",
    "dcNumber": "DC 497",
    "invoiceNumber": "DC 497",
    "prNumber": "PR-JAD-0497",
    "prId": "pr-jad-0497",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000497000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0497-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1yyNk2x208xTJVYDSnIJvHDWBNtGIbF58=w1200"
  },
  {
    "id": "dc-jad-0498",
    "dcNumber": "DC 498",
    "invoiceNumber": "DC 498",
    "prNumber": "PR-JAD-0498",
    "prId": "pr-jad-0498",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000498000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0498-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1detGhMEnbdfTuyhQo0lCCKyya7pIk_dD=w1200"
  },
  {
    "id": "dc-jad-0499",
    "dcNumber": "DC 499",
    "invoiceNumber": "DC 499",
    "prNumber": "PR-JAD-0499",
    "prId": "pr-jad-0499",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000499000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0499-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1yPkmgvtkuCt0JvWt2cGDeuLLc4rUahg_=w1200"
  },
  {
    "id": "dc-jad-0500",
    "dcNumber": "DC 500",
    "invoiceNumber": "DC 500",
    "prNumber": "PR-JAD-0500",
    "prId": "pr-jad-0500",
    "date": "2026-04-05",
    "siteName": "Jadeed Group Site (Pending Allocation)",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000500000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0500-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Group Site (Pending Allocation))",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "documentImage": "https://lh3.googleusercontent.com/d/1bEd1xBQOxsd0Olcj2yR26_QSoLvWbs8B=w1200"
  },
  {
    "id": "dc-jad-0501",
    "dcNumber": "DC 501",
    "invoiceNumber": "DC 501",
    "prNumber": "PR-JAD-0501",
    "prId": "pr-jad-0501",
    "date": "2026-03-07",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000501000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0501-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1yyvxzW3lCWp-8-D2x750mWgKOk5q-NoJ=w1200"
  },
  {
    "id": "dc-jad-0502",
    "dcNumber": "DC 502",
    "invoiceNumber": "DC 502",
    "prNumber": "PR-JAD-0502",
    "prId": "pr-jad-0502",
    "date": "2026-04-07",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000502000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0502-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1RpMchODNZcHYqzo0C4JmEBCHg6nZyPGU=w1200"
  },
  {
    "id": "dc-jad-0503",
    "dcNumber": "DC 503",
    "invoiceNumber": "DC 503",
    "prNumber": "PR-JAD-0503",
    "prId": "pr-jad-0503",
    "date": "2026-04-07",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000503000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0503-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1lrPeEsdD9zibPYx9PAvY5dWExH52bJSg=w1200"
  },
  {
    "id": "dc-jad-0504",
    "dcNumber": "DC 504",
    "invoiceNumber": "DC 504",
    "prNumber": "PR-JAD-0504",
    "prId": "pr-jad-0504",
    "date": "2026-04-07",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000504000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0504-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1FyPiBR4ZkOhLo-EDtIT5WRdjQB219bkY=w1200"
  },
  {
    "id": "dc-jad-0505",
    "dcNumber": "DC 505",
    "invoiceNumber": "DC 505",
    "prNumber": "PR-JAD-0505",
    "prId": "pr-jad-0505",
    "date": "2026-04-07",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000505000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0505-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1AKUkgOmblv4HjP44lQujEC1OqIuN5sin=w1200"
  },
  {
    "id": "dc-jad-0506",
    "dcNumber": "DC 506",
    "invoiceNumber": "DC 506",
    "prNumber": "PR-JAD-0506",
    "prId": "pr-jad-0506",
    "date": "2026-06-07",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000506000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0506-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #1742",
    "isBuiltyAttached": true,
    "biltyNumber": "1742",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay",
    "documentImage": "https://lh3.googleusercontent.com/d/1yd6IEjWauoMFR7lKoRd-X9YoI6OdhBkc=w1200"
  },
  {
    "id": "dc-jad-0507",
    "dcNumber": "DC 507",
    "invoiceNumber": "DC 507",
    "prNumber": "PR-JAD-0507",
    "prId": "pr-jad-0507",
    "date": "2026-06-07",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000507000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0507-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #4394",
    "isBuiltyAttached": true,
    "biltyNumber": "4394",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay",
    "documentImage": "https://lh3.googleusercontent.com/d/1M7pEkUNDv6mKEWD8VvNylfeMn4ot-5JD=w1200"
  },
  {
    "id": "dc-jad-0508",
    "dcNumber": "DC 508",
    "invoiceNumber": "DC 508",
    "prNumber": "PR-JAD-0508",
    "prId": "pr-jad-0508",
    "date": "2026-06-07",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000508000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0508-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1itR1Z_wsRKPLphCeBsiE8-0k-UaDGus0=w1200"
  },
  {
    "id": "dc-jad-0509",
    "dcNumber": "DC 509",
    "invoiceNumber": "DC 509",
    "prNumber": "PR-JAD-0509",
    "prId": "pr-jad-0509",
    "date": "2026-06-07",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000509000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0509-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #3632",
    "isBuiltyAttached": true,
    "biltyNumber": "3632",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay",
    "documentImage": "https://lh3.googleusercontent.com/d/1jWbCiBjjFpTjV7AYkHRORgUdwCDinnAb=w1200"
  },
  {
    "id": "dc-jad-0510",
    "dcNumber": "DC 510",
    "invoiceNumber": "DC 510",
    "prNumber": "PR-JAD-0510",
    "prId": "pr-jad-0510",
    "date": "2026-08-07",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000510000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0510-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1GJ50fOmt8Hir59rowC6I_T8XiMzbOh5s=w1200"
  },
  {
    "id": "dc-jad-0511",
    "dcNumber": "DC 511",
    "invoiceNumber": "DC 511",
    "prNumber": "PR-JAD-0511",
    "prId": "pr-jad-0511",
    "date": "2026-08-07",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000511000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0511-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1QDWf--hwS2PD-BxtRdOvnNI87BFrPk97=w1200"
  },
  {
    "id": "dc-jad-0512",
    "dcNumber": "DC 512",
    "invoiceNumber": "DC 512",
    "prNumber": "PR-JAD-0512",
    "prId": "pr-jad-0512",
    "date": "2026-08-07",
    "siteName": "Humak Model Town",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000512000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0512-1",
        "itemName": "Electrical Supplies & Consumables (Humak Model Town)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1Qmx-sLeOE77rOC7arLbA3PuoHSPGE13S=w1200"
  },
  {
    "id": "dc-jad-0513",
    "dcNumber": "DC 513",
    "invoiceNumber": "DC 513",
    "prNumber": "PR-JAD-0513",
    "prId": "pr-jad-0513",
    "date": "2026-08-07",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000513000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0513-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1EArg-UDtYIXqVIC6aD80GxEWc5BcRtJz=w1200"
  },
  {
    "id": "dc-jad-0514",
    "dcNumber": "DC 514",
    "invoiceNumber": "DC 514",
    "prNumber": "PR-JAD-0514",
    "prId": "pr-jad-0514",
    "date": "2026-08-07",
    "siteName": "Battal Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000514000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0514-1",
        "itemName": "Electrical Supplies & Consumables (Battal Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1xthJ8W8fTsglqxg11r-Th4FbhbyU_-Ls=w1200"
  },
  {
    "id": "dc-jad-0515",
    "dcNumber": "DC 515",
    "invoiceNumber": "DC 515",
    "prNumber": "PR-JAD-0515",
    "prId": "pr-jad-0515",
    "date": "2026-08-07",
    "siteName": "GP-1 Farm Bhalwal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000515000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0515-1",
        "itemName": "Electrical Supplies & Consumables (GP-1 Farm Bhalwal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1gwp5Hj1jjSztOuO10mVxmY6t3m0tAQsw=w1200"
  },
  {
    "id": "dc-jad-0516",
    "dcNumber": "DC 516",
    "invoiceNumber": "DC 516",
    "prNumber": "PR-JAD-0516",
    "prId": "pr-jad-0516",
    "date": "2026-08-07",
    "siteName": "B-2 1907",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000516000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0516-1",
        "itemName": "Electrical Supplies & Consumables (B-2 1907)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1K0ODFX0Pmd7O3RCkYgeGh29UgCjElIYZ=w1200"
  },
  {
    "id": "dc-jad-0517",
    "dcNumber": "DC 517",
    "invoiceNumber": "DC 517",
    "prNumber": "PR-JAD-0517",
    "prId": "pr-jad-0517",
    "date": "2026-08-07",
    "siteName": "Oggi Mansera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000517000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0517-1",
        "itemName": "Electrical Supplies & Consumables (Oggi Mansera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1Z4kbFjKOdTi1nkHhF6iNHjeLmr6Qf_Yj=w1200"
  },
  {
    "id": "dc-jad-0518",
    "dcNumber": "DC 518",
    "invoiceNumber": "DC 518",
    "prNumber": "PR-JAD-0518",
    "prId": "pr-jad-0518",
    "date": "2026-08-07",
    "siteName": "Kawajghang",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000518000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0518-1",
        "itemName": "Electrical Supplies & Consumables (Kawajghang)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1piSkMc9kmhXy2qAqSR1tXw00jQT7PYGW=w1200"
  },
  {
    "id": "dc-jad-0519",
    "dcNumber": "DC 519",
    "invoiceNumber": "DC 519",
    "prNumber": "PR-JAD-0519",
    "prId": "pr-jad-0519",
    "date": "2026-08-07",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000519000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0519-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1DyjbYxgSJ32SP32j8lYNhUygrreAX3x8=w1200"
  },
  {
    "id": "dc-jad-0520",
    "dcNumber": "DC 520",
    "invoiceNumber": "DC 520",
    "prNumber": "PR-JAD-0520",
    "prId": "pr-jad-0520",
    "date": "2026-08-07",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000520000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0520-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/19Rh-e8oMST1YB_wygQBheQZD0Ip7wBT5=w1200"
  },
  {
    "id": "dc-jad-0521",
    "dcNumber": "DC 521",
    "invoiceNumber": "DC 521",
    "prNumber": "PR-JAD-0521",
    "prId": "pr-jad-0521",
    "date": "2026-08-07",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000521000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0521-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #1762",
    "isBuiltyAttached": true,
    "biltyNumber": "1762",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay",
    "documentImage": "https://lh3.googleusercontent.com/d/1_fXI8ftgWcGXF5iFwuJpBGipFYrxefbI=w1200"
  },
  {
    "id": "dc-jad-0522",
    "dcNumber": "DC 522",
    "invoiceNumber": "DC 522",
    "prNumber": "PR-JAD-0522",
    "prId": "pr-jad-0522",
    "date": "2026-08-07",
    "siteName": "Hatchery Kotmomin",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000522000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0522-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Kotmomin)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1zNJu5LUPMuv1u1qbtmbNwMlnaNtnNM6g=w1200"
  },
  {
    "id": "dc-jad-0523",
    "dcNumber": "DC 523",
    "invoiceNumber": "DC 523",
    "prNumber": "PR-JAD-0523",
    "prId": "pr-jad-0523",
    "date": "2026-08-07",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000523000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0523-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1hnb8WKkR0F9fTJLWCeD7kf_eZb_UEB3L=w1200"
  },
  {
    "id": "dc-jad-0524",
    "dcNumber": "DC 524",
    "invoiceNumber": "DC 524",
    "prNumber": "PR-JAD-0524",
    "prId": "pr-jad-0524",
    "date": "2026-09-07",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000524000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0524-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1FJyCGKxX6DXqwphCKQbO9IQ0rEsZj6MP=w1200"
  },
  {
    "id": "dc-jad-0525",
    "dcNumber": "DC 525",
    "invoiceNumber": "DC 525",
    "prNumber": "PR-JAD-0525",
    "prId": "pr-jad-0525",
    "date": "2026-09-07",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000525000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0525-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1vKGSJERvYZ8cbNka8ChllPf9gaX5oeuB=w1200"
  },
  {
    "id": "dc-jad-0526",
    "dcNumber": "DC 526",
    "invoiceNumber": "DC 526",
    "prNumber": "PR-JAD-0526",
    "prId": "pr-jad-0526",
    "date": "2026-09-07",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000526000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0526-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/12IMc-mFjTRPSoYVII-yqUPCtVCacZ_Pl=w1200"
  },
  {
    "id": "dc-jad-0527",
    "dcNumber": "DC 527",
    "invoiceNumber": "DC 527",
    "prNumber": "PR-JAD-0527",
    "prId": "pr-jad-0527",
    "date": "2026-10-07",
    "siteName": "Hatchery Karachi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000527000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0527-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Karachi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1Yv3XKSEvM-Wzt0m3lIk1vek9lVPg1gf0=w1200"
  },
  {
    "id": "dc-jad-0528",
    "dcNumber": "DC 528",
    "invoiceNumber": "DC 528",
    "prNumber": "PR-JAD-0528",
    "prId": "pr-jad-0528",
    "date": "2026-07-13",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000528000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0528-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1Xvf8596UBLw06BmeyiAlEuISsv7kKSJo=w1200"
  },
  {
    "id": "dc-jad-0529",
    "dcNumber": "DC 529",
    "invoiceNumber": "DC 529",
    "prNumber": "PR-JAD-0529",
    "prId": "pr-jad-0529",
    "date": "2026-07-13",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000529000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0529-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1CKQgfAC457fQz05mLhiVmmmEW7c1M-1U=w1200"
  },
  {
    "id": "dc-jad-0530",
    "dcNumber": "DC 530",
    "invoiceNumber": "DC 530",
    "prNumber": "PR-JAD-0530",
    "prId": "pr-jad-0530",
    "date": "2026-07-13",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000530000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0530-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1eRCKbrJp3c-fVynUfl2_plUjicVGhn7B=w1200"
  },
  {
    "id": "dc-jad-0531",
    "dcNumber": "DC 531",
    "invoiceNumber": "DC 531",
    "prNumber": "PR-JAD-0531",
    "prId": "pr-jad-0531",
    "date": "2026-07-15",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000531000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0531-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1k0aRUoUqC-sPP9G0kweShgv_sl5BwX10=w1200"
  },
  {
    "id": "dc-jad-0532",
    "dcNumber": "DC 532",
    "invoiceNumber": "DC 532",
    "prNumber": "PR-JAD-0532",
    "prId": "pr-jad-0532",
    "date": "2026-07-15",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000532000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0532-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1T0-a6NKB5GHL8qAdf-Si6nvi3kIafPMn=w1200"
  },
  {
    "id": "dc-jad-0533",
    "dcNumber": "DC 533",
    "invoiceNumber": "DC 533",
    "prNumber": "PR-JAD-0533",
    "prId": "pr-jad-0533",
    "date": "2026-07-15",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000533000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0533-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1GhIaHmf-37Q-gWUm1h95SKQQkOwPh-N1=w1200"
  },
  {
    "id": "dc-jad-0534",
    "dcNumber": "DC 534",
    "invoiceNumber": "DC 534",
    "prNumber": "PR-JAD-0534",
    "prId": "pr-jad-0534",
    "date": "2026-07-15",
    "siteName": "WareHouse Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000534000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0534-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1K3mF0wdU5mTrQ5oVgqdhVTe2oQw-w7DQ=w1200"
  },
  {
    "id": "dc-jad-0535",
    "dcNumber": "DC 535",
    "invoiceNumber": "DC 535",
    "prNumber": "PR-JAD-0535",
    "prId": "pr-jad-0535",
    "date": "2026-07-17",
    "siteName": "GP-5 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000535000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0535-1",
        "itemName": "Electrical Supplies & Consumables (GP-5 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/12ydMBiGAmo-K7eT0P1qFwn1uXUetAs5Z=w1200"
  },
  {
    "id": "dc-jad-0536",
    "dcNumber": "DC 536",
    "invoiceNumber": "DC 536",
    "prNumber": "PR-JAD-0536",
    "prId": "pr-jad-0536",
    "date": "2026-07-18",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000536000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0536-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1qdNsZKOEOXN-JoiHh5g1hC6o6SH2JRFO=w1200"
  },
  {
    "id": "dc-jad-0537",
    "dcNumber": "DC 537",
    "invoiceNumber": "DC 537",
    "prNumber": "PR-JAD-0537",
    "prId": "pr-jad-0537",
    "date": "2026-07-18",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000537000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0537-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1Wfb2cDr1OkF1wEMADNGYH_clftbulHxp=w1200"
  },
  {
    "id": "dc-jad-0538",
    "dcNumber": "DC 538",
    "invoiceNumber": "DC 538",
    "prNumber": "PR-JAD-0538",
    "prId": "pr-jad-0538",
    "date": "2026-07-20",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000538000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0538-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1toEdABuKZQZ5CxZ2jIOkuEE7VeGz-9EQ=w1200"
  },
  {
    "id": "dc-jad-0539",
    "dcNumber": "DC 539",
    "invoiceNumber": "DC 539",
    "prNumber": "PR-JAD-0539",
    "prId": "pr-jad-0539",
    "date": "2026-07-20",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000539000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0539-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1uqkJRZmJEpjyxPUnAvo3Gx0mEAFU7kVe=w1200"
  },
  {
    "id": "dc-jad-0540",
    "dcNumber": "DC 540",
    "invoiceNumber": "DC 540",
    "prNumber": "PR-JAD-0540",
    "prId": "pr-jad-0540",
    "date": "2026-07-20",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000540000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0540-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/18ZUkeB2FF_WL0FtxfcYM5Q7sF0nNTLU_=w1200"
  },
  {
    "id": "dc-jad-0541",
    "dcNumber": "DC 541",
    "invoiceNumber": "DC 541",
    "prNumber": "PR-JAD-0541",
    "prId": "pr-jad-0541",
    "date": "2026-07-21",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000541000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0541-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/14pif4Owsv0d9KEfjkpEQl99P8mXtYeV9=w1200"
  },
  {
    "id": "dc-jad-0542",
    "dcNumber": "DC 542",
    "invoiceNumber": "DC 542",
    "prNumber": "PR-JAD-0542",
    "prId": "pr-jad-0542",
    "date": "2026-07-21",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000542000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0542-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1AZUIg_-z8a1z2GrilzQqWkekFEU-zgLL=w1200"
  },
  {
    "id": "dc-jad-0543",
    "dcNumber": "DC 543",
    "invoiceNumber": "DC 543",
    "prNumber": "PR-JAD-0543",
    "prId": "pr-jad-0543",
    "date": "2026-07-21",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000543000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0543-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1bJ24xTgFGFXIBF7EgkzdbVtES0psXLL0=w1200"
  },
  {
    "id": "dc-jad-0544",
    "dcNumber": "DC 544",
    "invoiceNumber": "DC 544",
    "prNumber": "PR-JAD-0544",
    "prId": "pr-jad-0544",
    "date": "2026-07-23",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000544000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0544-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1A39P2gLKTiTVCCMvTF1jqEsfcy7qxCo7=w1200"
  },
  {
    "id": "dc-jad-0545",
    "dcNumber": "DC 545",
    "invoiceNumber": "DC 545",
    "prNumber": "PR-JAD-0545",
    "prId": "pr-jad-0545",
    "date": "2026-07-23",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000545000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0545-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1MP06Me4AFuVtmtlrS8BOzHp0ioDmlc4w=w1200"
  },
  {
    "id": "dc-jad-0546",
    "dcNumber": "DC 546",
    "invoiceNumber": "DC 546",
    "prNumber": "PR-JAD-0546",
    "prId": "pr-jad-0546",
    "date": "2026-07-23",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000546000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0546-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1RaBkZD5I4OPlloxZsWJ2WixLj0dGgbOE=w1200"
  },
  {
    "id": "dc-jad-0547",
    "dcNumber": "DC 547",
    "invoiceNumber": "DC 547",
    "prNumber": "PR-JAD-0547",
    "prId": "pr-jad-0547",
    "date": "2026-07-23",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000547000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0547-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1h1h1to2tqRrwkHDCw7-CGgY3p4iDoGLX=w1200"
  },
  {
    "id": "dc-jad-0548",
    "dcNumber": "DC 548",
    "invoiceNumber": "DC 548",
    "prNumber": "PR-JAD-0548",
    "prId": "pr-jad-0548",
    "date": "2026-07-23",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000548000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0548-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1yA8UuYNJLBVxIjMC1PY1DfcmdFqKTMnr=w1200"
  },
  {
    "id": "dc-jad-0549",
    "dcNumber": "DC 549",
    "invoiceNumber": "DC 549",
    "prNumber": "PR-JAD-0549",
    "prId": "pr-jad-0549",
    "date": "2026-07-24",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000549000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0549-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1YoQIpzxdNDugVsEqI8X0Rz5ILct0thLr=w1200"
  },
  {
    "id": "dc-jad-0550",
    "dcNumber": "DC 550",
    "invoiceNumber": "DC 550",
    "prNumber": "PR-JAD-0550",
    "prId": "pr-jad-0550",
    "date": "2026-07-24",
    "siteName": "Agri Farm Bahawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000550000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0550-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Bahawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1bK2OvegFHI7FrVI7E2P7IMga-97mh7mi=w1200"
  },
  {
    "id": "dc-jad-0551",
    "dcNumber": "DC 551",
    "invoiceNumber": "DC 551",
    "prNumber": "PR-JAD-0551",
    "prId": "pr-jad-0551",
    "date": "2026-07-24",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000551000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0551-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0552",
    "dcNumber": "DC 552",
    "invoiceNumber": "DC 552",
    "prNumber": "PR-JAD-0552",
    "prId": "pr-jad-0552",
    "date": "2026-07-24",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000552000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0552-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0553",
    "dcNumber": "DC 553",
    "invoiceNumber": "DC 553",
    "prNumber": "PR-JAD-0553",
    "prId": "pr-jad-0553",
    "date": "2026-07-14",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000553000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0553-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0554",
    "dcNumber": "DC 554",
    "invoiceNumber": "DC 554",
    "prNumber": "PR-JAD-0554",
    "prId": "pr-jad-0554",
    "date": "2026-07-14",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000554000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0554-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0555",
    "dcNumber": "DC 555",
    "invoiceNumber": "DC 555",
    "prNumber": "PR-JAD-0555",
    "prId": "pr-jad-0555",
    "date": "2026-07-16",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000555000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0555-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0556",
    "dcNumber": "DC 556",
    "invoiceNumber": "DC 556",
    "prNumber": "PR-JAD-0556",
    "prId": "pr-jad-0556",
    "date": "2026-07-28",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000556000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0556-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0557",
    "dcNumber": "DC 557",
    "invoiceNumber": "DC 557",
    "prNumber": "PR-JAD-0557",
    "prId": "pr-jad-0557",
    "date": "2026-07-28",
    "siteName": "Agri Farm Rangpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000557000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0557-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Rangpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0558",
    "dcNumber": "DC 558",
    "invoiceNumber": "DC 558",
    "prNumber": "PR-JAD-0558",
    "prId": "pr-jad-0558",
    "date": "2026-07-28",
    "siteName": "Agri Farm Rangpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000558000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0558-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Rangpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #5331",
    "isBuiltyAttached": true,
    "biltyNumber": "5331",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0559",
    "dcNumber": "DC 559",
    "invoiceNumber": "DC 559",
    "prNumber": "PR-JAD-0559",
    "prId": "pr-jad-0559",
    "date": "2026-07-28",
    "siteName": "Kalar Kahar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000559000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0559-1",
        "itemName": "Electrical Supplies & Consumables (Kalar Kahar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0560",
    "dcNumber": "DC 560",
    "invoiceNumber": "DC 560",
    "prNumber": "PR-JAD-0560",
    "prId": "pr-jad-0560",
    "date": "2026-07-30",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000560000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0560-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0561",
    "dcNumber": "DC 561",
    "invoiceNumber": "DC 561",
    "prNumber": "PR-JAD-0561",
    "prId": "pr-jad-0561",
    "date": "2026-07-30",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000561000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0561-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0562",
    "dcNumber": "DC 562",
    "invoiceNumber": "DC 562",
    "prNumber": "PR-JAD-0562",
    "prId": "pr-jad-0562",
    "date": "2026-07-28",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000562000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0562-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0563",
    "dcNumber": "DC 563",
    "invoiceNumber": "DC 563",
    "prNumber": "PR-JAD-0563",
    "prId": "pr-jad-0563",
    "date": "2026-07-29",
    "siteName": "42/10R",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000563000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0563-1",
        "itemName": "Electrical Supplies & Consumables (42/10R)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #2034",
    "isBuiltyAttached": true,
    "biltyNumber": "2034",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0564",
    "dcNumber": "DC 564",
    "invoiceNumber": "DC 564",
    "prNumber": "PR-JAD-0564",
    "prId": "pr-jad-0564",
    "date": "2026-07-29",
    "siteName": "Kalar Kahar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000564000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0564-1",
        "itemName": "Electrical Supplies & Consumables (Kalar Kahar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0565",
    "dcNumber": "DC 565",
    "invoiceNumber": "DC 565",
    "prNumber": "PR-JAD-0565",
    "prId": "pr-jad-0565",
    "date": "2026-07-31",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000565000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0565-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0566",
    "dcNumber": "DC 566",
    "invoiceNumber": "DC 566",
    "prNumber": "PR-JAD-0566",
    "prId": "pr-jad-0566",
    "date": "2026-07-31",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000566000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0566-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0567",
    "dcNumber": "DC 567",
    "invoiceNumber": "DC 567",
    "prNumber": "PR-JAD-0567",
    "prId": "pr-jad-0567",
    "date": "2026-07-31",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000567000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0567-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0568",
    "dcNumber": "DC 568",
    "invoiceNumber": "DC 568",
    "prNumber": "PR-JAD-0568",
    "prId": "pr-jad-0568",
    "date": "2026-07-31",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000568000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0568-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0569",
    "dcNumber": "DC 569",
    "invoiceNumber": "DC 569",
    "prNumber": "PR-JAD-0569",
    "prId": "pr-jad-0569",
    "date": "2026-01-08",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000569000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0569-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0570",
    "dcNumber": "DC 570",
    "invoiceNumber": "DC 570",
    "prNumber": "PR-JAD-0570",
    "prId": "pr-jad-0570",
    "date": "2026-03-08",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000570000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0570-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #3751",
    "isBuiltyAttached": true,
    "biltyNumber": "3751",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0571",
    "dcNumber": "DC 571",
    "invoiceNumber": "DC 571",
    "prNumber": "PR-JAD-0571",
    "prId": "pr-jad-0571",
    "date": "2026-03-08",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000571000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0571-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0572",
    "dcNumber": "DC 572",
    "invoiceNumber": "DC 572",
    "prNumber": "PR-JAD-0572",
    "prId": "pr-jad-0572",
    "date": "2026-03-08",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000572000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0572-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0573",
    "dcNumber": "DC 573",
    "invoiceNumber": "DC 573",
    "prNumber": "PR-JAD-0573",
    "prId": "pr-jad-0573",
    "date": "2026-03-08",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000573000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0573-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0574",
    "dcNumber": "DC 574",
    "invoiceNumber": "DC 574",
    "prNumber": "PR-JAD-0574",
    "prId": "pr-jad-0574",
    "date": "2026-03-08",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000574000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0574-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0575",
    "dcNumber": "DC 575",
    "invoiceNumber": "DC 575",
    "prNumber": "PR-JAD-0575",
    "prId": "pr-jad-0575",
    "date": "2026-04-08",
    "siteName": "House 10 ISB",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000575000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0575-1",
        "itemName": "Electrical Supplies & Consumables (House 10 ISB)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0576",
    "dcNumber": "DC 576",
    "invoiceNumber": "DC 576",
    "prNumber": "PR-JAD-0576",
    "prId": "pr-jad-0576",
    "date": "2026-04-08",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000576000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0576-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0577",
    "dcNumber": "DC 577",
    "invoiceNumber": "DC 577",
    "prNumber": "PR-JAD-0577",
    "prId": "pr-jad-0577",
    "date": "2026-06-08",
    "siteName": "Feed Mill Shahkot",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000577000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0577-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Shahkot)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0578",
    "dcNumber": "DC 578",
    "invoiceNumber": "DC 578",
    "prNumber": "PR-JAD-0578",
    "prId": "pr-jad-0578",
    "date": "2026-07-08",
    "siteName": "Agri Farm Mankera 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000578000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0578-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #4244",
    "isBuiltyAttached": true,
    "biltyNumber": "4244",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0579",
    "dcNumber": "DC 579",
    "invoiceNumber": "DC 579",
    "prNumber": "PR-JAD-0579",
    "prId": "pr-jad-0579",
    "date": "2026-07-08",
    "siteName": "Agri Farm Mankera 2",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000579000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0579-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera 2)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0580",
    "dcNumber": "DC 580",
    "invoiceNumber": "DC 580",
    "prNumber": "PR-JAD-0580",
    "prId": "pr-jad-0580",
    "date": "2026-07-08",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000580000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0580-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #2085",
    "isBuiltyAttached": true,
    "biltyNumber": "2085",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0581",
    "dcNumber": "DC 581",
    "invoiceNumber": "DC 581",
    "prNumber": "PR-JAD-0581",
    "prId": "pr-jad-0581",
    "date": "2026-07-08",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000581000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0581-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #6561",
    "isBuiltyAttached": true,
    "biltyNumber": "6561",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0582",
    "dcNumber": "DC 582",
    "invoiceNumber": "DC 582",
    "prNumber": "PR-JAD-0582",
    "prId": "pr-jad-0582",
    "date": "2026-07-08",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000582000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0582-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0583",
    "dcNumber": "DC 583",
    "invoiceNumber": "DC 583",
    "prNumber": "PR-JAD-0583",
    "prId": "pr-jad-0583",
    "date": "2026-07-08",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000583000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0583-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0584",
    "dcNumber": "DC 584",
    "invoiceNumber": "DC 584",
    "prNumber": "PR-JAD-0584",
    "prId": "pr-jad-0584",
    "date": "2026-07-08",
    "siteName": "Khanewal Hatchery",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000584000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0584-1",
        "itemName": "Electrical Supplies & Consumables (Khanewal Hatchery)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0585",
    "dcNumber": "DC 585",
    "invoiceNumber": "DC 585",
    "prNumber": "PR-JAD-0585",
    "prId": "pr-jad-0585",
    "date": "2026-07-08",
    "siteName": "Farm Mankera Bhakkar",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000585000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0585-1",
        "itemName": "Electrical Supplies & Consumables (Farm Mankera Bhakkar)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0586",
    "dcNumber": "DC 586",
    "invoiceNumber": "DC 586",
    "prNumber": "PR-JAD-0586",
    "prId": "pr-jad-0586",
    "date": "2026-08-08",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000586000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0586-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0587",
    "dcNumber": "DC 587",
    "invoiceNumber": "DC 587",
    "prNumber": "PR-JAD-0587",
    "prId": "pr-jad-0587",
    "date": "2026-08-08",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000587000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0587-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0588",
    "dcNumber": "DC 588",
    "invoiceNumber": "DC 588",
    "prNumber": "PR-JAD-0588",
    "prId": "pr-jad-0588",
    "date": "2026-11-08",
    "siteName": "GP-1 Farm Bhalwal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000588000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0588-1",
        "itemName": "Electrical Supplies & Consumables (GP-1 Farm Bhalwal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0589",
    "dcNumber": "DC 589",
    "invoiceNumber": "DC 589",
    "prNumber": "PR-JAD-0589",
    "prId": "pr-jad-0589",
    "date": "2026-08-08",
    "siteName": "WareHouse Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000589000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0589-1",
        "itemName": "Electrical Supplies & Consumables (WareHouse Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0590",
    "dcNumber": "DC 590",
    "invoiceNumber": "DC 590",
    "prNumber": "PR-JAD-0590",
    "prId": "pr-jad-0590",
    "date": "2026-12-08",
    "siteName": "42/10R",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000590000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0590-1",
        "itemName": "Electrical Supplies & Consumables (42/10R)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0591",
    "dcNumber": "DC 591",
    "invoiceNumber": "DC 591",
    "prNumber": "PR-JAD-0591",
    "prId": "pr-jad-0591",
    "date": "2026-12-08",
    "siteName": "66-10/R Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000591000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0591-1",
        "itemName": "Electrical Supplies & Consumables (66-10/R Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0592",
    "dcNumber": "DC 592",
    "invoiceNumber": "DC 592",
    "prNumber": "PR-JAD-0592",
    "prId": "pr-jad-0592",
    "date": "2026-12-08",
    "siteName": "Jungle Maryala Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000592000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0592-1",
        "itemName": "Electrical Supplies & Consumables (Jungle Maryala Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0593",
    "dcNumber": "DC 593",
    "invoiceNumber": "DC 593",
    "prNumber": "PR-JAD-0593",
    "prId": "pr-jad-0593",
    "date": "2026-12-08",
    "siteName": "Pirowal 1 Extension Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000593000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0593-1",
        "itemName": "Electrical Supplies & Consumables (Pirowal 1 Extension Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0594",
    "dcNumber": "DC 594",
    "invoiceNumber": "DC 594",
    "prNumber": "PR-JAD-0594",
    "prId": "pr-jad-0594",
    "date": "2026-12-08",
    "siteName": "P2 Pirowal 2 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000594000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0594-1",
        "itemName": "Electrical Supplies & Consumables (P2 Pirowal 2 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0595",
    "dcNumber": "DC 595",
    "invoiceNumber": "DC 595",
    "prNumber": "PR-JAD-0595",
    "prId": "pr-jad-0595",
    "date": "2026-08-13",
    "siteName": "House 9 F-6/3",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000595000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0595-1",
        "itemName": "Electrical Supplies & Consumables (House 9 F-6/3)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0596",
    "dcNumber": "DC 596",
    "invoiceNumber": "DC 596",
    "prNumber": "PR-JAD-0596",
    "prId": "pr-jad-0596",
    "date": "2026-08-13",
    "siteName": "J.T.C Islamabad",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000596000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0596-1",
        "itemName": "Electrical Supplies & Consumables (J.T.C Islamabad)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0597",
    "dcNumber": "DC 597",
    "invoiceNumber": "DC 597",
    "prNumber": "PR-JAD-0597",
    "prId": "pr-jad-0597",
    "date": "2026-08-17",
    "siteName": "66-10/R Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000597000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0597-1",
        "itemName": "Electrical Supplies & Consumables (66-10/R Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0598",
    "dcNumber": "DC 598",
    "invoiceNumber": "DC 598",
    "prNumber": "PR-JAD-0598",
    "prId": "pr-jad-0598",
    "date": "2026-08-17",
    "siteName": "GP-5 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000598000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0598-1",
        "itemName": "Electrical Supplies & Consumables (GP-5 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #2250",
    "isBuiltyAttached": true,
    "biltyNumber": "2250",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0599",
    "dcNumber": "DC 599",
    "invoiceNumber": "DC 599",
    "prNumber": "PR-JAD-0599",
    "prId": "pr-jad-0599",
    "date": "2026-08-17",
    "siteName": "GP-5 Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000599000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0599-1",
        "itemName": "Electrical Supplies & Consumables (GP-5 Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #2251",
    "isBuiltyAttached": true,
    "biltyNumber": "2251",
    "addaName": "Goods Transport",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0600",
    "dcNumber": "DC 600",
    "invoiceNumber": "DC 600",
    "prNumber": "PR-JAD-0600",
    "prId": "pr-jad-0600",
    "date": "2026-08-17",
    "siteName": "Jungle Maryala Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000600000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0600-1",
        "itemName": "Electrical Supplies & Consumables (Jungle Maryala Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0601",
    "dcNumber": "DC 601",
    "invoiceNumber": "DC 601",
    "prNumber": "PR-JAD-0601",
    "prId": "pr-jad-0601",
    "date": "2026-08-18",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000601000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0601-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7701",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1mIfvmXP34QCSkpxDlNwY3ctZMHH5HyuJ=w1200",
    "biltyNumber": "7701",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0602",
    "dcNumber": "DC 602",
    "invoiceNumber": "DC 602",
    "prNumber": "PR-JAD-0602",
    "prId": "pr-jad-0602",
    "date": "2026-08-18",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000602000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0602-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7702",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1jj8RPvZNuCTKWKilO-YGfvgJJ3nXqk6i=w1200",
    "biltyNumber": "7702",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0603",
    "dcNumber": "DC 603",
    "invoiceNumber": "DC 603",
    "prNumber": "PR-JAD-0603",
    "prId": "pr-jad-0603",
    "date": "2026-08-18",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000603000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0603-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/16FGunZRKcy0x1MuYhdX91IfbhwQsJzQ3=w1200"
  },
  {
    "id": "dc-jad-0604",
    "dcNumber": "DC 604",
    "invoiceNumber": "DC 604",
    "prNumber": "PR-JAD-0604",
    "prId": "pr-jad-0604",
    "date": "2026-08-19",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000604000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0604-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7704",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1rXNQGPb-IR7ceNVkZJszdUvVhxg1hVST=w1200",
    "biltyNumber": "7704",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0605",
    "dcNumber": "DC 605",
    "invoiceNumber": "DC 605",
    "prNumber": "PR-JAD-0605",
    "prId": "pr-jad-0605",
    "date": "2026-08-19",
    "siteName": "Agri Farm Mankera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000605000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0605-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7705",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1v7wx0TwLtIs8_YV3R1Ql0pjGh1Yrdo5H=w1200",
    "biltyNumber": "7705",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0606",
    "dcNumber": "DC 606",
    "invoiceNumber": "DC 606",
    "prNumber": "PR-JAD-0606",
    "prId": "pr-jad-0606",
    "date": "2026-08-20",
    "siteName": "Jadeed Feed Mil Shahcoat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000606000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0606-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Feed Mil Shahcoat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1PZHHeWRGla01Ia05GYSE0vOI4c2s_GkM=w1200"
  },
  {
    "id": "dc-jad-0607",
    "dcNumber": "DC 607",
    "invoiceNumber": "DC 607",
    "prNumber": "PR-JAD-0607",
    "prId": "pr-jad-0607",
    "date": "2026-08-20",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000607000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0607-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7707",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1tLCpLhYwrlBjNxY8sG7uG-gzFSM4qKhF=w1200",
    "biltyNumber": "7707",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0608",
    "dcNumber": "DC 608",
    "invoiceNumber": "DC 608",
    "prNumber": "PR-JAD-0608",
    "prId": "pr-jad-0608",
    "date": "2026-08-21",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000608000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0608-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7708",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/16uPo702XoSCdNMTXXsS9iK2hY4WcZ13x=w1200",
    "biltyNumber": "7708",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0609",
    "dcNumber": "DC 609",
    "invoiceNumber": "DC 609",
    "prNumber": "PR-JAD-0609",
    "prId": "pr-jad-0609",
    "date": "2026-08-21",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000609000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0609-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1RNohV09NJdo2Ce4OWy--7Hi_elMJDdmM=w1200"
  },
  {
    "id": "dc-jad-0610",
    "dcNumber": "DC 610",
    "invoiceNumber": "DC 610",
    "prNumber": "PR-JAD-0610",
    "prId": "pr-jad-0610",
    "date": "2026-08-21",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000610000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0610-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7710",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1UwprC0DuVRPP_VMcllyE4zsa4U0TTEN6=w1200",
    "biltyNumber": "7710",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0611",
    "dcNumber": "DC 611",
    "invoiceNumber": "DC 611",
    "prNumber": "PR-JAD-0611",
    "prId": "pr-jad-0611",
    "date": "2026-08-22",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000611000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0611-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7711",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1yE6zQbfWcSx5j9cpZiv5GPciVNo3AToX=w1200",
    "biltyNumber": "7711",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0612",
    "dcNumber": "DC 612",
    "invoiceNumber": "DC 612",
    "prNumber": "PR-JAD-0612",
    "prId": "pr-jad-0612",
    "date": "2026-08-22",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000612000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0612-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/17V_Ors4ha6Hq12vPSfQH33RnVXxmXyHv=w1200"
  },
  {
    "id": "dc-jad-0613",
    "dcNumber": "DC 613",
    "invoiceNumber": "DC 613",
    "prNumber": "PR-JAD-2026-613",
    "prId": "pr-jad-0613",
    "date": "2026-09-12",
    "siteName": "Jadeed Farm - Khanewal Site B",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000613000,
    "itemsShipped": [
      {
        "itemId": "item-613-1",
        "itemName": "95mm 4-Core Armoured XLPE Copper Cable",
        "brand": "Pakistan Cables",
        "quantity": 400,
        "unit": "Meters"
      },
      {
        "itemId": "item-613-2",
        "itemName": "250A 3-Pole MCCB Breaker (Adjustable)",
        "brand": "Schneider Electric",
        "quantity": 6,
        "unit": "Pcs"
      },
      {
        "itemId": "item-613-3",
        "itemName": "150W IP66 LED Floodlight (6500K)",
        "brand": "Philips / Pak Lighting",
        "quantity": 40,
        "unit": "Pcs"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7713",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1SxZQJoT6ifuapw-9JSOyiqIJUGG-hum3=w1200",
    "biltyNumber": "7713",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay",
    "driverName": "Nawaz",
    "vehicleNumber": "STS-1500"
  },
  {
    "id": "dc-jad-0614",
    "dcNumber": "DC 614",
    "invoiceNumber": "DC 614",
    "prNumber": "PR-JAD-2026-614",
    "prId": "pr-jad-0614",
    "date": "2026-09-15",
    "siteName": "Jadeed Hatchery - Chakwal Main Complex",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000614000,
    "itemsShipped": [
      {
        "itemId": "item-614-1",
        "itemName": "50mm 4-Core Flexible Cu Power Cable",
        "brand": "Amer Cables",
        "quantity": 300,
        "unit": "Meters"
      },
      {
        "itemId": "item-614-2",
        "itemName": "100A 3-Pole Air Circuit Breaker",
        "brand": "Terasaki",
        "quantity": 4,
        "unit": "Pcs"
      },
      {
        "itemId": "item-614-3",
        "itemName": "2 Inch PVC Heavy Electrical Conduit Pipe",
        "brand": "Conduit & Accessories",
        "quantity": 100,
        "unit": "Lengths"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7714",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1yhIpyf0uSkHB2RQlTZmjC5i9YP2bW9ti=w1200",
    "biltyNumber": "7714",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid",
    "driverName": "Nawaz",
    "vehicleNumber": "STS-1500"
  },
  {
    "id": "dc-jad-0615",
    "dcNumber": "DC 615",
    "invoiceNumber": "DC 615",
    "prNumber": "PR-JAD-0615",
    "prId": "pr-jad-0615",
    "date": "2026-08-24",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000615000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0615-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1E1kZ_vhmUrmncZuBTitQxGH7Dpi7Jm9v=w1200"
  },
  {
    "id": "dc-jad-0616",
    "dcNumber": "DC 616",
    "invoiceNumber": "DC 616",
    "prNumber": "PR-JAD-0616",
    "prId": "pr-jad-0616",
    "date": "2026-08-24",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000616000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0616-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7716",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1alOtcbSxC41DSUwSejBH2cSJP_xEYoRY=w1200",
    "biltyNumber": "7716",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0617",
    "dcNumber": "DC 617",
    "invoiceNumber": "DC 617",
    "prNumber": "PR-JAD-0617",
    "prId": "pr-jad-0617",
    "date": "2026-08-25",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000617000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0617-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7717",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1JfdHhGm3kOIYlejoMroIx5dSwuTOJrlV=w1200",
    "biltyNumber": "7717",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0618",
    "dcNumber": "DC 618",
    "invoiceNumber": "DC 618",
    "prNumber": "PR-JAD-0618",
    "prId": "pr-jad-0618",
    "date": "2026-08-25",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000618000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0618-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1z4HKbgtyXGAOCtyEuOEHGOp3AGNlw_05=w1200"
  },
  {
    "id": "dc-jad-0619",
    "dcNumber": "DC 619",
    "invoiceNumber": "DC 619",
    "prNumber": "PR-JAD-0619",
    "prId": "pr-jad-0619",
    "date": "2026-08-25",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000619000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0619-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7719",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1sNd-1Vodvljk9CPgETubRWc5ZazS0oe1=w1200",
    "biltyNumber": "7719",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0620",
    "dcNumber": "DC 620",
    "invoiceNumber": "DC 620",
    "prNumber": "PR-JAD-0620",
    "prId": "pr-jad-0620",
    "date": "2026-08-26",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000620000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0620-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7720",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/18mheadrzWcQox_lLVC3RD-X8OZfqJ72N=w1200",
    "biltyNumber": "7720",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0621",
    "dcNumber": "DC 621",
    "invoiceNumber": "DC 621",
    "prNumber": "PR-JAD-0621",
    "prId": "pr-jad-0621",
    "date": "2026-08-26",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000621000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0621-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1x5wDEM2ClRiX2VpiOYM4N6Zb1-e3aG0o=w1200"
  },
  {
    "id": "dc-jad-0622",
    "dcNumber": "DC 622",
    "invoiceNumber": "DC 622",
    "prNumber": "PR-JAD-0622",
    "prId": "pr-jad-0622",
    "date": "2026-08-27",
    "siteName": "Agri Farm Mankera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000622000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0622-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7722",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1Y2zyAnzmggEGrmy_qMrTHZRcFsWtTIrv=w1200",
    "biltyNumber": "7722",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0623",
    "dcNumber": "DC 623",
    "invoiceNumber": "DC 623",
    "prNumber": "PR-JAD-0623",
    "prId": "pr-jad-0623",
    "date": "2026-08-27",
    "siteName": "Jadeed Feed Mil Shahcoat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000623000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0623-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Feed Mil Shahcoat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7723",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1NhJTFlZGFUYaIAm2XfOgOWbhN9emvoJl=w1200",
    "biltyNumber": "7723",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0624",
    "dcNumber": "DC 624",
    "invoiceNumber": "DC 624",
    "prNumber": "PR-JAD-0624",
    "prId": "pr-jad-0624",
    "date": "2026-08-28",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000624000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0624-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1D3H43wE94UexFBFXMsncxkWbauzEjWj4=w1200"
  },
  {
    "id": "dc-jad-0625",
    "dcNumber": "DC 625",
    "invoiceNumber": "DC 625",
    "prNumber": "PR-JAD-0625",
    "prId": "pr-jad-0625",
    "date": "2026-08-28",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000625000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0625-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7725",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1GQe6jubjmmYsjJWU23YYX_vALbThq4nw=w1200",
    "biltyNumber": "7725",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0626",
    "dcNumber": "DC 626",
    "invoiceNumber": "DC 626",
    "prNumber": "PR-JAD-0626",
    "prId": "pr-jad-0626",
    "date": "2026-08-29",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000626000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0626-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7726",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1Ii2ObGCFmbkEmc6EkYjJPcL7g3x4zRkC=w1200",
    "biltyNumber": "7726",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0627",
    "dcNumber": "DC 627",
    "invoiceNumber": "DC 627",
    "prNumber": "PR-JAD-0627",
    "prId": "pr-jad-0627",
    "date": "2026-08-29",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000627000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0627-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1jWswN_4kQSCTjQdauDtgxGU19gNlUcTp=w1200"
  },
  {
    "id": "dc-jad-0628",
    "dcNumber": "DC 628",
    "invoiceNumber": "DC 628",
    "prNumber": "PR-JAD-0628",
    "prId": "pr-jad-0628",
    "date": "2026-08-29",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000628000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0628-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7728",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1SZTVyRkYrM87faoSoLqWVUMUWDMpFGET=w1200",
    "biltyNumber": "7728",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0629",
    "dcNumber": "DC 629",
    "invoiceNumber": "DC 629",
    "prNumber": "PR-JAD-0629",
    "prId": "pr-jad-0629",
    "date": "2026-08-30",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000629000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0629-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7729",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1dPOjmCxND3fBv85Ol98zUV1iIbNZGn20=w1200",
    "biltyNumber": "7729",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0630",
    "dcNumber": "DC 630",
    "invoiceNumber": "DC 630",
    "prNumber": "PR-JAD-0630",
    "prId": "pr-jad-0630",
    "date": "2026-08-30",
    "siteName": "Jadeed Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000630000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0630-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0631",
    "dcNumber": "DC 631",
    "invoiceNumber": "DC 631",
    "prNumber": "PR-JAD-0631",
    "prId": "pr-jad-0631",
    "date": "2026-08-31",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000631000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0631-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7731",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1bZvd5w1PCwj2twV7hekLxOFtDpIQlZA-=w1200",
    "biltyNumber": "7731",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0632",
    "dcNumber": "DC 632",
    "invoiceNumber": "DC 632",
    "prNumber": "PR-JAD-0632",
    "prId": "pr-jad-0632",
    "date": "2026-08-31",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000632000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0632-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7732",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1JA-_ePDtQ9zGhie_nWajuU6DvbvxD0ua=w1200",
    "biltyNumber": "7732",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0633",
    "dcNumber": "DC 633",
    "invoiceNumber": "DC 633",
    "prNumber": "PR-JAD-0633",
    "prId": "pr-jad-0633",
    "date": "2026-09-01",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000633000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0633-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1ch6u1-YKLAkA6O6X2rDUnQzX1qtaeCnP=w1200"
  },
  {
    "id": "dc-jad-0634",
    "dcNumber": "DC 634",
    "invoiceNumber": "DC 634",
    "prNumber": "PR-JAD-0634",
    "prId": "pr-jad-0634",
    "date": "2026-09-01",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000634000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0634-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7734",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1Fdkc_kzRoMgVk9OtEtAxXJtzZo7h6DuT=w1200",
    "biltyNumber": "7734",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0635",
    "dcNumber": "DC 635",
    "invoiceNumber": "DC 635",
    "prNumber": "PR-JAD-0635",
    "prId": "pr-jad-0635",
    "date": "2026-09-01",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000635000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0635-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7735",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1YafJbPQAuWj6cIC8maDUjFkLMDC-LtXe=w1200",
    "biltyNumber": "7735",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0636",
    "dcNumber": "DC 636",
    "invoiceNumber": "DC 636",
    "prNumber": "PR-JAD-0636",
    "prId": "pr-jad-0636",
    "date": "2026-09-02",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000636000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0636-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1mi87GAWNDQsiM5idppYFJAF6wbUc4_m-=w1200"
  },
  {
    "id": "dc-jad-0637",
    "dcNumber": "DC 637",
    "invoiceNumber": "DC 637",
    "prNumber": "PR-JAD-0637",
    "prId": "pr-jad-0637",
    "date": "2026-09-02",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000637000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0637-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7737",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1HEZNFUoRtd4CPk7PpmhHUZFNPaaBUvA9=w1200",
    "biltyNumber": "7737",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0638",
    "dcNumber": "DC 638",
    "invoiceNumber": "DC 638",
    "prNumber": "PR-JAD-0638",
    "prId": "pr-jad-0638",
    "date": "2026-09-03",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000638000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0638-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7738",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1riPM3kTyAeJZEG7Dop-PWoinB_4NMTo8=w1200",
    "biltyNumber": "7738",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0639",
    "dcNumber": "DC 639",
    "invoiceNumber": "DC 639",
    "prNumber": "PR-JAD-0639",
    "prId": "pr-jad-0639",
    "date": "2026-09-03",
    "siteName": "Agri Farm Mankera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000639000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0639-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0640",
    "dcNumber": "DC 640",
    "invoiceNumber": "DC 640",
    "prNumber": "PR-JAD-0640",
    "prId": "pr-jad-0640",
    "date": "2026-09-04",
    "siteName": "Jadeed Feed Mil Shahcoat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000640000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0640-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Feed Mil Shahcoat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7740",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1ec_zBjHh7CwHp4flOafP_XX80xtQ7Kth=w1200",
    "biltyNumber": "7740",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0641",
    "dcNumber": "DC 641",
    "invoiceNumber": "DC 641",
    "prNumber": "PR-JAD-0641",
    "prId": "pr-jad-0641",
    "date": "2026-09-04",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000641000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0641-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7741",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1M2kXSMuHXOIl4FccMIllX3ccDOJzNm18=w1200",
    "biltyNumber": "7741",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0642",
    "dcNumber": "DC 642",
    "invoiceNumber": "DC 642",
    "prNumber": "PR-JAD-0642",
    "prId": "pr-jad-0642",
    "date": "2026-09-05",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000642000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0642-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/127v-WnSpPDcrGvsGcEH5fspBxqytpQ_W=w1200"
  },
  {
    "id": "dc-jad-0643",
    "dcNumber": "DC 643",
    "invoiceNumber": "DC 643",
    "prNumber": "PR-JAD-0643",
    "prId": "pr-jad-0643",
    "date": "2026-09-05",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000643000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0643-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7743",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1Wc8DFLAuXjr925VQvnXsmygd9ZQSsLm5=w1200",
    "biltyNumber": "7743",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0644",
    "dcNumber": "DC 644",
    "invoiceNumber": "DC 644",
    "prNumber": "PR-JAD-0644",
    "prId": "pr-jad-0644",
    "date": "2026-09-05",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000644000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0644-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7744",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1XODGAvsyP84usHRE8NmcebMpV3ljJdX7=w1200",
    "biltyNumber": "7744",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0645",
    "dcNumber": "DC 645",
    "invoiceNumber": "DC 645",
    "prNumber": "PR-JAD-0645",
    "prId": "pr-jad-0645",
    "date": "2026-09-06",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000645000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0645-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1lyK419n8Q_OH5hL3YzCuCxCN3BSnHhlA=w1200"
  },
  {
    "id": "dc-jad-0646",
    "dcNumber": "DC 646",
    "invoiceNumber": "DC 646",
    "prNumber": "PR-JAD-0646",
    "prId": "pr-jad-0646",
    "date": "2026-09-06",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000646000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0646-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7746",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/15i9fhpAnjNjxz3rOfPNqoQpVwSkBThjt=w1200",
    "biltyNumber": "7746",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0647",
    "dcNumber": "DC 647",
    "invoiceNumber": "DC 647",
    "prNumber": "PR-JAD-0647",
    "prId": "pr-jad-0647",
    "date": "2026-09-07",
    "siteName": "Jadeed Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000647000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0647-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7747",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1FKaM47sXWR893FQu0j8DsewWJdoig8J9=w1200",
    "biltyNumber": "7747",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0648",
    "dcNumber": "DC 648",
    "invoiceNumber": "DC 648",
    "prNumber": "PR-JAD-0648",
    "prId": "pr-jad-0648",
    "date": "2026-09-07",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000648000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0648-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1muSg84-P5OuvSntHgLHTa5iUCCbEC4QR=w1200"
  },
  {
    "id": "dc-jad-0649",
    "dcNumber": "DC 649",
    "invoiceNumber": "DC 649",
    "prNumber": "PR-JAD-0649",
    "prId": "pr-jad-0649",
    "date": "2026-09-08",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000649000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0649-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7749",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1GfQFAmr1sdR0br4KYyz_nYoJ-DgIXA6N=w1200",
    "biltyNumber": "7749",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0650",
    "dcNumber": "DC 650",
    "invoiceNumber": "DC 650",
    "prNumber": "PR-JAD-0650",
    "prId": "pr-jad-0650",
    "date": "2026-09-08",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000650000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0650-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7750",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1fMeWjVX_xfNgGdMyJcBe0F8RIilWQuFP=w1200",
    "biltyNumber": "7750",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0651",
    "dcNumber": "DC 651",
    "invoiceNumber": "DC 651",
    "prNumber": "PR-JAD-0651",
    "prId": "pr-jad-0651",
    "date": "2026-09-09",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000651000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0651-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false,
    "documentImage": "https://lh3.googleusercontent.com/d/1hBdvaGwBbIx7LRBdWI8JlqQQm_pfBUDp=w1200"
  },
  {
    "id": "dc-jad-0652",
    "dcNumber": "DC 652",
    "invoiceNumber": "DC 652",
    "prNumber": "PR-JAD-0652",
    "prId": "pr-jad-0652",
    "date": "2026-09-14",
    "siteName": "Jadeed Group Oil Mill Khanewal via Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000652000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0652-1",
        "itemName": "Pannel LED Light 2'x2' 48 watts 6500K Venus Imp.",
        "brand": "Venus Imp.",
        "quantity": 100,
        "unit": "nos"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Received by Raj 15/9/26 | Venus Imp.",
    "isBuiltyAttached": true,
    "documentImage": "https://lh3.googleusercontent.com/d/1LaP42R6NWjrDghhJ9fR327x1GLqvrLdl=w1200",
    "biltyNumber": "7752",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0653",
    "dcNumber": "DC 653",
    "invoiceNumber": "DC 653",
    "prNumber": "PR-JAD-0653",
    "prId": "pr-jad-0653",
    "date": "2026-09-09",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000653000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0653-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7753",
    "isBuiltyAttached": true,
    "biltyNumber": "7753",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0654",
    "dcNumber": "DC 654",
    "invoiceNumber": "DC 654",
    "prNumber": "PR-JAD-0654",
    "prId": "pr-jad-0654",
    "date": "2026-09-10",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000654000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0654-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0655",
    "dcNumber": "DC 655",
    "invoiceNumber": "DC 655",
    "prNumber": "PR-JAD-0655",
    "prId": "pr-jad-0655",
    "date": "2026-09-11",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000655000,
    "itemsShipped": [
      {
        "itemId": "item-655-1",
        "itemName": "Electrical Supplies & Switchgear Consumables",
        "brand": "Schneider Electric",
        "quantity": 12,
        "unit": "Numbers"
      },
      {
        "itemId": "item-655-2",
        "itemName": "Flexible Copper Wire 2.5mm Single Core",
        "brand": "Pakistan Cables",
        "quantity": 300,
        "unit": "Meters"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Dispatched to Ware House Rawat for Central Distribution",
    "isBuiltyAttached": true,
    "biltyNumber": "7755",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay",
    "driverName": "Nawaz",
    "vehicleNumber": "STS-1500"
  },
  {
    "id": "dc-jad-0656",
    "dcNumber": "DC 656",
    "invoiceNumber": "DC 656",
    "prNumber": "PR-JAD-0656",
    "prId": "pr-jad-0656",
    "date": "2026-09-11",
    "siteName": "Agri Farm Mankera",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000656000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0656-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Mankera)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7756",
    "isBuiltyAttached": true,
    "biltyNumber": "7756",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0657",
    "dcNumber": "DC 657",
    "invoiceNumber": "DC 657",
    "prNumber": "PR-JAD-0657",
    "prId": "pr-jad-0657",
    "date": "2026-09-11",
    "siteName": "Jadeed Feed Mil Shahcoat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000657000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0657-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Feed Mil Shahcoat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0658",
    "dcNumber": "DC 658",
    "invoiceNumber": "DC 658",
    "prNumber": "PR-JAD-0658",
    "prId": "pr-jad-0658",
    "date": "2026-09-12",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000658000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0658-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7758",
    "isBuiltyAttached": true,
    "biltyNumber": "7758",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0659",
    "dcNumber": "DC 659",
    "invoiceNumber": "DC 659",
    "prNumber": "PR-JAD-0659",
    "prId": "pr-jad-0659",
    "date": "2026-09-12",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000659000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0659-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7759",
    "isBuiltyAttached": true,
    "biltyNumber": "7759",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0660",
    "dcNumber": "DC 660",
    "invoiceNumber": "DC 660",
    "prNumber": "PR-JAD-0660",
    "prId": "pr-jad-0660",
    "date": "2026-09-12",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000660000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0660-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0661",
    "dcNumber": "DC 661",
    "invoiceNumber": "DC 661",
    "prNumber": "PR-JAD-0661",
    "prId": "pr-jad-0661",
    "date": "2026-09-13",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000661000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0661-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7761",
    "isBuiltyAttached": true,
    "biltyNumber": "7761",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0662",
    "dcNumber": "DC 662",
    "invoiceNumber": "DC 662",
    "prNumber": "PR-JAD-0662",
    "prId": "pr-jad-0662",
    "date": "2026-09-13",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000662000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0662-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7762",
    "isBuiltyAttached": true,
    "biltyNumber": "7762",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0663",
    "dcNumber": "DC 663",
    "invoiceNumber": "DC 663",
    "prNumber": "PR-JAD-0663",
    "prId": "pr-jad-0663",
    "date": "2026-09-14",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000663000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0663-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0664",
    "dcNumber": "DC 664",
    "invoiceNumber": "DC 664",
    "prNumber": "PR-JAD-0664",
    "prId": "pr-jad-0664",
    "date": "2026-09-14",
    "siteName": "Jadeed Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000664000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0664-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7764",
    "isBuiltyAttached": true,
    "biltyNumber": "7764",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0665",
    "dcNumber": "DC 665",
    "invoiceNumber": "DC 665",
    "prNumber": "PR-JAD-0665",
    "prId": "pr-jad-0665",
    "date": "2026-09-15",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000665000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0665-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7765",
    "isBuiltyAttached": true,
    "biltyNumber": "7765",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0666",
    "dcNumber": "DC 666",
    "invoiceNumber": "DC 666",
    "prNumber": "PR-666",
    "prId": "pr-jad-0666",
    "date": "2026-09-17",
    "siteName": "Feed Mill Khanewal via Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000666000,
    "itemsShipped": [
      {
        "itemId": "item-666-1",
        "itemName": "4mm 4-core Std. PVC/PVC Pakistan Cable",
        "brand": "Pakistan Cables",
        "quantity": 77,
        "unit": "Meters"
      },
      {
        "itemId": "item-666-2",
        "itemName": "6mm 4-core Std. PVC/PVC Pakistan Cable",
        "brand": "Pakistan Cables",
        "quantity": 77,
        "unit": "Meters"
      },
      {
        "itemId": "item-666-3",
        "itemName": "16mm 4-core Std. PVC/PVC Pakistan Cable",
        "brand": "Pakistan Cables",
        "quantity": 77,
        "unit": "Meters"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0667",
    "dcNumber": "DC 667",
    "invoiceNumber": "DC 667",
    "prNumber": "PR-58",
    "prId": "pr-jad-0667",
    "date": "2026-09-17",
    "siteName": "Mankera via Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000667000,
    "itemsShipped": [
      {
        "itemId": "item-58-1",
        "itemName": "MCCB 630Amp 36kA Adjustable High Breaking Terasaki Japan model E-630NE",
        "brand": "Terasaki",
        "quantity": 1,
        "unit": "Numbers"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7767",
    "isBuiltyAttached": true,
    "biltyNumber": "7767",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0668",
    "dcNumber": "DC 668",
    "invoiceNumber": "DC 668",
    "prNumber": "PR-151",
    "prId": "pr-jad-0668",
    "date": "2026-09-17",
    "siteName": "Agri Farm Mankera I via Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000668000,
    "itemsShipped": [
      {
        "itemId": "item-151-1",
        "itemName": "Vintage Wall Light Imported",
        "brand": "Philips / Pak Lighting",
        "quantity": 24,
        "unit": "Numbers"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7768",
    "isBuiltyAttached": true,
    "biltyNumber": "7768",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0669",
    "dcNumber": "DC 669",
    "invoiceNumber": "DC 669",
    "prNumber": "PR-JAD-0669",
    "prId": "pr-jad-0669",
    "date": "2026-09-16",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000669000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0669-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0670",
    "dcNumber": "DC 670",
    "invoiceNumber": "DC 670",
    "prNumber": "PR-JAD-0670",
    "prId": "pr-jad-0670",
    "date": "2026-09-17",
    "siteName": "Balkasar Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000670000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0670-1",
        "itemName": "Electrical Supplies & Consumables (Balkasar Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7770",
    "isBuiltyAttached": true,
    "biltyNumber": "7770",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0671",
    "dcNumber": "DC 671",
    "invoiceNumber": "DC 671",
    "prNumber": "PR-JAD-0671",
    "prId": "pr-jad-0671",
    "date": "2026-09-17",
    "siteName": "Hatchery Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000671000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0671-1",
        "itemName": "Electrical Supplies & Consumables (Hatchery Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7771",
    "isBuiltyAttached": true,
    "biltyNumber": "7771",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0672",
    "dcNumber": "DC 672",
    "invoiceNumber": "DC 672",
    "prNumber": "PR-JAD-0672",
    "prId": "pr-jad-0672",
    "date": "2026-09-18",
    "siteName": "Head Office Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000672000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0672-1",
        "itemName": "Electrical Supplies & Consumables (Head Office Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0673",
    "dcNumber": "DC 673",
    "invoiceNumber": "DC 673",
    "prNumber": "PR-673",
    "prId": "pr-jad-0673",
    "date": "2026-09-18",
    "siteName": "Oil Extraction Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000673000,
    "itemsShipped": [
      {
        "itemId": "item-673-1",
        "itemName": "Cable Flexible 6mm 4-core PVC/PVC Sheathed Pakistan Cables",
        "brand": "Pakistan Cables",
        "quantity": 300,
        "unit": "Meters"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7773",
    "isBuiltyAttached": true,
    "biltyNumber": "7773",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0674",
    "dcNumber": "DC 674",
    "invoiceNumber": "DC 674",
    "prNumber": "PR-674",
    "prId": "pr-jad-0674",
    "date": "2026-09-18",
    "siteName": "Oil Extraction Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000674000,
    "itemsShipped": [
      {
        "itemId": "item-674-1",
        "itemName": "Cable Flexible 16mm 4-core PVC/PVC Sheathed Pakistan Cables",
        "brand": "Pakistan Cables",
        "quantity": 200,
        "unit": "Meters"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7774",
    "isBuiltyAttached": true,
    "biltyNumber": "7774",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0675",
    "dcNumber": "DC 675",
    "invoiceNumber": "DC 675",
    "prNumber": "PR-JAD-0675",
    "prId": "pr-jad-0675",
    "date": "2026-09-19",
    "siteName": "Warehouse Rawalpindi",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000675000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0675-1",
        "itemName": "Electrical Supplies & Consumables (Warehouse Rawalpindi)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0676",
    "dcNumber": "DC 676",
    "invoiceNumber": "DC 676",
    "prNumber": "PR-JAD-0676",
    "prId": "pr-jad-0676",
    "date": "2026-09-20",
    "siteName": "Agri Farm Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000676000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0676-1",
        "itemName": "Electrical Supplies & Consumables (Agri Farm Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7776",
    "isBuiltyAttached": true,
    "biltyNumber": "7776",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0677",
    "dcNumber": "DC 677",
    "invoiceNumber": "DC 677",
    "prNumber": "PR-JAD-0677",
    "prId": "pr-jad-0677",
    "date": "2026-09-20",
    "siteName": "Oil Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000677000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0677-1",
        "itemName": "Electrical Supplies & Consumables (Oil Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7777",
    "isBuiltyAttached": true,
    "biltyNumber": "7777",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0678",
    "dcNumber": "DC 678",
    "invoiceNumber": "DC 678",
    "prNumber": "PR-JAD-0678",
    "prId": "pr-jad-0678",
    "date": "2026-09-20",
    "siteName": "P.D Khan Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000678000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0678-1",
        "itemName": "Electrical Supplies & Consumables (P.D Khan Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0679",
    "dcNumber": "DC 679",
    "invoiceNumber": "DC 679",
    "prNumber": "PR-JAD-0679",
    "prId": "pr-jad-0679",
    "date": "2026-09-21",
    "siteName": "Feed Mill Bhawalpur",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000679000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0679-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Bhawalpur)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7779",
    "isBuiltyAttached": true,
    "biltyNumber": "7779",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0680",
    "dcNumber": "DC 680",
    "invoiceNumber": "DC 680",
    "prNumber": "PR-JAD-0680",
    "prId": "pr-jad-0680",
    "date": "2026-09-21",
    "siteName": "Ware House Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000680000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0680-1",
        "itemName": "Electrical Supplies & Consumables (Ware House Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7780",
    "isBuiltyAttached": true,
    "biltyNumber": "7780",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0681",
    "dcNumber": "DC 681",
    "invoiceNumber": "DC 681",
    "prNumber": "PR-JAD-0681",
    "prId": "pr-jad-0681",
    "date": "2026-09-22",
    "siteName": "Jadeed Farm Pirowal 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000681000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0681-1",
        "itemName": "Electrical Supplies & Consumables (Jadeed Farm Pirowal 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0682",
    "dcNumber": "DC 682",
    "invoiceNumber": "DC 682",
    "prNumber": "PR-JAD-0682",
    "prId": "pr-jad-0682",
    "date": "2026-09-22",
    "siteName": "Bahter Farm 1",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000682000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0682-1",
        "itemName": "Electrical Supplies & Consumables (Bahter Farm 1)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7782",
    "isBuiltyAttached": true,
    "biltyNumber": "7782",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  },
  {
    "id": "dc-jad-0683",
    "dcNumber": "DC 683",
    "invoiceNumber": "DC 683",
    "prNumber": "PR-JAD-0683",
    "prId": "pr-jad-0683",
    "date": "2026-09-23",
    "siteName": "Feed Mill Khanewal",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000683000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0683-1",
        "itemName": "Electrical Supplies & Consumables (Feed Mill Khanewal)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7783",
    "isBuiltyAttached": true,
    "biltyNumber": "7783",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0684",
    "dcNumber": "DC 684",
    "invoiceNumber": "DC 684",
    "prNumber": "PR-JAD-0684",
    "prId": "pr-jad-0684",
    "date": "2026-09-23",
    "siteName": "Chicks Hatchery Sheikhupura",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000684000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0684-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Sheikhupura)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Delivered",
    "remarks": "Delivered to Farm / Site",
    "isBuiltyAttached": false
  },
  {
    "id": "dc-jad-0685",
    "dcNumber": "DC 685",
    "invoiceNumber": "DC 685",
    "prNumber": "PR-JAD-0685",
    "prId": "pr-jad-0685",
    "date": "2026-09-23",
    "siteName": "Chicks Hatchery Rawat",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000685000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0685-1",
        "itemName": "Electrical Supplies & Consumables (Chicks Hatchery Rawat)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7785",
    "isBuiltyAttached": true,
    "biltyNumber": "7785",
    "addaName": "Goods Transport (General)",
    "freightStatus": "To Pay"
  },
  {
    "id": "dc-jad-0686",
    "dcNumber": "DC 686",
    "invoiceNumber": "DC 686",
    "prNumber": "PR-JAD-0686",
    "prId": "pr-jad-0686",
    "date": "2026-09-24",
    "siteName": "Mankera 2 Farm",
    "deliveryStatus": "Delivered",
    "createdTimestamp": 1711000686000,
    "itemsShipped": [
      {
        "itemId": "item-jad-0686-1",
        "itemName": "Electrical Supplies & Consumables (Mankera 2 Farm)",
        "brand": "General Electrical",
        "quantity": 1,
        "unit": "lot"
      }
    ],
    "transportType": "Adda / Goods Transport",
    "remarks": "Goods Transport via Adda | Bilty #7786",
    "isBuiltyAttached": true,
    "biltyNumber": "7786",
    "addaName": "Goods Transport (General)",
    "freightStatus": "Paid"
  }
];

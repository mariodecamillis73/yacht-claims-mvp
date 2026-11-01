const mockUsers = [
  {
    id: 'user-admin',
    email: 'admin@marine.com',
    passwordHash: '$2a$10$J6tFh7H0J.C0x/Jv1/0P6uD0RrHkkybJ9IhBc2aZrHFf6x9pB7D3i',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    language: 'en'
  },
  {
    id: 'user-customer',
    email: 'owner@bluehorizon.com',
    passwordHash: '$2a$10$J6tFh7H0J.C0x/Jv1/0P6uD0RrHkkybJ9IhBc2aZrHFf6x9pB7D3i',
    firstName: 'Customer',
    lastName: 'Owner',
    role: 'customer',
    language: 'en'
  },
  {
    id: 'user-supplier',
    email: 'supplier@marineparts.com',
    passwordHash: '$2a$10$J6tFh7H0J.C0x/Jv1/0P6uD0RrHkkybJ9IhBc2aZrHFf6x9pB7D3i',
    firstName: 'Supplier',
    lastName: 'Portal',
    role: 'supplier',
    language: 'en'
  }
];

const mockYachts = [
  {
    id: 'yacht-1',
    yachtNumber: 'Y-1001',
    name: 'Blue Horizon',
    registrationNumber: 'IT-XYZ-01',
    model: 'A40',
    builder: 'Oceanic Yachts',
    yearBuilt: 2022,
    ownerId: 'user-customer',
    captainName: 'Alex Brown',
    status: 'active'
  },
  {
    id: 'yacht-2',
    yachtNumber: 'Y-2002',
    name: 'Silver Tide',
    registrationNumber: 'ES-ABC-88',
    model: 'S60',
    builder: 'Harbor Builders',
    yearBuilt: 2021,
    ownerId: 'user-customer',
    captainName: 'Maria Lopez',
    status: 'maintenance'
  }
];

const mockSuppliers = [
  {
    id: 'supplier-1',
    name: 'MarineParts',
    companyName: 'MarineParts International',
    email: 'support@marineparts.com',
    phone: '+1-555-0212'
  }
];

const mockClaims = [
  {
    id: 'claim-1',
    yachtId: 'yacht-1',
    title: 'Engine room sensor fault',
    description: 'Engine room temperature sensor shows intermittent failure and triggers warning during overnight running.',
    status: 'open',
    priority: 'high',
    assignedTo: 'user-admin',
    createdBy: 'user-admin',
    warrantyStatus: 'valid',
    supplierId: 'supplier-1',
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-01T11:00:00.000Z'
  },
  {
    id: 'claim-2',
    yachtId: 'yacht-1',
    title: 'Watermaker reduced output',
    description: 'Watermaker is producing below expected output and salt content appears slightly elevated.',
    status: 'supplier_pending',
    priority: 'medium',
    assignedTo: 'user-admin',
    createdBy: 'user-admin',
    warrantyStatus: 'valid',
    supplierId: 'supplier-1',
    createdAt: '2026-11-02T08:30:00.000Z',
    updatedAt: '2026-11-03T09:00:00.000Z'
  },
  {
    id: 'claim-3',
    yachtId: 'yacht-2',
    title: 'Bow thruster performance issue',
    description: 'Bow thruster has reduced response at low speed and needs inspection of wiring and motor output.',
    status: 'closed',
    priority: 'low',
    assignedTo: 'user-admin',
    createdBy: 'user-admin',
    warrantyStatus: 'pending',
    supplierId: 'supplier-1',
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-12T12:00:00.000Z'
  }
];

const mockComments = [
  {
    id: 'comment-1',
    claimId: 'claim-1',
    userId: 'user-admin',
    message: 'Requested a full inspection of the engine room sensor and calibration logs.',
    createdAt: '2026-11-01T10:00:00.000Z'
  },
  {
    id: 'comment-2',
    claimId: 'claim-2',
    userId: 'user-admin',
    message: 'Supplier asked to confirm capacity and current flow rate before replacement.',
    createdAt: '2026-11-03T09:00:00.000Z'
  }
];

const mockDocuments = [
  {
    id: 'doc-1',
    claimId: 'claim-1',
    yachtId: 'yacht-1',
    fileName: 'engine-room-sensor-warning.pdf',
    storagePath: '/docs/engine-room-sensor-warning.pdf',
    mimeType: 'application/pdf',
    uploadedBy: 'user-admin',
    createdAt: '2026-11-01T12:00:00.000Z'
  },
  {
    id: 'doc-2',
    claimId: 'claim-2',
    yachtId: 'yacht-1',
    fileName: 'watermaker-flow-check.jpg',
    storagePath: '/docs/watermaker-flow-check.jpg',
    mimeType: 'image/jpeg',
    uploadedBy: 'user-admin',
    createdAt: '2026-11-03T09:10:00.000Z'
  }
];

const technicalSections = [
  {
    id: 'section-engines',
    yachtId: 'yacht-1',
    sectionName: 'engines',
    displayName: 'Engines',
    sortOrder: 1,
    fields: [
      { id: 'field-engine-type', fieldName: 'engine_type', displayName: 'Engine type', fieldType: 'text', value: 'MTU 12V2000', unit: '', isCustom: false },
      { id: 'field-engine-model', fieldName: 'engine_model', displayName: 'Engine model', fieldType: 'text', value: '12V2000', unit: '', isCustom: false },
      { id: 'field-engine-serial', fieldName: 'engine_serial_number', displayName: 'Serial number', fieldType: 'text', value: 'MTU-2024-7761', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-generators',
    yachtId: 'yacht-1',
    sectionName: 'generators',
    displayName: 'Generators',
    sortOrder: 2,
    fields: [
      { id: 'field-generator-type', fieldName: 'generator_type', displayName: 'Generator type', fieldType: 'text', value: 'Kohler', unit: '', isCustom: false },
      { id: 'field-generator-serial', fieldName: 'generator_serial_number', displayName: 'Serial number', fieldType: 'text', value: 'KOH-44521', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-propellers',
    yachtId: 'yacht-1',
    sectionName: 'propellers',
    displayName: 'Propellers',
    sortOrder: 3,
    fields: [
      { id: 'field-propeller-type', fieldName: 'propeller_type', displayName: 'Propeller type', fieldType: 'text', value: '5-blade bronze', unit: '', isCustom: false },
      { id: 'field-propeller-diameter', fieldName: 'propeller_diameter', displayName: 'Diameter', fieldType: 'number', value: '1.8', unit: 'm', isCustom: false }
    ]
  },
  {
    id: 'section-paint',
    yachtId: 'yacht-1',
    sectionName: 'paint',
    displayName: 'Hull and deck paint',
    sortOrder: 4,
    fields: [
      { id: 'field-hull-paint', fieldName: 'hull_paint_reference', displayName: 'Hull paint ref', fieldType: 'text', value: 'HULL-ALU-22', unit: '', isCustom: false },
      { id: 'field-deck-paint', fieldName: 'deck_paint_reference', displayName: 'Deck paint ref', fieldType: 'text', value: 'DECK-SAND-14', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-bow-thruster',
    yachtId: 'yacht-1',
    sectionName: 'bow_thruster',
    displayName: 'Bow thruster',
    sortOrder: 5,
    fields: [
      { id: 'field-bow-type', fieldName: 'bow_thruster_type', displayName: 'Type', fieldType: 'text', value: 'Hydraulic bow thruster', unit: '', isCustom: false },
      { id: 'field-bow-serial', fieldName: 'bow_thruster_serial', displayName: 'Serial number', fieldType: 'text', value: 'BOW-1048', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-stern-thruster',
    yachtId: 'yacht-1',
    sectionName: 'stern_thruster',
    displayName: 'Stern thruster',
    sortOrder: 6,
    fields: [
      { id: 'field-stern-type', fieldName: 'stern_thruster_type', displayName: 'Type', fieldType: 'text', value: 'Electric stern thruster', unit: '', isCustom: false },
      { id: 'field-stern-serial', fieldName: 'stern_thruster_serial', displayName: 'Serial number', fieldType: 'text', value: 'STERN-4088', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-ac',
    yachtId: 'yacht-1',
    sectionName: 'air_conditioning',
    displayName: 'Air conditioning',
    sortOrder: 7,
    fields: [
      { id: 'field-ac-type', fieldName: 'ac_type', displayName: 'AC type', fieldType: 'text', value: 'Daikin VRV', unit: '', isCustom: false },
      { id: 'field-ac-btu', fieldName: 'ac_btu', displayName: 'Capacity (BTU)', fieldType: 'number', value: '52000', unit: 'BTU', isCustom: false },
      { id: 'field-ac-serial', fieldName: 'ac_serial_number', displayName: 'Serial number', fieldType: 'text', value: 'AC-52000-11', unit: '', isCustom: false }
    ]
  },
  {
    id: 'section-watermaker',
    yachtId: 'yacht-1',
    sectionName: 'watermaker',
    displayName: 'Watermaker',
    sortOrder: 8,
    fields: [
      { id: 'field-watermaker-type', fieldName: 'watermaker_type', displayName: 'Type', fieldType: 'text', value: 'RO-200', unit: '', isCustom: false },
      { id: 'field-watermaker-serial', fieldName: 'watermaker_serial_number', displayName: 'Serial number', fieldType: 'text', value: 'WM-RO-22-09', unit: '', isCustom: false }
    ]
  }
];

const mockSettings = {
  languages: ['en', 'it', 'es', 'de']
};

export const demoData = {
  users: mockUsers,
  yachts: mockYachts,
  claims: mockClaims,
  comments: mockComments,
  documents: mockDocuments,
  suppliers: mockSuppliers,
  technicalSections,
  settings: mockSettings
};

export const workhubData = {
  yachts: mockYachts.map((yacht) => ({
    ...yacht,
    claims: mockClaims.filter((claim) => claim.yachtId === yacht.id)
  }))
};

export const customerData = {
  yacht: mockYachts[0],
  claims: mockClaims.filter((claim) => claim.yachtId === 'yacht-1')
};

export const supplierTokens = {
  demo: 'claim-2'
};

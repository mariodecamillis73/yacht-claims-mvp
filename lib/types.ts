export type Language = 'en' | 'it' | 'es' | 'de';

export type UserRole = 'admin' | 'manager' | 'claims_analyst' | 'technician' | 'customer' | 'supplier';

export type Claim = {
  id: string;
  yachtId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdBy: string;
  warrantyStatus: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Yacht = {
  id: string;
  yachtNumber: string;
  name: string;
  registrationNumber: string;
  model: string;
  builder: string;
  yearBuilt: number;
  ownerId: string;
  captainName: string;
  status: string;
};

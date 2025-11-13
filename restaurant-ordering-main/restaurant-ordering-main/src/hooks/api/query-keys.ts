export const queryKeys = {
  menu: {
    all: ['menu'] as const,
    byLocation: (locationRef: string) => ['menu', 'location', locationRef] as const,
    byCompany: (companyRef: string) => ['menu', 'company', companyRef] as const,
    details: (id: string) => ['menu', 'details', id] as const,
  },
  products: {
    all: ['products'] as const,
    byId: (id: string) => ['products', id] as const,
    byCategory: (categoryRef: string) => ['products', 'category', categoryRef] as const,
  },
  categories: {
    all: ['categories'] as const,
    byId: (id: string) => ['categories', id] as const,
  },
} as const;

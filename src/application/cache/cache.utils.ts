export const getSingleMappedKeys = (moduleName: ModuleNames, id?: number) => ({
  all: `${moduleName}s`,
  individual: id ? `${moduleName}:${id}` : null,
});

export enum ModuleNames {
  Tenant = 'tenant',
  Landlord = 'landlord',
  Document = 'document',
  DocumentType = 'documentType',
  DocumentRequirement = 'documentRequirement',
  Client = 'client',
}

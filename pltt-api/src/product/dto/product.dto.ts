export class Source {
  shid: number;
  phid: number;
  usedNumber: number;
}

export class ProductDto {
  phid: number;
  organizationID: number;
  organizationName: string;
  ownerID: number;
  ownerName: string;
  title: string;
  sourceList: Source[];
  producedNumber: number;
  packNumber: number;
  transactionDate: string;
  expirationDate: string;
  unit: string;
}

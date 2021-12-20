export class Source {
  shid: number;
  phid: number;
  usedNumber: number;
}

export class ItemDto {
  shid: number;
  organizationID: number;
  organizationName: string;
  title: string;
  sourceList: Source[];
  producedNumber: number;
  producedDate: string;
  expirationDate: string;
  restNumber: number;
  packNumber: number;
  unit: string;
}

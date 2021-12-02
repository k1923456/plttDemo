class Source {
  id: number;
  usedNumber: number;
}

export class CreateItemDto {
  shid: number;
  name: string;
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

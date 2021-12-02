class Source {
    id: number;
    usedNumber: number;
  }
  
  export class CreateProductDto {
    phid: number;
    name: string;
    organizationID: number;
    organizationName: string;
    // "ownerID": "23456",
    // "ownerName": "一般消費者",
    title: string;
    sourceList: Source[];
    producedNumber: number;
    // "transactionDate": "2020-12-21 16:43:17"
    producedDate: string;
    expirationDate: string;
    restNumber: number;
    packNumber: number;
    unit: string;
  }
  
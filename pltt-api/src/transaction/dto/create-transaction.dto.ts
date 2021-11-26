export class CreateTransactionDto {
    shid: number;
    phid: number;
    organizationID: number;
    organizationName: string;
    ownerID: number;
    ownerName: string;
    soldNumber: string;
    soldPack: number;
    transactionDate: string;
}

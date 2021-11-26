import { Source } from './source.type';
export class CreateItemDto {
    shid: number;
    organizationID: number;
    organizationName: string;
    title: string;
    sourceList: Source[]; 
    producedNumber: string;
    restNumber: string;
    packNumber: number;
    producedDate: string;
    expirationDate: string
}

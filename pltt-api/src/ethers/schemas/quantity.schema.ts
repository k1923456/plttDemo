import { BigNumber } from '@ethersproject/bignumber';
const divisor = parseInt(process.env.DIVISOR, 10);

export class Quantity {
  producedNumber: BigNumber;
  restNumber: BigNumber;
  packNumber: BigNumber;
  unit: string;

  constructor(object) {
    console.log(object)
    this.producedNumber = BigNumber.from(Math.floor(object.producedNumber * divisor));
    this.restNumber =
      object.restNumber !== undefined
        ? BigNumber.from(Math.floor(object.restNumber * divisor))
        : BigNumber.from(Math.floor(object.producedNumber * divisor));
    this.packNumber =
      object.packNumber !== undefined
        ? BigNumber.from(Math.floor(object.packNumber * divisor))
        : BigNumber.from(0);
    this.unit = object.unit;
  }

  getObject() {
    return {
      producedNumber: this.producedNumber,
      restNumber: this.restNumber,
      packNumber: this.packNumber,
      unit: this.unit,
    };
  }
}

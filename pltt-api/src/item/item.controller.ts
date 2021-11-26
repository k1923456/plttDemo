import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { EthersService } from '../ethers/ethers.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService, private ethersService: EthersService) {}

  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    // return this.itemService.create(createItemDto);
    console.log(this.ethersService.generateAddress(createItemDto.shid.toString()));
    await this.ethersService.createItem(createItemDto);
  }

  @Get()
  async findAll() {
    // console.log(`asdfasdfsadf ${await this.ethersService.getFirstAccountBalance()}`)
    // console.log(`${await this.appService.getHello()}`)
    return this.itemService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(this.itemService.findOne(+id));
        resolve("SUCCESS");
      }, 3000);
    });

    // return this.itemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}

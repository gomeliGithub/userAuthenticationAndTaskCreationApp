import { Module } from '@nestjs/common';

import { AppService } from '../app.service';
import { CommonService } from '../services/common.service';

@Module({
    imports: [],
    providers: [ AppService, CommonService ],
    exports: [CommonService]
})
export class CommonModule {}
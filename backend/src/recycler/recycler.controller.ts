import { Request,UseGuards,Controller, Post, Body, Param, Get, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException, ParseIntPipe, UseInterceptors, UploadedFile, Req, UploadedFiles, Res } from '@nestjs/common';
import { RecyclerService } from './recycler.service';
import { MaterialLog } from './entities/recycler/material.entity';
import { CreateCashoutDto } from './dto/create-cashout.dto';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { RoleGuard } from './../auth/roles.guard';
import { IdParamDto } from './dto/id-param.dto';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs-extra';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express'; 
// Ensure correct import

@Controller('recycler')
@UseGuards(JwtAuthGuard, RoleGuard)  
export class RecyclerController {


  constructor(private readonly recyclerService: RecyclerService) {}
  
  @Get('profile/:id')
  async getProfile(@Param('id') id: string, @Request() req) {
    const userId = parseInt(id, 10);
    const authenticatedUserId = req.user.id; // Get the user ID from the JWT payload
  
    // Check if the requested profile matches the authenticated user's profile
    if (userId !== authenticatedUserId) {
      throw new ForbiddenException('You are not allowed to view this profile');
    }
  
    return this.recyclerService.getProfile(userId);
  }
  
  @Post('update-password/:id')
  async updatePassword(
    @Param('id') id: number,
    @Body() body: { oldPassword: string; newPassword: string; confirmPassword: string },
  ) {
    const { oldPassword, newPassword, confirmPassword } = body;
    return this.recyclerService.updatePassword(id, newPassword, confirmPassword, oldPassword);
  }
  

  @Post('/add-earnings/:id')
  async addEarnings(@Param('id') recyclerId: number, @Body() data) {
    return this.recyclerService.addEarnings(recyclerId, data.earnings);
  }


  @Get('/earnings-today-yesterday/:id')
  async getTodaysAndYesterdaysEarnings(@Param('id') recyclerId: number) {
    return this.recyclerService.getTodaysAndYesterdaysEarnings(recyclerId);
  }

  @Post('setup/:id')
  async setupPayoutDetails(
    @Param('id') recyclerId: number,
    @Body() { method, details }: { method: 'mobile' | 'bank'; details: string },
  ) {
    return this.recyclerService.setupPayoutDetails(recyclerId, method, details);
  }


  @Get('/financials/:id')
  async getFinancials(@Param('id') id: number) {
      return this.recyclerService.getFinancials(id);
  }
  

  @Post('/progress/:recyclerId')
  async getProgress(
    @Param('recyclerId') recyclerId: number,
    @Body() body: { from: string; to: string },
  ) {
    const { from, to } = body;
  
    if (!from || !to) {
      return { message: 'Both "from" and "to" body parameters are required', data: null };
    }
  
    try {
      const progressData = await this.recyclerService.getProgress(recyclerId, from, to);
      return {
        message: 'Progress data retrieved successfully',
        data: progressData,
      };
    } catch (error) {
      return {
        message: 'An error occurred while fetching progress data',
        error: error.message,
      };
    }
  }
  
  
  

  
  @Post('log-material/:id')
  logMaterial(@Param('id') id: number, @Body() materialLogData: Partial<MaterialLog>) {
    console.log('ID:', id);
    console.log('Material Log Data:', materialLogData);
    return this.recyclerService.logMaterial(id, materialLogData);
  }
  @Get('log-material/history/:id')
  async findOne(@Param('id') id: string) {
      return await this.recyclerService.findMaterialLog(+id);
  }
  
  







  
  @Get('/events/:recyclerId')
  async getAllEvents(@Param('recyclerId', ParseIntPipe) recyclerId: number) {
    const events = await this.recyclerService.getAllEvents(recyclerId);
    return {
      message: 'All available events fetched successfully',
      data: events,
    };
  }
  
  @Get('/joined-events/:recyclerId')
  async getJoinedEvents(@Param('recyclerId', ParseIntPipe) recyclerId: number) {
    const events = await this.recyclerService.getJoinEvents(recyclerId);
    return {
      message: 'Joined events fetched successfully',
      data: events,
    };
  }

   // Join event
   @Post('join/:recyclerId/:eventId')
   async joinEvent(@Param('recyclerId') recyclerId: number, @Param('eventId') eventId: number) {
     await this.recyclerService.joinEvent(recyclerId, eventId);
     return { message: 'Event joined successfully' };
   }
   
 
   // Cancel event
   @Post('cancel/:recyclerId/:eventId')
   async cancelEvent(@Param('recyclerId') recyclerId: number, @Param('eventId') eventId: number) {
     await this.recyclerService.cancelEvent(recyclerId, eventId);
     return { message: 'Event canceled successfully' };
   }
 
   // Reject event
   @Post('reject/:recyclerId/:eventId')
   async rejectEvent(@Param('recyclerId') recyclerId: number, @Param('eventId') eventId: number) {
     await this.recyclerService.rejectEvent(recyclerId, eventId);
     return { message: 'Event rejected successfully' };
   }





  
  // 2FA generation route
  @Post('generate-2fa/:id')
  async generate2fa(@Param('id') id: number) {
    try {
      const result = await this.recyclerService.generate2fa(id);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Route to initiate a cashout (requires 2FA verification and cashout amount)
  @Post('cashout/:id')
  async cashout(
    @Param('id') id: number,
    @Body() createCashoutDto: CreateCashoutDto, // DTO containing token and cashoutAmount
  ) {
    try {
      const { token, cashoutAmount } = createCashoutDto;
      const result = await this.recyclerService.cashout(id, token, cashoutAmount);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }





  @Get(':id/dashboard')
  async getDashboardData(@Param('id') id: number) {
    const data = await this.recyclerService.getEarningsAndEvents(id);
    return {
      message: 'Dashboard data fetched successfully',
      data,
    };
  }

  @Get('verify-id/:id')
  async verifyId(@Param('id', ParseIntPipe) id: number) {
    return this.recyclerService.verifyId(id);
  }
  
  @Post('activate/:id')
  async activateRecycler(@Param('id') id: number, @Body('token') token: string) {
    return this.recyclerService.activateRecycler(id, token);
  }


  @Post('upload/:id')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const userId = req.params.id;
          const uploadPath = join(__dirname, '..', '..', 'uploads', 'profile-pics', userId);

          // ✅ Ensure user folder exists
          fs.ensureDirSync(uploadPath);

          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const userId = req.params.id;
          const uploadPath = join(__dirname, '..', '..', 'uploads', 'profile-pics', userId);

          // ✅ Remove existing file before saving the new one
          fs.readdir(uploadPath, (err, files) => {
            if (!err && files.length > 0) {
              files.forEach(file => {
                fs.removeSync(join(uploadPath, file));
              });
            }
            // ✅ Save new file
            callback(null, file.originalname);
          });
        },
      }),
    }),
  )
  async uploadProfileFolder(
    @Param('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded'); // ✅ Error if no files received
    }

    console.log(`✅ Uploaded ${files.length} files for user ${userId}`);

    // ✅ Return the first file as the profile picture preview
    return {
      id: userId,
      profilePicture: `/uploads/profile-pics/${userId}/${files[0].filename}`, // ✅ First image in folder
      folderPath: `/uploads/profile-pics/${userId}/`, // ✅ Folder path
    };
  }



  @Get('profile-picture/:id')
  async getProfilePicture(@Param('id') userId: string, @Res() res: Response) {
    const userFolder = join(__dirname, '..', '..', 'uploads', 'profile-pics', userId);

    try {

      const files = await fs.readdir(userFolder);


      if (files.length === 0) {
        return res.sendFile(join(__dirname, '..', '..', 'uploads', 'default-profile.png'));
      }

      // ✅ Return the first uploaded image as the profile picture
      const profilePicture = files[0]; // Pick the first image
      return res.sendFile(join(userFolder, profilePicture));
    } catch (error) {
      console.error(`❌ Error retrieving profile picture:`, error);
      return res.status(404).json({ message: 'Profile picture not found' });
    }
  }
}

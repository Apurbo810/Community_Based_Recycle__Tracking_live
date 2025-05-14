import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { Recycler } from './entities/recycler/recycler.entity'; 
import { AcceptStatus, MaterialLog, MaterialType } from './entities/recycler/material.entity';
import { Event } from './entities/recycler/event.entity';
import * as speakeasy from 'speakeasy';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { RecyclerEvent } from './entities/recycler/recycler-event.entity';
import { MaterialLogHistory } from './entities/recycler/material_log_histories.entity';

@Injectable()
export class RecyclerService {
  applyPayment(paymentDetails: any) {
    throw new Error('Method not implemented.');
  }

  findOne(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Recycler)
    private recyclerRepository: Repository<Recycler>, 
      
    @InjectRepository(MaterialLog)
    private readonly materialLogRepository: Repository<MaterialLog>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(RecyclerEvent)
    private recyclerEventRepository: Repository<RecyclerEvent>,

    @InjectRepository(MaterialLogHistory)
    private readonly materialLogHistoryRepository: Repository<MaterialLogHistory>,

    
  ) {}
  getProfile(userId: number) {
    const user = this.recyclerRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  
    private getCurrentMonthYear(): string {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}`; // Format as 'YYYY-MM'
    }
    async setupPayoutDetails(
      recyclerId: number,
      method: 'mobile' | 'bank',
      details: string,
    ): Promise<Recycler> {
      const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
      if (!recycler) {
        throw new Error('Recycler not found');
      }
  
      recycler.payoutDetails = { method, details };
      return this.recyclerRepository.save(recycler);
    }

  

    
    async addEarnings(recyclerId: number, amount: number) {
      // Validate the amount
      if (!amount || amount <= 0) {
        throw new BadRequestException('Amount must be a positive number.');
      }
    
      // Fetch recycler
      const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
    
      if (!recycler) {
        return null; // Recycler not found
      }
    
      console.log('Original Recycler:', recycler);
    
      // Add to unpaid earnings
      recycler.unpaidEarnings = (recycler.unpaidEarnings || 0) + amount;
    
      // Update daily earnings
      const today = new Date().toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      recycler.dailyEarnings = recycler.dailyEarnings || {};
      recycler.dailyEarnings[today] = (recycler.dailyEarnings[today] || 0) + amount;
    
      console.log('Updated Recycler:', recycler);
    
      // Save updated recycler to the database
      await this.recyclerRepository.save(recycler);
    
      // Confirm changes
      const updatedRecycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
      console.log('Saved Recycler:', updatedRecycler);
    
      return updatedRecycler;
    }
  
    private getYesterday(): string {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    }
  
    async getTodaysAndYesterdaysEarnings(recyclerId: number) {
      const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
      if (!recycler) {
        return { message: 'Recycler not found', data: null };
      }
  
      const today = new Date().toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      const yesterday = this.getYesterday(); // Ensure it's in the same format  
      const todaysEarnings = recycler.dailyEarnings?.[today] || 0;
      const yesterdaysEarnings = recycler.dailyEarnings?.[yesterday] || 0;
      return {
        message: 'Today and Yesterday\'s earnings fetched',
        data: {
          today: todaysEarnings,
          yesterday: yesterdaysEarnings,
        },
      };
    }



    async getFinancials(id: number): Promise<Partial<Recycler>> {
      const recycler = await this.recyclerRepository.findOne({ where: { id } });
    
      if (!recycler) {
        throw new NotFoundException('Recycler not found');
      }
    
      // Initialize unpaidEarnings and unpaidBonuses if they are undefined or null
      const unpaidEarnings = recycler.unpaidEarnings || 0;
      const unpaidBonuses = recycler.unpaidBonuses || 0;
    
      // Calculate wallet as the sum of unpaidEarnings and unpaidBonuses
      const wallet = unpaidEarnings + unpaidBonuses;
    
      return {
        unpaidEarnings,
        unpaidBonuses,
        wallet,
      };
    }

    async updatePassword(id: number,newPassword: string,confirmPassword: string,oldPassword: string): Promise<{ message: string }> {
      const recycler = await this.recyclerRepository.findOne({ where: { id } });
    
      if (!recycler) {
        throw new NotFoundException('Recycler not found');
      }
    
      // Check if the old password matches the stored hashed password
      const passwordMatch = await bcrypt.compare(oldPassword, recycler.password);
      if (!passwordMatch) {
        throw new BadRequestException('Old password is incorrect');
      }
    
      // Check if new password and confirm password match
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('New password and confirm password do not match');
      }
    
      // Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(newPassword, 8); // Salt rounds set to 8
    
      // Update the password with the hashed new password
      recycler.password = hashedPassword;
      await this.recyclerRepository.save(recycler);
    
      return { message: 'Password updated successfully' };
    }
    




   async getProgress(recyclerId: number, from: string, to: string) {
      const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
      
      if (!recycler) {
        return { message: 'Recycler not found', data: null };
      }
    
      // Ensure 'dailyEarnings' exists
      if (!recycler.dailyEarnings || Object.keys(recycler.dailyEarnings).length === 0) {
        return { message: 'No earnings data available', data: [] };
      }
    
      // Parse date range
      const fromDate = new Date(from);
      const toDate = new Date(to);
    
      if (fromDate > toDate) {
        return { message: 'Invalid date range: "from" date is later than "to" date', data: [] };
      }
    
      const progressData: { date: string; earnings: number }[] = [];
    
      // Iterate through the date range
      for (let current = new Date(fromDate); current <= toDate; current.setDate(current.getDate() + 1)) {
        const currentDate = current.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        const earnings = recycler.dailyEarnings[currentDate] || 0; // Get earnings for the current day
        progressData.push({ date: currentDate, earnings });
      }
    
      return {
        message: 'Progress data retrieved successfully',
        data: progressData,
      };
    }
    
    
    
    
    async logMaterial(
      recyclerId: number,
      materialLogData: Partial<MaterialLog>
    ): Promise<MaterialLog> {
      // Validate required fields
      if (
        materialLogData.weight == null ||
        !materialLogData.materialType ||
        !materialLogData.location
      ) {
        throw new Error('Missing required fields');
      }
    
      // Fetch the recycler entity
      const recycler = await this.recyclerRepository.findOne({
        where: { id: recyclerId },
      });
      if (!recycler) {
        throw new Error('Recycler not found');
      }
    
      let price = 0;
      // Price calculation based on material type
      switch (materialLogData.materialType) {
        case MaterialType.PLASTIC:
          price = materialLogData.weight * 1.5;
          break;
        case MaterialType.PAPER:
          price = materialLogData.weight * 2;
          break;
        case MaterialType.METAL:
          price = materialLogData.weight * 3;
          break;
        case MaterialType.GLASS:
          price = materialLogData.weight * 4;
          break;
        case MaterialType.OTHER:
          price = materialLogData.weight * 1;
          break;
        default:
          throw new Error('Invalid material type');
      }
    
      // Create a new material log entry
      const materialLog = this.materialLogRepository.create({
        ...materialLogData,
        price,
        recycler: { id: recyclerId },
      });
    
      // Save the material log
      const savedMaterialLog = await this.materialLogRepository.save(materialLog);
    
      // If the material is accepted, update earnings using the addEarnings function
      if (materialLogData.acceptStatus === AcceptStatus.ACCEPTED) {
        // Call addEarnings to update unpaidEarnings and dailyEarnings
        const updatedRecycler = await this.addEarnings(recyclerId, price);
        // Update local recycler object with the new earnings value
        recycler.unpaidEarnings = updatedRecycler.unpaidEarnings;
      }
    
      // Create a history record
      const history = this.materialLogHistoryRepository.create({
        materialLog: savedMaterialLog,
        recycler: recycler,
        acceptStatus: materialLogData.acceptStatus,
        price,
        unpaidEarnings: recycler.unpaidEarnings,
      });
    
      // Save the history record
      await this.materialLogHistoryRepository.save(history);
    
      return savedMaterialLog;
    }
    async findMaterialLog(id: number) {
      return await this.materialLogRepository.find({
        where: { recycler: { id } }, // Fetch logs for a specific recycler
        relations: ['recycler'], // Ensure it loads related recycler data
      });
    }
    









  async getAllEvents(recyclerId: number): Promise<Event[]> {
    const now = new Date(); 

    const recyclerEvents = await this.recyclerEventRepository.find({
      where: { recycler: { id: recyclerId } },
      relations: ['event'], 
      select: ['event'],
    });

    const interactedEventIds = recyclerEvents
      .filter(re => re.event) 
      .map(re => re.event.id);
  

    return this.eventRepository.find({
      where: {
        ...(interactedEventIds.length > 0 ? { id: Not(In(interactedEventIds)) } : {}),
        startTime: Not(LessThan(now)), // Exclude events whose startTime has passed
      },
    });
  }
  


  async joinEvent(recyclerId: number, eventId: number): Promise<void> {
    const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
  
    if (!recycler || !event) {
      throw new NotFoundException('Recycler or event not found');
    }
  
    const existingRecord = await this.recyclerEventRepository.findOne({
      where: { recycler: { id: recyclerId }, event: { id: eventId } },
    });
  
    if (existingRecord) {
      throw new ConflictException('You have already interacted with this event');
    }
  
    // Create and save the recycler-event relationship
    const recyclerEvent = this.recyclerEventRepository.create({
      recycler,
      event,
      action: 'joined',
    });
  
    await this.recyclerEventRepository.save(recyclerEvent);
  
    // Increment the acceptEvents counter
    recycler.acceptEvents += 1;
    await this.recyclerRepository.save(recycler);
  }

  // Cancel event
async cancelEvent(recyclerId: number, eventId: number): Promise<void> {
  // Fetch recycler and event
  const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
  const event = await this.eventRepository.findOne({ where: { id: eventId } });

  // Handle missing recycler or event
  if (!recycler || !event) {
    throw new NotFoundException('Recycler or event not found');
  }

  // Check if recycler has already joined the event (action = 'joined')
  const existingRecord = await this.recyclerEventRepository.findOne({
    where: {
      recycler: { id: recyclerId },
      event: { id: eventId },
      action: 'joined', // Only look for a 'joined' action
    },
  });

  // If the recycler hasn't joined the event, throw an error
  if (!existingRecord) {
    throw new NotFoundException('You have not joined this event');
  }

  // Change the action to 'canceled'
  existingRecord.action = 'canceled';

  // Save the updated record
  await this.recyclerEventRepository.save(existingRecord);
}

  // Reject event
  async rejectEvent(recyclerId: number, eventId: number): Promise<void> {
    const recycler = await this.recyclerRepository.findOne({ where: { id: recyclerId } });
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
  
    if (!recycler || !event) {
      throw new NotFoundException('Recycler or event not found');
    }
  
    const existingRecord = await this.recyclerEventRepository.findOne({
      where: { recycler: { id: recyclerId }, event: { id: eventId } },
    });
  
    if (existingRecord) {
      if (existingRecord.action === 'joined') {
        throw new ConflictException('You cannot reject an event after joining');
      }
      if (existingRecord.action === 'rejected') {
        throw new ConflictException('You have already rejected this event');
      }
    }
  
    const recyclerEvent = this.recyclerEventRepository.create({
      recycler,
      event,
      action: 'rejected',
    });
  
    await this.recyclerEventRepository.save(recyclerEvent);
  
    // Increment the rejectEvents counter
    recycler.rejectEvents += 1;
    await this.recyclerRepository.save(recycler);
  }
  
  


  async getJoinEvents(recyclerId: number): Promise<Event[]> {
    const now = new Date(); 

    const recyclerEvents = await this.recyclerEventRepository.find({
      where: { recycler: { id: recyclerId }, action: 'joined' }, // Only select 'joined' events
      relations: ['event'], // Ensure the event entity is loaded
      select: ['event'],
    });
  
    // Extract event IDs that were joined
    const joinedEventIds = recyclerEvents
      .filter(re => re.event) // Ensure event exists
      .map(re => re.event.id);
  
    if (joinedEventIds.length === 0) {
      return []; // Return empty if no joined events
    }
  
    // Fetch only the joined events (and exclude past events)
    return this.eventRepository.find({
      where: {
        id: In(joinedEventIds), // Fetch only joined event IDs
        startTime: Not(LessThan(now)), // Exclude past events
      },
    });
  }





























   async getUserById(userId: number): Promise<Recycler | null> {
    const user = await this.recyclerRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

 
    // Method to initiate cashout
    async cashout(id: number, token: string, cashoutAmount: number): Promise<any> {
      const recycler = await this.recyclerRepository.findOne({ where: { id } });
  
      if (!recycler) {
        throw new NotFoundException('Recycler not found');
      }
  
      // Check if 2FA is set for the user
      if (!recycler.twofaSecret) {
        throw new BadRequestException('2FA is not enabled for this user');
      }
  
      // Verify the token entered by the user
      const is2faValid = await this.verify2fa(recycler.id, token);
      if (!is2faValid) {
        throw new BadRequestException('Invalid 2FA code');
      }
  
      // Validate the cashout amount
      if (cashoutAmount <= 0) {
        throw new BadRequestException('Cashout amount must be greater than 0');
      }
  
      if (cashoutAmount > recycler.unpaidEarnings) {
        throw new BadRequestException('Insufficient unpaid earnings for the requested cashout amount');
      }
  
      // Process cashout - transfer specified cashout amount to wallet
      recycler.wallet += cashoutAmount;
      recycler.unpaidEarnings -= cashoutAmount; // Subtract the cashout amount from unpaid earnings
  
      // Save the recycler after updating wallet and unpaid earnings
      await this.recyclerRepository.save(recycler);
  
      return {
        message: 'Cashout successful!',
        amount: cashoutAmount,
        newWalletBalance: recycler.wallet,
        remainingUnpaidEarnings: recycler.unpaidEarnings,
      };
    }

    async generate2fa(id: number) {
      const recycler = await this.recyclerRepository.findOne({ where: { id } });
  
      if (!recycler) {
        throw new NotFoundException('Recycler not found');
      }
  
      if (!recycler.email) {
        console.warn(`Recycler ${id} does not have a valid email address.`);
        return { message: '2FA generated, but no valid email address found for this recycler.' };
      }
  
      const secret = speakeasy.generateSecret();
      recycler.twofaSecret = secret.base32;
      await this.recyclerRepository.save(recycler);
  
      const code = speakeasy.totp({
        secret: recycler.twofaSecret,
        encoding: 'base32',
      });
  
      try {
        await this.sendEmail(recycler.email, code);
      } catch (error) {
        console.error('Error sending 2FA email:', error);
        throw new Error('Failed to send 2FA email');
      }
  
      return { message: '2FA secret generated and code sent to email', secret: secret.base32 };
    }

  // Method to send an email
  private async sendEmail(email: string, code: string): Promise<void> {
    // Create a transporter for sending the email using Gmail (you can change this based on your email provider)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or any other email service
      secure: true,  // Use SSL
      port: 465, 
      auth: {
        user: 'apurbo810@gmail.com', // Your email address
        pass: 'ilgvzuosxwybfyqj', // Your email password (use environment variables in production)
      },
    });

    // Email options
    const mailOptions = {
      from: 'apurbo810@gmail.com', // Your email address
      to: email,
      subject: 'Your 2FA Code',
      text: `Your 2FA code is: ${code}. This code is valid for 30 seconds.`,
    };

    // Try to send the email
    try {
      await transporter.sendMail(mailOptions);
      console.log('2FA code sent to:', email);
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      throw new Error('Failed to send 2FA email');
    }
  }

  // Method to verify 2FA code
  private async verify2fa(userId: number, token: string): Promise<boolean> {
    const recycler = await this.recyclerRepository.findOne({ where: { id: userId } });

    if (!recycler) {
      throw new NotFoundException('Recycler not found');
    }

    // Verify the token entered by the user
    const isValid = speakeasy.totp.verify({
      secret: recycler.twofaSecret,
      encoding: 'base32',
      token,
      window: 1, // Allow for a small time window for code validity
    });

    return isValid;
  }


  async activateRecycler(id: number, token: string) {
    const recycler = await this.recyclerRepository.findOne({ where: { id } });

    if (!recycler) {
      throw new NotFoundException('Recycler not found');
    }

    if (!recycler.twofaSecret) {
      throw new BadRequestException('2FA not set up for this account');
    }

    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret: recycler.twofaSecret,
      encoding: 'base32',
      token,
      window: 1, // Allow a small time drift
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Activate the account
    recycler.isActive = true;
    await this.recyclerRepository.save(recycler);

    return { message: 'Account activated successfully' };
  }
  


  async getEarningsAndEvents(id: number) {
    const recycler = await this.recyclerRepository.findOne({ where: { id } });
    if (!recycler) {
      throw new NotFoundException('Recycler not found');
    }
  
    // Get the last 7 days' dates in ISO format
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });
  
    // Get the earnings for the last 7 days
    const earningsLast7Days = last7Days.map(date => recycler.dailyEarnings?.[date] || 0);
  
    // Simplified query to check if any events exist
    const acceptedEvents = await this.recyclerEventRepository
      .createQueryBuilder('recyclerEvent')
      .leftJoinAndSelect('recyclerEvent.recycler', 'recycler')
      .leftJoinAndSelect('recyclerEvent.event', 'event')
      .where('recycler.id = :id', { id })
      .andWhere('recyclerEvent.action = :action', { action: 'joined' })
      .select([
        'recyclerEvent.id',         // Keep the event's ID
        'event.address',             // Select event's address
        'event.startTime',           // Select event's start time
      ])
      .getMany();  // Get the events data
  
    const eventDetails = acceptedEvents.map(event => ({
      eventId: event.id,
      address: event.event?.address,
      startTime: event.event?.startTime,
    }));
  
    return {
      earningsLast7Days,
      eventDetails, // Include the event details to inspect
    };
  }

  async verifyId(id: number) {
    const recycler = await this.recyclerRepository.findOne({ where: { id } });
  
    if (!recycler) {
      throw new NotFoundException('Recycler not found');
    }
  
    return { verified: recycler.isActive };
  }

  async updateProfilePicture(userId: number, filePath: string) {
    const user = await this.recyclerRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    user.profilePicture = filePath; // Save file path in DB
    return this.recyclerRepository.save(user);
  }
  
}







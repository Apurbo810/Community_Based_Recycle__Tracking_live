export class CreateCashoutDto {
    token: string; // 2FA token entered by the user
    cashoutAmount: number; // Amount user wants to cash out
  }
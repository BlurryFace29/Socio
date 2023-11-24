import { SiweMessage } from 'siwe';

export class ExtendedSiweMessage extends SiweMessage {
  name?: string;
  username?: string;
  isVerified?: boolean;

  constructor(param: any) {
    super(param);
    this.name = param.name;
    this.username = param.username;
    this.isVerified = param.isVerified;
  }
}

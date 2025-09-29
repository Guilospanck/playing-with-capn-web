export type UserInfo = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  token: string;
  updatedAt: string;
};

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public token: string,
    public readonly createdAt: string,
    public updatedAt: string,
  ) {}

  toJSON(): UserInfo {
    return {
      createdAt: this.createdAt,
      email: this.email,
      id: this.id,
      name: this.name,
      token: this.token,
      updatedAt: this.updatedAt,
    };
  }
}

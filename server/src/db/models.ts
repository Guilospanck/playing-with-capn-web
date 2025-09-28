export type UserInfo = {
  id: string;
  name: string;
  email: string;
  token: string;
  createdAt: string;
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
      id: this.id,
      name: this.name,
      email: this.email,
      token: this.token,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

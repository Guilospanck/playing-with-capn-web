import { randomUUIDv7 } from "bun";
import { RpcTarget } from "capnweb";

import { db } from "@/db";
import { User, type UserInfo } from "@/db/models";

// Re-export UserInfo
export type { UserInfo };

export interface AuthenticatedAPI {
  getMyInfo(cb: (params: unknown) => void): UserInfo;
}

export interface PublicAPI {
  authenticate(token: string): AuthenticatedAPI;
  createNewUser(name: string, email: string): AuthenticatedAPI;
  getTodaysDate(): string;
}

class AuthenticatedAPIImpl extends RpcTarget implements AuthenticatedAPI {
  constructor(private user: User) {
    super();
  }

  getMyInfo(cb: (params: unknown) => void): UserInfo {
    cb("Hello from getMyInfo");
    return this.user.toJSON();
  }
}

export class PublicAPIImpl extends RpcTarget implements PublicAPI {
  authenticate(token: string): AuthenticatedAPI {
    const user = db
      .query(`SELECT * FROM User WHERE token = $token;`)
      .as(User)
      .get({ token });

    if (user === null) {
      throw new Error("404 NOT FOUND");
    }

    return new AuthenticatedAPIImpl(user);
  }
  createNewUser(name: string, email: string): AuthenticatedAPI {
    // Check if user exists
    const user = db
      .query(`SELECT * FROM User WHERE email = $email;`)
      .as(User)
      .get({ email });

    if (user !== null) {
      return new AuthenticatedAPIImpl(user);
    }

    // User does not exist. Create it
    const createdUser = db
      .query(
        `
          INSERT into User (id, name, email, token)
          VALUES ($id, $name, $email, $token)
          RETURNING *
        `,
      )
      .as(User)
      .get({
        email,
        id: randomUUIDv7(),
        name,
        token: randomUUIDv7(),
      });

    return new AuthenticatedAPIImpl(createdUser!); // Returned user can't be null. We just created it
  }
  getTodaysDate(): string {
    return new Date().toISOString();
  }
}

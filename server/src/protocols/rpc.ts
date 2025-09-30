import { randomUUIDv7 } from "bun";
import { RpcTarget } from "capnweb";

import { db } from "@/db";
import { User, type UserInfo } from "@/db/models";

// Re-export UserInfo so we can use it correctly
// and from just one place in the client.
export type { UserInfo };

export interface AuthenticatedAPI {
  getMyInfo(cb: (params: unknown) => void): UserInfo;
}

export interface PublicAPI {
  authenticate(token: string): AuthenticatedAPI;
  getOrCreateUser(name: string, email: string): UserInfo;
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
      throw new Error("User not found with this token.");
    }

    return new AuthenticatedAPIImpl(user);
  }
  getOrCreateUser(name: string, email: string): UserInfo {
    // Check if user exists
    const user = db
      .query(`SELECT * FROM User WHERE email = $email;`)
      .as(User)
      .get({ email });

    if (user !== null) {
      return user.toJSON();
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

    return createdUser!.toJSON(); // Returned user can't be null. We just created it
  }
  getTodaysDate(): string {
    return new Date().toISOString();
  }
}

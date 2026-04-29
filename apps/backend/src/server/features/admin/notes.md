# General /admin notes

- we need to decide how to handle notifications
- I don't see any lists to quarantine users to

### from C - Moderator Functions.doc, 4/5/23:

## False flagging count

Incremented when MOD undoes undue reporting of comments/posts

## Bad post count

Incremented whenever user's content is banned/muted

## Post flagged count

Incremented when a user's content is flagged

## Quarantine (C-17)

Denotes a user who is muted/restricted from certain actions to prevent abuse
// ----------------------------------------------------------------------------

## report.getAll has inline role-checking; this should be pulled out into RBAC middleware:

// middleware/auth.ts

```ts
import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
try {
const loggedInUserId = (req.user as User)?.id;

    const foundUser = await prisma.user.findUnique({ where: { id: loggedInUserId } });
    const isUserAdmin = foundUser?.userType === 'SUPER_ADMIN' || foundUser?.userType === 'ADMIN';

    if (!isUserAdmin) {
      // Note: Since this is standard Express middleware, we use res.status()
      return res.status(400).json({
        message: "You must be an Administrator to view reports.",
        details: { error: "Unauthorized access attempt" }
      });
    }

    next();

} catch (error) {
next(error);
}
};
```

// ----------------------------------------------------------------------------

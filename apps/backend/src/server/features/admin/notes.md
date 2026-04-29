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

## report.getAll has inline role-checking; this should be pulled out into RBAC middleware

## Threshhold table uses magic numbers throughout the code. Likely to break if the database isn't seeded exactly
### temp fix: createThreshold method now seeds all three numbers, so the correct pattern is established if the table isn't seeded
// ----------------------------------------------------------------------------

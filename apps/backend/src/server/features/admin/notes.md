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

Docs say it's tracked in two lists:
#### False Flagging behaviour quarantine list

#### Bad posting behaviour quarantine list
Neither of which have an associated table


## from 3. File System Navigation (Version 1.1), 1/20/25
### dashboard.js
Controller used to handle quarantine notifications for the user’s dashboard.

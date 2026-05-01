## Troubleshooting

> [!IMPORTANT]
> This document captures common issues encountered during development of the My Living City project.
> It will include their causes and recommended resolutions.
> This document isn't recommended if you haven't read CONTRIBUTING.md yet.

### Local Database Not Populating (PostgreSQL):
***Potential Problems:***
 - Application boots normally, but login attempts fail
 - Database tables appear empty
 - Docker logs show errors during initialization
 - The restore container causes an error

***Solution:***
Use GitBash instead of PowerShell when generating or handling the .tar snapshot.
> [!IMPORTANT]
> Run GitBash 
> Re‑generate the snapshot:
 `pg_dump -U postgres -h <hostname-or-ip> -p <port> -W -F t <dbname> > db/db_init.tar`
> Tear down all containers:
 `pnpm compose:both down`
> Then restart the environment:
 `pnpm compose:both watch`
> Finally, confirm that the database seeds correctly and login succeeds:
 `pnpm compose logs -f | grep init-db`

### Router Doesn't Infer Type:
***Potential Problem:***
Attempting to import a contract from the shared @mlc/lib/api/contracts package and seeing errors:

ex.\
```
  Module '"@mlc/lib/api/contracts"' declares 'moderationApiContracts' locally, 
  but it is not exported. ts(2459)
```

The errors occur even though your imports appear to be correct. 
Type inference inside the router fails, and the contract cannot be used.

***Solution:***
Delete and reinstall your dependencies.
> [!IMPORTANT]
> Remove the local node_modules folder:
 `rm -rf node_modules`
> Reinstall dependencies from the project root:
 `pnpm install`
> Re-run your dev environment:
 `pnpm compose:both watch`

### Composeing Both With Watch Doesn't Seem To Work:
***Potential Problem:***
You may encounter an error like this when trying to compose both the old and new versions
of My Living City: 

ex.\
```
 target mlc-backend: failed to solve: process "/bin/sh -c pnpm --filter @mlc/backend exec prisma generate" did not complete successfully: exit code: 1
```

***Solution:***
Declare the DATABASE_URL environment variable in apps/backend/.env has the correct value:
> [!IMPORTANT]
> Locate the .env file within its relevant directory.
> Ensure that the DATABASE_URL resembles:
 `DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mlc?schema=public"`
> Re-run your dev environment:
 `pnpm compose:both watch`
> Confirm that your watch has been enabled.

### Errors In File Imports:
***Potential Problem:***
You are receiving a bunch of import errors, with the red underlines focused on the file location.

***Solution:***
Your new frontend, backend, etc. may not have the required file that the old version had.
> [!IMPORTANT]
> Leave your location in the new version of the website and locate the file with 
> the red underline in your import. 
> For example, if your red underline is under "src/lib/utilityFunction";
> Go to the old src folder, find the lib folder, and locate the utilityFunction component.
> Create a component in the same location in the new project with the same name.
> Copy/Paste the relevant contents for the component that you're working on.
> Avoid changing names unless they don't match new backend data.

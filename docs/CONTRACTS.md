# Contracts

This guide is meant to support your frontend work.
If you need to connect the backend and frontend, contracts are the recommended approach.
You can find more information about `ts-rest` contracts here: [ts-rest](https://ts-rest.com/)

> [!NOTE]
> The My Living City refactor depends on contracts as a core part of the workflow.
> Working with them will help keep the refactor consistent across the project.

## What are Contracts?
Contracts define the API structure in a way that keeps MyLivingCity's backend 
and frontend aligned. Each contract acts as a single source of truth for both 
the backend and frontend. 

`ts-rest` packages contracts for use with the 
corresponding client and server wrappers. `zod` is used to define client request 
query values and parameters as well as server response HTTP codes and data.

```
<project root>
├── apps
│   ├── backend
│   └── frontend
└── packages
    └── lib
        └── src
            └── api
                └── contracts
```

Placed in `packages/lib`, both `apps/backend` and `apps/frontend` can import
contracts via `import { ... } from "@mlc/lib/api"`.

> [!IMPORTANT]
> This project's directory structure has been carefully designed to assist in future development. 
> Changes to the directory structure will break the application.
> If you need to make changes, please review the wider impact first to determine if it's the best course of action.
 
The backend uses `ts-rest` to bind contracts to route handlers so the router 
stays aligned with the contract, and the frontend can rely on consistent response 
types. The frontend imports these contracts and uses `ts-rest` to generate typed clients.

## Why Are We Using Contracts?
We use contracts to reduce common development issues and make collaboration smoother. 
They alert developers to mismatched request and response shapes, reduce the need to manually 
update types in multiple places, and make endpoint behavior easier to understand. 
They also help the team stay aligned when working across MyLivingCity.

Contracts provide end-to-end type safety and offer a cleaner way to support the 
refactor than the layout currently found in the development branch, which you 
can still review for comparison if needed.

## When Do We Want To Use Contracts?
Use contracts whenever you are:
- Creating a new backend endpoint
- Updating an existing backend endpoint
- Adding a new frontend feature that calls the backend
- Changing the shape of request or response data
- Validating user input on the backend
- Ensuring the frontend receives typed, predictable data

## When Not To Use Contracts?
Contracts are usually not necessary for:
- Purely internal backend logic
- Database schemas, where Prisma should be used instead
- UI-only validations

 > [!IMPORTANT]
> You will likely need to create additional contracts as you continue work on MyLivingCity.

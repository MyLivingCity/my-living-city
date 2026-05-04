# Contracts

This file is intended to go over the contracts in packages -> lib -> contracts, how it connects to the server on the partial frontend refactor, and explain why its laid out like that (packages lib) so that both sides have access to the contracts. 

This contracts guide is intended to compliment your experience working on the front end. 
If you need to wire the backend to the frontend, these contracts are the best bet.
More information on Zod contracts can be found here [Zod Dev](https://zod.dev/)


> [!NOTE]
> Please read CONTRIBUTING.md before proceeding through this guide.
> The refactor for the of My Living City relies on Zod contracts.
> Without working with these Zod contracts, the backend refactor becomes useless.


## What are Zod Contracts?
For this project, Zod contracts help us define the backend sturcture to cohesively connect MyLivingCity's server to its frontend. Each contract is a single source of truth for the 
backend and frontend. When the backend updates a contract, the frontend immediately receives
updated types.

Inside of the Packages folder, you will find a Lib folder, inside of the Lib folder
you will find the contracts folder. This folder includes the Zod contracts that we
were able to finish. There is also an example contract (exampleContract.ts), please
use this contract to familiarize yourself with how these contracts are shaped before
proceeding.

Because the Zod contracts are inside packages -> lib -> contracts, both the apps/backend 
and apps/frontend have access to them and can import them directly. This file structure is
extremely intentional, and if it is changed, the project could be jeopardized. The backend uses ts-rest to bind contracts to actual route handlers to ensure the router matches the contract, 
the contract matches the router, and the frontend knows what the router returns. The frontend imports the contracts and uses ts-rest to generate typed clients.

## Why Are We Using Zod Contracts?
We are using Zod contracts to eliminate a lot of the issues that may arrise during development
and reduce general development friction. While using these contracts, we can significantly reduce mismatched response/request shapes, decrease the need to manually update types in multiple locations, and avoid guessing what an endpoint returns. It also allows us to get on the same page with each other as teammates, and as MyLivingCity collaborators.

Zod contracts provide end-to-end type safety and a much cleaner way to refactor the project than
the layout in the development branch, which you can still reference for comparison at your leisure.
Zod contracts also allow us to validate data at runtime rather than compile time. 

When we received MyLivingCity, there were a number of functions being called that resulted in
errors, and Zod contracts haven't eliminated errors, but they've helped us significantly reduce
error counts.

## When Do We Want To Use Zod Contracts?
Use Zod contracts whenever you are:
 - Creating a new backend endpoint
 - Updating an existing backend endpoint
 - Adding a new frontend feature that calls the backend
 - Changing the shape of request/response data
 - Validating user input on the backend
 - Ensuring the frontend receives typed, predictable data

## When Not To Use Zod Contracts?
Zod contracts won't be necessary for things like:
 - Purely internal backend logic
 - Database schemas (use Prisma for that)
 - UI‑only validations

 > [!IMPORTANT]
> You will likely need to create new Zod contracts of your own to complete MyLivingCity.
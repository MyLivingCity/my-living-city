# Contracts

This contracts guide is intended to compliment your experience working on the front end. 
If you need to wire the backend to the frontend, these contracts are the best bet.
More information on ts rest contracts can be found here [ts rest](https://ts-rest.com/)


> [!NOTE]
> Please read CONTRIBUTING.md before proceeding through this guide.
> The refactor for the of My Living City relies on contracts.
> Without working with these contracts, the refactor becomes useless.


## What are Contracts?
For this project, contracts help us define the backend sturcture to cohesively connect MyLivingCity's server to its frontend. Each contract is a single source of truth for the 
backend and frontend. When the backend updates a contract, the frontend immediately receives
updated types.

 > [!IMPORTANT]
 > Inside of the Packages folder, you will find a Lib folder, inside of the Lib folder
 > you will find the contracts folder.

This folder includes the contracts that we were able to complete. There is also an example contract (exampleContract.ts), please use this contract to familiarize yourself with how these contracts are shaped before proceeding.

Because the contracts are located inside packages -> lib -> contracts, both the apps/backend 
and apps/frontend have access to them and can import them directly. 

 > [!IMPORTANT]
 > This file structure is extremely intentional, and if it is changed, the project could be jeopardized. 
 
The backend uses ts-rest to bind contracts to actual route handlers to ensure the router matches the contract, the contract matches the router, and the frontend knows what the router returns. The frontend imports the contracts and uses ts-rest to generate typed clients.

## Why Are We Using Contracts?
We are using contracts to eliminate a lot of the issues that may arrise during development
and reduce general development friction. While using these contracts, we can significantly reduce mismatched response/request shapes, decrease the need to manually update types in multiple locations, and avoid guessing what an endpoint returns. It also allows us to get on the same page with each other as teammates, and as MyLivingCity collaborators.

Contracts provide end-to-end type safety and a much cleaner way to refactor the project than
the layout in the development branch, which you can still reference for comparison at your leisure.
Contracts also allow us to validate data at runtime rather than compile time. 

> [!NOTE]
> When we received MyLivingCity, there were a number of functions being called that resulted in
> errors, and contracts haven't eliminated errors, but they've helped us significantly reduce
> error counts.

## When Do We Want To Use Contracts?
Use contracts whenever you are:
 - Creating a new backend endpoint
 - Updating an existing backend endpoint
 - Adding a new frontend feature that calls the backend
 - Changing the shape of request/response data
 - Validating user input on the backend
 - Ensuring the frontend receives typed, predictable data

## When Not To Use Contracts?
Contracts won't be necessary for things like:
 - Purely internal backend logic
 - Database schemas (use Prisma for that)
 - UI‑only validations

 > [!IMPORTANT]
> You will likely need to create new contracts of your own to complete MyLivingCity.
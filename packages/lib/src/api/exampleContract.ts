import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const Pokemon = z.object({
  name: z.string(),
});

export const pokemonContract = c.router({
  getPokemon: {
    method: "GET",
    path: "/pokemon/:id",
    responses: {
      200: Pokemon,
    },
    summary: "Get a pokemon by id",
  },
});

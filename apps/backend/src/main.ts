import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initServer } from "@ts-rest/express";
import { createExpressEndpoints } from "@ts-rest/express";
import { pokemonContract } from "@mlc/lib/api";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const router = s.router(pokemonContract, {
  getPokemon: async ({ params: { id } }) => {
    // Mock pokemon data
    const pokemon = { name: "Pikachu" };

    if (id !== "1") {
      return {
        status: 404,
        body: null,
      };
    }

    return {
      status: 200,
      body: pokemon,
    };
  },
});

createExpressEndpoints(pokemonContract, router, app);

const port = process.env["port"] || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

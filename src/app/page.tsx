import LoadMore from "@/components/loadMore";
import { Card } from "@/components/ui/card";

const PAGE_SIZE = 20;

type PokemonType = {
  name: string;
  url: string;
};

const getPokemons = (offset: number = 0) =>
  fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
  ).then((res) => res.json());

const PokemonList = async ({
  pokemon,
}: {
  pokemon?: { results: PokemonType[] };
}) => {
  return (
    <>
      {pokemon?.results.map((pokemon: PokemonType) => (
        <Card key={pokemon.name}>
          <div className="flex flex-col items-center p-4 gap-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
                pokemon.url.split("/")[6]
              }.png`}
              alt={pokemon.name}
            />
            <span className="text-2xl font-bold text-white capitalize">
              {pokemon.name}
            </span>
          </div>
        </Card>
      ))}
    </>
  );
};

async function loadMorePokemon(offset: number) {
  "use server";
  const pokemon = await getPokemons(offset);

  const nextOffset =
    pokemon.results.length >= PAGE_SIZE ? offset + PAGE_SIZE : null;

  return [
    // @ts-expect-error async RSC
    <PokemonList offset={offset} pokemon={pokemon} key={offset} />,
    nextOffset,
  ] as const;
}

export default async function Home() {
  const initialPokemon = await getPokemons(0);

  return (
    <main className="flex min-h-screen flex-col container mb-8 mt-32">
      <h1 className="text-2xl md:text-4xl font-bold mb-8 text-white text-center">
        Infinite Scroll Server Actions Example
      </h1>

      <div className="flex flex-col gap-4 items-center">
        <LoadMore loadMoreAction={loadMorePokemon} initialOffset={20}>
          {/* @ts-expect-error async RSC */}
          <PokemonList pokemon={initialPokemon} />
        </LoadMore>
      </div>
    </main>
  );
}

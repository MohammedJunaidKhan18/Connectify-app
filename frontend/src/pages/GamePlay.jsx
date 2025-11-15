import { useParams } from "react-router-dom";
import { getGameById } from "../games";

export default function GamePlay() {
  const { gameId } = useParams();
  const game = getGameById(gameId);

  if (!game) return <h2>Game Not Found</h2>;

  const GameComponent = game.component;

  return (
    <div style={{ padding: 20 }}>
      <h1>{game.title}</h1>
      <GameComponent />
    </div>
  );
}

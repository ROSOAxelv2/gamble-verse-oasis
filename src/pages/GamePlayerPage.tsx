
import { Layout } from "../components/layout/Layout";
import { GameLoader } from "../components/games/GameLoader";

const GamePlayerPage = () => {
  return (
    <Layout requireAuth>
      <GameLoader />
    </Layout>
  );
};

export default GamePlayerPage;

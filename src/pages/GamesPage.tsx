
import { Layout } from "../components/layout/Layout";
import { GameSelectorGrid } from "../components/games/GameSelectorGrid";

const GamesPage = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <GameSelectorGrid />
      </div>
    </Layout>
  );
};

export default GamesPage;

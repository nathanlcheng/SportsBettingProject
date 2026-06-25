import { Router } from "express";
import { fetchNBAOdds, createGamePredictor } from "./oddsService";
import { oddsToDecimal, realExpectedValue } from "./oddsMath";
import { FinalData } from "./oddsTypes";
 
const router = Router();

router.get("/", async (_req, res) => {
    try{
        const raw = await fetchNBAOdds();
        const consensus = createGamePredictor(raw);

        const processed: FinalData[] = consensus.flatMap((game) => {
            if(game.teams.length !== 2) return [];
            const team1 = game.teams[0];
            const team2 = game.teams[1];

            return [team1,team2].map((team, i) => {
                const opponent = (i === 0) ? team2 : team1;
                const odds = oddsToDecimal(team.bestOdds);
                const value = realExpectedValue(odds, team.noVigProb);

                return {
                    team: team.team,
                    enemyTeam: opponent.team,
                    noVigProb: team.noVigProb,
                    bestOdds: team.bestOdds,
                    bestBook: team.bestBook,
                    ev: value,
                    bookAmount: game.bookCount,
                    commenceTime: game.commenceTime,
                    gameId: game.id,
                };
            });
        });

        processed.sort((a,b) => b.ev - a.ev);
        res.json({
            sport: "NBA",
            count: processed.length,
            generatedAt: new Date().toISOString(),
            bets: processed,
            });
        } catch (err: any) {
            console.error("Odds fetch error:", err.message);
            res.status(500).json({ error: "Failed to fetch NBA odds"});
        }
});

export default router;
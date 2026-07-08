import { Router } from "express";
import { fetchNBAOdds, createGamePredictor, SPORT_LABEL } from "./oddsService";
import { oddsToDecimal, realExpectedValue } from "./oddsMath";
import { FinalData } from "./oddsTypes";
 
const router = Router();
const MIN_BOOKS = 6;

router.get("/", async (_req, res) => {
    try{
        const raw = await fetchNBAOdds();

        const seen = new Map<string, typeof raw[0]>();
        for (const game of raw) {
        const key = [game.homeTeam, game.awayTeam].sort().join("_");
        const existing = seen.get(key);
        if (!existing || game.bookmakers.length > existing.bookmakers.length) {
            seen.set(key, game);
        }
        }
        const deduped = Array.from(seen.values());
        const consensus = createGamePredictor(deduped);

        const processed: FinalData[] = consensus.flatMap((game) => {
            if(game.teams.length !== 2) return [];
            const team1 = game.teams[0];
            const team2 = game.teams[1];

            return [team1,team2].map((team, i) => {
                const opponent = (i === 0) ? team2 : team1;
                const odds = oddsToDecimal(team.bestOdds);
                const value = realExpectedValue(team.noVigProb, odds);

                return {
                    team: team.team,
                    enemyTeam: opponent.team,
                    noVigProb: team.noVigProb,
                    bestOdds: team.bestOdds,
                    bestBook: team.bestBook,
                    ev: value,
                    bookAmount: team.bookAmount,
                    commenceTime: game.commenceTime,
                    gameId: game.id,
                };
            });
        });

        processed.sort((a,b) => b.ev - a.ev);

        const filter = processed.filter(b=>b.bookAmount >= MIN_BOOKS);
        res.json({
            sport: SPORT_LABEL,
            count: filter.length,
            generatedAt: new Date().toISOString(),
            bets: filter,
            });
        } catch (err: any) {
            console.error("Odds fetch error:", err.message);
            res.status(500).json({ error: "Failed to fetch NBA odds"});
        }
});

export default router;
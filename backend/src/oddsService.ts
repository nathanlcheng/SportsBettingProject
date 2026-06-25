import axios from "axios";
import {Game, GamePredictor} from "./oddsTypes";

const BASE_URL = process.env.ODDS_API_BASE_URL;
const API_KEY = process.env.ODDS_API_KEY;
const SPORT_KEY = "baseball_mlb";
export const SPORT_LABEL = "MLB";

export async function fetchNBAOdds():Promise<Game[]>{
    //get response
    const response = await axios.get(`${BASE_URL}/sports/${SPORT_KEY}/odds`,{
        params:{
            regions: "us",
            oddsFormat: "american",
            apiKey: API_KEY,
        },
    });
    //put in Game interface and return
    return response.data.map((game:any) => ({
        id: game.id,
        commenceTime: game.commence_time,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        bookmakers:(game.bookmakers ?? []).map((book: any) =>({
            key: book.key,
            title: book.title,
            outcomes: (book.markets?.[0]?.outcomes ?? []).map((o:any) => ({
                team: o.name,
                price: o.price,
            })),
        })),
    }));

}

//apply math and return 
export function createGamePredictor(games:Game[]): GamePredictor[]{
    return games.map((game) => {
        const teamOdds: Record<string, number[]> = {};
        for(const b of game.bookmakers){
            for(const outcome of b.outcomes){
                if(!teamOdds[outcome.team]) teamOdds[outcome.team] = [];
                teamOdds[outcome.team].push(outcome.price);
            }
        }
        const teams = Object.keys(teamOdds);

        const consensusTeams = teams.map((team) => {
            const allOdds = teamOdds[team];

            const avgProb = allOdds.reduce((sum,o) => {
                const decimal = o >0?1+o/100:1+100/Math.abs(o);
                return sum+1/decimal;
            },0)/allOdds.length;

            const bestOdds = allOdds.reduce((best, o) =>{
                const decimalBest = best>0?1+best/100: 1+100/Math.abs(best);
                const decimalO = o>0? 1+o/100: 1+100/Math.abs(o);
                return decimalBest>decimalO ? best : o;
            });

            const bestBookKey =
                game.bookmakers.find((b) =>
                    b.outcomes.some((o) => o.team === team && o.price == bestOdds)
            )?.key ?? "unknownBook";

            return {
                team,
                avgProb,
                bestOdds,
                bestBook:bestBookKey,
                bookAmount: allOdds.length,
            };
        });

        const totalImplied = consensusTeams.reduce((s,t) => s+t.avgProb, 0)
        const noVigProb = consensusTeams.map((t) => ({
            ...t,
            noVigProb: t.avgProb/totalImplied
        }));

        return{
            id: game.id,
            commenceTime:game.commenceTime,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            teams: noVigProb,
            bookCount: game.bookmakers.length
        }
    });
}
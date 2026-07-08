import axios from "axios";
import {Game, GamePredictor} from "./oddsTypes";

const BASE_URL = process.env.ODDS_API_BASE_URL;
const API_KEY = process.env.ODDS_API_KEY;
const SPORT_KEY = "baseball_mlb";
export const SPORT_LABEL = "MLB";
const SKIP_BOOK = ["bovada", "mybookieag", "betus"];

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
            if(SKIP_BOOK.includes(b.key)){
                continue;
            }
            for(const outcome of b.outcomes){
                if(!teamOdds[outcome.team]) teamOdds[outcome.team] = [];
                teamOdds[outcome.team].push(outcome.price);
            }
        }
        const teams = Object.keys(teamOdds);

        const consensusTeams = teams.map((team) => {
            const allOdds = teamOdds[team];

            const decimals = allOdds.map(o => o>0 ? 1+o/100:1+100/Math.abs(o));

            const sorted = [...decimals].sort((a,b) => a-b);

            const median = sorted[Math.floor(sorted.length/2)];

            const removeOutliers = decimals.filter(
                d=> d /median <1.5 && median /d <1.5
            )
            const useDecimals = removeOutliers.length>=2 ?removeOutliers: decimals;

            const avgProb = useDecimals.reduce((sum,o) => {
                return sum+1/o;
            },0)/useDecimals.length;

            const bestDecimal = Math.max(...useDecimals);

            const bestOdds = bestDecimal >= 2 ? Math.round((bestDecimal-1)*100) : Math.round(-100/(bestDecimal-1));


            const bestBookKey =
                game.bookmakers.find((b) =>
                    b.outcomes.some((o) => {const d = o.price > 0 ? 1 +o.price / 100 : 1+ 100/Math.abs(o.price);
                        return Math.abs(d-bestDecimal) <0.01 && o.team ===team;
                    })
            )?.key ?? "unknownBook";

            return {
                team,
                avgProb,
                bestOdds,
                bestBook:bestBookKey,
                bookAmount: useDecimals.length,
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
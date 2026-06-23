import axios from "axios";
import {Game, GamePredictor} from "./oddsTypes";

const BASE_URL = process.env.ODDS_API_BASE_URL;
const API_KEY = process.env.ODDS_API_KEY;
const SPORT_KEY = "basketball_nba";

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

}
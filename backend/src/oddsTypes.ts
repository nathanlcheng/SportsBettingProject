// For Raw API
export interface Outcome{
    team:string;
    price:number;
}

export interface Bookmaker{
    key: string;
    title: string;
    outcomes: Outcome[];
}

export interface Game{
    id: string;
    commenceTime: string;
    homeTeam: string;
    awayTeam: string;
    bookmakers: Bookmaker[]
}
// For after calculations
export interface GamePredictor{
    id: string;
    commenceTime: string;
    homeTeam: string;
    awayTeam: string;
    teams: TeamPredictor[];
    bookCount: number;
}

export interface TeamPredictor{
    team:string;
    avgProb: number;
    noVigProb: number;
    bestOdds: number;
    bestBook: string;
    bookAmount: number;
}

//For frontend

export interface FinalData{
    team:string;
    enemyTeam: string;
    noVigProb: number;
    bestOdds: number;
    bestBook: string;
    ev: number;
    bookAmount: number;
    commenceTime: string;
    gameId:string;
}
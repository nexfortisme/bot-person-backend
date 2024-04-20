class EloRatingSystem {
    private static readonly K_FACTOR: number = 32;

    // Calculate the expected score for player A
    private static expectedScore(ratingA: number, ratingB: number): number {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    }

    // Update the Elo ratings for two players
    public static updateRatings(ratingA: number, ratingB: number, scoreA: number): { newRatingA: number, newRatingB: number } {
        const expectedScoreA = this.expectedScore(ratingA, ratingB);
        const expectedScoreB = 1 - expectedScoreA;

        let newRatingA = ratingA + this.K_FACTOR * (scoreA - expectedScoreA);
        let newRatingB = ratingB + this.K_FACTOR * ((1 - scoreA) - expectedScoreB);

        newRatingA = Math.floor(newRatingA);
        newRatingB = Math.ceil(newRatingB);
    
        return { newRatingA, newRatingB };
    }
}

// Example usage
const { newRatingA, newRatingB } = EloRatingSystem.updateRatings(1500, 2400, 1); // Player A wins
console.log(`New ratings - Player A: ${newRatingA}, Player B: ${newRatingB}`);

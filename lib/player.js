export class Player {
    constructor(name, faction) {
        this.name = name;
        this.tournamentPoints = 0;
        this.victoryPoints = 0;
        this.hasBye = false;
        this.opponents = [];
        this.faction=faction;
    }
}

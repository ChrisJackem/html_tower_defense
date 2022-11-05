import { TileManager } from "./tile_manager.js"


export class Level{
    constructor(){

        this.level_data = null
        this.Tile_Man = new TileManager()

        // Get Level Data
        fetch('levels.json')
         .then( response => response.json() )
         .then( json => {
            this.level_data = json
            this.buildLevel( this.level_data[0] )
        })
         //.catch( e => console.log(`Fetch Error: ${e}`) )
    }

    buildLevel( obj ){
        this.Tile_Man.buildTiles( obj.tileset, obj.tiles )
    }
}
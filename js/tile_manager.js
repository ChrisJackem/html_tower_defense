

const div_container = document.getElementById('container')
const dir_tilesets = '../tilesets'

export class TileManager{
    constructor(){
        this.tile_data = null
        this.costs = null
    }

    /** Loads tile data into memory
     * @param {string} tileset the name of the tileset in level json
     * @param {string[]} tile_data the tile data from level.json
     */
    buildTiles( tileset, tile_data ){

        // Copy the tile_data, save this clone
        // We replace these values with the objects we create
        this.tile_data = tile_data.map( arr => arr.slice() )

        const dir_tileset = `${dir_tilesets}/${tileset}/`
        content.innerHTML = ''
        
        // Set parent grid
        const tile_row_amount = tile_data[0].length
        content.style.gridTemplateColumns= `repeat( ${tile_row_amount}, 1fr )`
        
        let count = 0;

        // Build tiles
        for ( let row in tile_data ){
            for ( let col in tile_data[row] ){
                const tile_char = tile_data[row][col]
                const new_tile = new Tile( this, tile_char, [ row, col ], dir_tileset )
                this.tile_data[row][col] = content.appendChild(new_tile)  
                count ++             
            }
        }
        // Find all neighbors of each tile
        this.tile_data.forEach( row => row.forEach( tile=>tile.findNeighbors() ) )
    }
}

export class Tile extends HTMLElement{

    /**
     * @param {TileManager} manager The manager that created this
     * @param {string} char The character in the data matrix
     * @param {Array} pos The position in the data [row,column]
     * @param {string} tileset The tileset directory
     */
    constructor( manager, char, pos, tileset ){
        super()
        this.pos = { x: parseInt(pos[1]), y:parseInt(pos[0]) }// * Switched
        this.tileset = tileset
        this.char = char
        this.neighbors = undefined
        this.manager = manager
        /* this.image = this.appendChild( new Image() ) */

        // Testing 
        this.addEventListener('click', e => {
            /* let all = [...document.getElementsByTagName('game-tile')].forEach( t=> t.style = '')
            this.neighbors.forEach( n=> n.style.backgroundColor='red' )  */
            this.char = this.char == ' ' ? 'w' : ' '
            
            this.findNeighbors()
            this.neighbors.forEach( n => n.findNeighbors() )
            
        })
    }

    // Look around me for neighbors.
    // As we look from north to west (CW) build the image string (ie 'n_e_w')
    findNeighbors(){
        const data = this.manager.tile_data// [row][col] !!
        const X = this.pos.x; const Y = this.pos.y
        let neighbors = {}
                
        neighbors.n =  this.getNeighborAt( X,   Y-1 )
        neighbors.ne = this.getNeighborAt( X+1, Y-1 )
        neighbors.e =  this.getNeighborAt( X+1, Y )
        neighbors.se = this.getNeighborAt( X+1, Y+1 )
        neighbors.s =  this.getNeighborAt( X,   Y+1 )
        neighbors.sw = this.getNeighborAt( X-1, Y+1 )
        neighbors.w =  this.getNeighborAt( X-1, Y )
        neighbors.nw = this.getNeighborAt( X-1, Y-1 )
        
        // Delete null values and save
        Object.keys(neighbors).forEach( k => !neighbors[k] && delete neighbors[k] )
        this.neighbors = Object.values( neighbors )

        // Build image string (walls)
        if ( this.char != ' '){            
            let directions = []
            for ( let key of ['n','e','s','w']){

                // Handle edges
                if ( key=='n' && Y==0 ){ directions.push('n'); }
                if ( key=='e' && X==data[0].length-1 ){ directions.push('e'); }
                if ( key=='s' && Y==data.length-1 ){ directions.push('s'); }
                if ( key=='w' && X==0 ){ directions.push('w');  }

                // Add direction if there is a neighbor                
                if (neighbors.hasOwnProperty(key)){
                    if ( neighbors[key].char != ' '){ directions.push(key) }
                }
                
                if (directions.length==0){
                    this.style.backgroundImage = `url(${this.tileset}single.svg)`
                }else{
                    this.style.backgroundImage = `url(${this.tileset}${directions.join('_')}.svg)`
                }                
            }
        }else{
            // We are an air block
            this.style.backgroundImage = 'none';
        }
    }

    // Helper for findNeighbors()
    getNeighborAt( x, y ){
        const data = this.manager.tile_data// [row][col] !!
        return ( x < 0 || x > data[0][0].length-1 || y < 0 || y > data.length-1 ) ? null : data[y][x]
    }
}
customElements.define('game-tile', Tile);
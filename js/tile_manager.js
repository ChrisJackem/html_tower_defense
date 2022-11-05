import { Enemy } from "./enemy.js"

//const div_container = document.getElementById('content')
const dir_tilesets = '../tilesets'

export class TileManager{
    constructor(){
        this.tile_data = null
        this.costs = null

        //Unwalkable blocks
        this.blocks = new Set('w') 
    }

    /** Loads tile data into memory
     * @param {string} tileset the name of the tileset in level json
     * @param {string[]} tile_data the tile data from level.json
     */
    buildTiles( wall_tileset, spawner_tileset, tile_data ){

        // Copy the tile_data, save this clone
        // We replace these values with the objects we create
        this.tile_data = tile_data.map( arr => arr.slice() )

        const dir_wall_tileset = `${dir_tilesets}/${wall_tileset}/`
        const dir_spawner_tileset = `${dir_tilesets}/${spawner_tileset}/`
        content.innerHTML = ''

        let spawner, goal
        
        // Set parent grid
        const tile_row_amount = tile_data[0].length
        content.style.gridTemplateColumns= `repeat( ${tile_row_amount}, 1fr )`

        // Build tiles
        for ( let row in tile_data ){
            for ( let col in tile_data[row] ){
                const tile_char = tile_data[row][col]
                let new_tile
                switch( tile_char ){
                    case ' ':
                    case 'w': // Normal tiles
                        new_tile = new Tile( this, tile_char, [ row, col ], dir_wall_tileset )
                        break
                    case 's': 
                        new_tile = new Spawner ( this, tile_char, [ row, col ], dir_spawner_tileset )
                        spawner = new_tile
                        break
                    case 'g': 
                        new_tile = new Goal ( this, tile_char, [ row, col ], dir_spawner_tileset );
                        goal = new_tile
                        break
                }
                this.tile_data[row][col] = content.appendChild(new_tile)            
            }
        }
        // Find all neighbors of each tile
        this.tile_data.forEach( row => row.forEach( tile=>tile.findNeighbors() ) )

        // Init the spawner
        spawner.init( goal )

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
        this.neighbors = undefined
        this.manager = manager
        this.char = char

        // Path props        
        this.parent = null
        this.g = this.h = this.f = 0        

        // Testing 
        /* this.addEventListener('click', e => {
             
            // Turn meioghbor background red
            let all = [...document.getElementsByTagName('game-tile')].forEach( t=> t.style = '')
            this.neighbors.forEach( n=> n.style.backgroundColor='red' ) 

            // Toggle wall - this is pretty fun !
            this.char = this.char == ' ' ? 'w' : ' '            
            this.findNeighbors()
            this.neighbors.forEach( n => n.findNeighbors() )
            
        }) */
    }

    ///////////// Get / Set ////////////////////////////
    // Char is linked to is_block
    get is_block(){ return this.manager.blocks.has( this.char ) }

    pathReset(){
        this.parent = null
        this.g = this.h = this.f = 0
    }

    // Look around me for neighbors.
    // As we look from north to west (CW) build the image string (ie 'n_e_w')
    // Every combination will have an image in the tileset, 
    // so we only care about cardinal directions as far as the background image goes ( can expand to do angles )
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

        if ( !this.is_block ){ return }

        // Build image string (walls)
        if ( this.char != ' '){
            let directions = []

            for ( let key of ['n','e','s','w']){// Cardinal directions

                // Handle edges
                if ( key=='n' && Y==0 ){ directions.push('n'); }
                if ( key=='e' && X==data[0].length-1 ){ directions.push('e'); }
                if ( key=='s' && Y==data.length-1 ){ directions.push('s'); }
                if ( key=='w' && X==0 ){ directions.push('w');  }

                // Add direction if there is a neighbor                
                if (neighbors.hasOwnProperty(key)){
                    if ( neighbors[key].char != ' '){ directions.push(key) }
                }              
            }

            // Join array or set as single ( background file name )
            this.style.backgroundImage = directions.length ? 
                `url(${this.tileset}${directions.join('_')}.svg)` : `url(${this.tileset}single.svg)`

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


export class Spawner extends Tile{
    constructor( manager, char, pos, tileset ){
        super( manager, char, pos, tileset )
        this.style.backgroundImage = `url(${tileset}spawn.svg)`
        this.goal = undefined
        //this.spawnEnemy()
    }

    init( goal ){
        this.goal = goal
        this.spawnEnemy()
    }

    spawnEnemy(){
        let img_src = `${this.tileset}enemy_1_1.svg`
        let e = new Enemy( img_src, this, this.goal )
    }
}

export class Goal extends Tile{
    constructor( manager, char, pos, tileset ){
        super( manager, char, pos, tileset )        
        this.style.backgroundImage = `url(${tileset}goal.svg)`
    }
}

// Define custom tags
customElements.define('game-tile', Tile);
customElements.define('game-spawner', Spawner);
customElements.define('game-goal', Goal);

const div_container = document.getElementById('content')


export class Enemy extends HTMLElement{
    constructor( img, spawn, goal ){
        super()
        this.curr_tile = spawn
        this.goal = goal
        spawn.appendChild(this)

        this.image = new Image()
        this.appendChild( this.image )
        this.image.src = img

        // Path
        this.path = undefined
        this.tiles = [...div_container.children]
        this.findPath()
    }
    findPath(){
        
        this.tiles.forEach( t => t.pathReset() )
        const walk_tiles = this.tiles.filter( tile => !tile.is_block )
        //for (let t of walk_tiles ){ t.style.backgroundColor = 'blue' }

        let open = [] ; let closed = []
        this.path = []


        open.push( this.curr_tile )

        while ( open.length ){

            // Get current node
            let current_node = open[0]
            let current_index = 0
            for ( const i in open ){
                const open_item = open[i]
                if ( open_item.f < current_node.f ){
                    current_node = open_item
                    current_index = i
                }
            }
            // Remove from open, put into closed
            closed.push( ...open.splice(current_index,1) )

            // Found Goal
            if ( current_node == this.goal ){
                let current = current_node
                while( current ){
                    this.path.push( current )
                    current = current.parent
                }
                // TODO: Reverse path
                this.path.forEach( t => t.style.backgroundColor='blue' )
                this.path.reverse()
                return
            }

            for ( const nb of current_node.neighbors ){
                if ( closed.includes(nb) || nb.is_block ){ continue }
                nb.parent = current_node

                // calculate values
                nb.g = current_node.g + 1
                nb.h =  ((nb.pos.x - this.goal.pos.x) ** 2) + ((nb.pos.y - this.goal.pos.y) ** 2)
                nb.f = nb.g + nb.h

                // neighbor is in the open list
                for ( const open_node of open ){
                    if ( nb == open_node && nb.g > open_node.g ){ continue }
                }

                open.push( nb )
            }

            console.log(open)      

        }
        //        
    }
}




customElements.define('game-enemy', Enemy);
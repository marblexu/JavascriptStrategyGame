
function initTwoDimensionalArray(one_dim_num, two_dim_num, init_value) {
    let s = [];
    for (let i = 0; i < one_dim_num; i++) {
        let tmp = [];
        for(let j = 0; j < two_dim_num; j++) {
            tmp.push(init_value);
        }
        s.push(tmp);
    }
    return s;
}

class MapData {
    constructor(width, height, grid) {
        this.width = width;
        this.height = height;
        this.active_entity = undefined;
        this.setupMap(grid);
    }
    
    setupMap(grid) {
        this.grid_map = initTwoDimensionalArray(this.height, this.width, 0);

        for(let index in grid) {
            let {x, y, type} = grid[index];
            this.grid_map[y][x] = type;
        };
        
        this.bg_map = initTwoDimensionalArray(this.height, this.width, 0);
        this.entity_map = initTwoDimensionalArray(this.height, this.width, undefined);
    }
    
    isValid(map_x, map_y) {
        if (map_x < 0 || map_x >= this.width ||
            map_y < 0 || map_y >= this.height) {
            return false;
        }
        return true;
    }
    
    isMovable(map_x, map_y) {
        return (this.grid_map[map_y][map_x] != MAP_STONE &&
                this.entity_map[map_y][map_x] == undefined);
    }
    
    getMapIndex(x, y) {
        return [parseInt(x / REC_SIZE), parseInt(y / REC_SIZE)];
    }

    getDistance(x1, y1, map_x2, map_y2) {
        let [map_x1, map_y1] = this.getMapIndex(x1, y1);
        let x2 = map_x2 * REC_SIZE + REC_SIZE / 2;
        let y2 = map_y2 * REC_SIZE + REC_SIZE / 2;
        let distance = Math.abs(x1 - x2) + Math.abs(y1 - y2);
        if(map_x1 != map_x2 && map_y1 != map_y2) {
            distance -= REC_SIZE / 2;
        }
        return distance;
    }
    
    isInRange(source_x, source_y, dest_x, dest_y, max_distance) {
        let distance = getAStarDistance(this, source_x, source_y, dest_x, dest_y);
        if(distance != undefined) {
            if(distance <= max_distance) {
                return true;
            }
        }
        return false;
    }
    
    checkMouseClick(x, y) {
        let [map_x, map_y] = this.getMapIndex(x, y);
        
        if(this.bg_map[map_y][map_x] == BG_SELECT) {
            this.active_entity.setDestination(this, map_x, map_y);
            return true;
        }
        else if(this.bg_map[map_y][map_x] == BG_ATTACK) {
            let entity = this.entity_map[map_y][map_x];
            if(this.active_entity.canRemoteAttack(this)) {
                this.active_entity.setRemoteTarget(entity);
            }
            else {
                this.active_entity.setDestination(this, this.choice[0], this.choice[1], entity);
            }
            return true;
        }
        return false;
    }

    resetBackGround() {
        for(let y in this.bg_map) {
            let row = this.bg_map[y];
            for(let x in row) {
                this.bg_map[y][x] = BG_EMPTY
            }
        }
    }
    
    showActiveEntityRange() {
        let [map_x, map_y] = this.active_entity.getMapIndex();
        let distance = this.active_entity.attr.distance;
        
        this.bg_map[map_y][map_x] = BG_ACTIVE;
        
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if(!this.isMovable(x, y) || 
                   (x == map_x && y == map_y)) {
                    continue;
                }
                if(this.isInRange(map_x, map_y, x, y, distance)) {
                    this.bg_map[y][x] = BG_RANGE;
                }
            }
        }
    }
    
    checkMouseMove(mouse_pos) {
        let [map_x, map_y] = this.getMapIndex(mouse_pos.x, mouse_pos.y);
        
        if(!this.isValid(map_x, map_y) || 
           this.grid_map[map_y][map_x] == MAP_STONE) {
            return false;
        }
        
        let [x, y] = this.active_entity.getMapIndex();
        let distance = this.active_entity.attr.distance;
        
        this.choice = undefined;
        let entity = this.entity_map[map_y][map_x];
        
        if(entity == undefined) {
            if(this.isInRange(x, y, map_x, map_y, distance)) {
                this.bg_map[map_y][map_x] = BG_SELECT;
            }
        }
        else if(entity == this.active_entity) {
            this.bg_map[map_y][map_x] = BG_SELECT;
        }
        else if(entity.group_id != this.active_entity.group_id) {
            if(this.active_entity.canRemoteAttack(this)) {
                this.bg_map[map_y][map_x] = BG_ATTACK;
            }
            else {
                let dir_list = getAttackPositions(map_x, map_y);
                let res_list = [];
                for(let i in dir_list) {
                    let [offset_x, offset_y] = dir_list[i];
                    let tmp_x = map_x + offset_x;
                    let tmp_y = map_y + offset_y;
                    if(this.isValid(tmp_x, tmp_y)) {
                        let type = this.bg_map[tmp_y][tmp_x];
                        if(type == BG_RANGE || type == BG_ACTIVE) {
                            res_list.push([tmp_x, tmp_y]);
                        }
                    }
                }
                
                if(res_list.length > 0) {
                    let min_dis = MAP_WIDTH;
                    let res;
                    for(let i in res_list) {
                        let [tmp_x, tmp_y] = res_list[i];
                        let distance = this.getDistance(mouse_pos.x, mouse_pos.y, tmp_x, tmp_y);
                        if(distance < min_dis) {
                            min_dis = distance;
                            res = [tmp_x, tmp_y];
                        }
                    }
                    this.bg_map[res[1]][res[0]] = BG_SELECT;
                    this.bg_map[map_y][map_x] = BG_ATTACK;
                    this.choice = res;
                }
            }
        }
    }
    
    updateMapShow(mouse_pos) {
        this.resetBackGround();
        
        if(this.active_entity == undefined || 
           this.active_entity.state != IDLE) {
            return;
        }
        
        this.showActiveEntityRange();
        if(mouse_pos != undefined) {
            this.checkMouseMove(mouse_pos);
        }
    }
    
    setEntity(map_x, map_y, value) {
        this.entity_map[map_y][map_x] = value;
    }
    
    drawBackground(ctx) {
        for(let y in this.bg_map) {
            let row = this.bg_map[y];
            for(let x in row) {
                let color = LIGHTYELLOW;
                if(row[x] == BG_ACTIVE) {
                    color = SKYBLUE;
                }
                else if(row[x] == BG_RANGE) {
                    color = NAVYBLUE;
                }
                else if(row[x] == BG_SELECT) {
                    color = LIGHTGREEN;
                }
                else if(row[x] == BG_ATTACK) {
                    color = GOLD;
                }
                
                drawRect(ctx, color, x * REC_SIZE, y * REC_SIZE, REC_SIZE, REC_SIZE);
            }
        }
        
        for(let y in this.grid_map) {
            let row = this.grid_map[y];
            for(let x in row) {
                if(row[x] == MAP_STONE) {
                    let dest_rect = [x * REC_SIZE, y * REC_SIZE, 48, 48];
                    let grid_image = GRID_IMAGE_MAP.get(MAP_STONE.toString());
                    grid_image.draw(ctx, dest_rect);
                }
                else if(row[x] == MAP_GRASS) {
                    let dest_rect = [x * REC_SIZE, y * REC_SIZE, 48, 48];
                    let grid_image = GRID_IMAGE_MAP.get(MAP_GRASS.toString());
                    grid_image.draw(ctx, dest_rect);
                }
            }
        }
        
        for(let y = 0; y <= this.height; y++) {
            let start_x = 0, start_y = REC_SIZE * y;
            let end_x = MAP_WIDTH, end_y = REC_SIZE * y;
            drawLine(ctx, 'black', start_x, start_y, end_x, end_y);
        }
        
        for(let x = 0; x <= this.width; x++) {
            let start_x = REC_SIZE * x, start_y = 0;
            let end_x = REC_SIZE * x, end_y = MAP_HEIGHT;
            drawLine(ctx, 'black', start_x, start_y, end_x, end_y);
        }
    }
}

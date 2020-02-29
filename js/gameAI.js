
class EnemyInfo{
    constructor(entity, enemy, point, distance, damage_half) {
        this.enemy = enemy;
        this.point = point;
        this.distance = distance;
        if(distance == 0) {
            this.round_num = 0;
        }
        else{
            this.round_num = parseInt((distance - 1) / entity.attr.distance);
        }
        let hurt = entity.attr.getHurt(enemy.attr, damage_half);
        this.kill_time = parseInt((enemy.health - 1) / hurt);
        this.remote = enemy.attr.remote;
    }
}

function getAIAction(entity, MAP, enemy_group) {
    let info_list = [];
    let best_info = undefined;
    let remote_attack = entity.canRemoteAttack(MAP);
    
    for(let i in enemy_group) {
        let enemy = enemy_group[i];
        let point = undefined;
        let distance = 0;

        if(!remote_attack) {
            let dest = [entity.map_x, entity.map_y];
            if(!isNextToEntity(entity, enemy)){
                dest = getDestination(entity, MAP, enemy);
            }
            if(dest == undefined) {
                continue;
            }
            point = aStarSearch(MAP, entity.map_x, entity.map_y, dest[0], dest[1]);
            distance = getDistanceByPoint(point);
        }
        
        let damage_half = false;
        if(entity.attr.remote && !remote_attack) {
            damage_half = true;
        }
        let enemy_info = new EnemyInfo(entity, enemy, point, distance, damage_half);
        info_list.push(enemy_info);
    }
    
    for(let i in info_list) {
        let info = info_list[i];
        if(best_info == undefined) {
            best_info = info;
        }
        else {
            if(info.round_num < best_info.round_num) {
                best_info = info;
            }
            else if(info.round_num == best_info.round_num) {
                if(info.round_num == 0) {
                    if(info.kill_time < best_info.kill_time) {
                        best_info = info;
                    }
                    else if(info.kill_time == best_info.kill_time) {
                        if(info.remote && !best_info.remote) {
                            best_info = info;
                        }
                        else if(info.distance < best_info.distance) {
                            best_info = info;
                        }
                    }
                }
                else {
                    if(info.distance < best_info.distance) {
                        best_info = info;
                    }
                }
            }
        }
    }
    
    if(best_info.round_num == 0) {
        if(best_info.point == undefined) {
            return [undefined, best_info.enemy];
        }
        else {
            return [[best_info.point.x, best_info.point.y], best_info.enemy];
        }
    }
    else if(best_info.round_num == 1) {
        let [x, y] = getPosByDistance(best_info.point, entity.attr.distance);
        return [[x, y],undefined];
    }
    else {
        let distance = best_info.distance - entity.attr.distance;
        let [x, y] = getPosByDistance(best_info.point, distance);
        return [[x, y],undefined];
    }
}

function getDestination(entity, MAP, enemy) {
    let dir_list = getAttackPositions(enemy.map_x, enemy.map_y);
    let best_pos = undefined;
    let min_dis = 0;
    
    for(let i in dir_list) {
        let [offset_x, offset_y] = dir_list[i];
        let x = enemy.map_x + offset_x;
        let y = enemy.map_y + offset_y;
        if(MAP.isValid(x, y) && MAP.isMovable(x, y)) {
            let distance = getAStarDistance(MAP, entity.map_x, entity.map_y, x, y);
            if(distance == undefined) {
                continue;
            }
            if((best_pos == undefined) || (distance < min_dis)) {
                best_pos = [x, y];
                min_dis = distance;
            }
        }
    }    
    return best_pos;
}

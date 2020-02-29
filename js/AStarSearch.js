function aStarSearch(MAP, start_x, start_y, dest_x, dest_y) {
    let openList = [], closedList = [];
    let dest = {x:dest_x, y:dest_y};
    let point = undefined;
    openList.push({x:start_x, y:start_y, G:0, pre_entry:undefined});
    
    while(true) {
        point = openList.pop();
        closedList.push(point);
    
        if(point.x === dest.x && point.y === dest.y) {
            break;
        }

        let positions = getAdjacentPositions(MAP, point);
        for(let i in positions) {
            let pos = positions[i];
            if(!isInList(closedList, pos)) {
                let h = calHeuristic(MAP, point, dest);
                let g = point.G + getMoveCost(point, pos);
        
                if(isInList(openList, pos)) {
                    let index = isInList(openList, pos);
                    if(g < openList[index].G) {
                        openList[index].G = g;
                        openList[index].F = g + openList[index].h;
                        openList[index].pre_entry = point;
                    }
                }
                else {
                    let item = {x:pos.x, y:pos.y, H:h, G:g, F:(g+h), pre_entry:point};
                    openList.push(item);            
                }
            }
        };
        if(openList.length === 0) {
            point = undefined;
            break;
        }    
        openList.sort(function(a,b) {
            return b.F - a.F;
        });
    };
    return point;
};

function getAdjacentPositions(MAP, point) {
    let x = point.x, y = point.y;
    let offsets = [[-1,0], [0,-1], [1,0], [0,1]];
    let positions = [];
    
    for(let i in offsets) {
        let map_x = x + offsets[i][0];
        let map_y = y + offsets[i][1];
        if(MAP.isValid(map_x, map_y) && MAP.isMovable(map_x, map_y)) {
            positions.push({x:map_x, y:map_y});
        }
    }
    return positions;
};

function isInList(list, point) {
    for(let i in list) {
        if(point.x === list[i].x && point.y === list[i].y) {
            return i;
        }
    }
    return false;
}

function calHeuristic(MAP, point, dest) {
    return (Math.abs(point.x - dest.x) + Math.abs(point.y - dest.y));
}

function getMoveCost(point, pos) {
    return 1;
}

function getDistanceByPoint(point) {
    let distance = 0;
    while(point.pre_entry != undefined) {
        distance += 1;
        point = point.pre_entry;
    }
    return distance;
}

function getAStarDistance(MAP, start_x, start_y, dest_x, dest_y) {
    let point = aStarSearch(MAP, start_x, start_y, dest_x, dest_y);
    if(point != undefined) {
        return getDistanceByPoint(point);
    }
    else {
        return undefined;
    }
}

function getPath(MAP, start_x, start_y, dest_x, dest_y) {
    if(start_x == dest_x && start_y == dest_y) {
        return undefined;
    }
    
    let path = undefined;
    let point = aStarSearch(MAP, start_x, start_y, dest_x, dest_y);
    if(point != undefined) {
        path = [];
        while(point.pre_entry != undefined) {
            path.push(point);
            point = point.pre_entry;
        }
    }
    return path;
}

function getPosByDistance(point, distance) {
    while(point.pre_entry != undefined) {
        if(distance == 0) {
            break;
        }
        point = point.pre_entry;
        distance -= 1;
    }
    return [point.x, point.y];
}

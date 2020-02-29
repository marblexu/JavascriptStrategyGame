class Level extends State{
    constructor() {
        super();
    }
    
    startup(current_time, game_info) {
        this.start_time = current_time;
        this.game_info = game_info;
        this.level_data = getLevelData(this.game_info[LEVEL_NUM]);
        this.loadMap();
        this.setupGroup();
        this.state = IDLE;
    }
    
    loadMap() {
        this.map = new MapData(GRID_X_LEN, GRID_Y_LEN, this.level_data[MAP_GRID]);
    }
    
    setupGroup() {
        
        this.group1 = new EntityGroup(1);
        this.group1.createEntity(this.level_data[GROUP1], this.map);
        
        this.group2 = new EntityGroup(2);
        this.group2.createEntity(this.level_data[GROUP2], this.map);
        
        this.hurt_group = [];
    }
    
    update(ctx, current_time, mouse_pos, mouse_down) {
        this.current_time = current_time;
        
        if(this.state == IDLE) {
            let result = this.getActiveEntity();
            if(result != undefined) {
                this.map.active_entity = result[0];
                result[1].consumeEntity();
                this.state = SELECT;
            }
            else {
                this.group1.nextTurn();
                this.group2.nextTurn();
            }
        }
        else if(this.state == SELECT) {
            if(this.map.active_entity.group_id == 1) {
                let [pos, enemy] = getAIAction(this.map.active_entity, this.map, this.group2.group);
                if(pos == undefined) {
                    this.map.active_entity.setRemoteTarget(enemy);
                }
                else {
                    this.map.active_entity.setDestination(this.map, pos[0], pos[1], enemy);
                }
                this.state = ENTITY_ACT;
            }
            else {
                this.map.updateMapShow(mouse_pos);
                if(mouse_down) {
                    this.mouseClick(mouse_pos);
                }
            }
        }
        else {
            this.map.updateMapShow(mouse_pos);
            this.group1.update(current_time, ctx, this);
            this.group2.update(current_time, ctx, this);
            if(this.map.active_entity.state == IDLE) {
                this.state = IDLE;
            }
        }
        
        let remove_list = [];
        for(let i in this.hurt_group) {
            let hurt = this.hurt_group[i];
            hurt.update();
            if(hurt.shouldRemove()) {
                remove_list.push(hurt);
            }
        }
        for(let i in remove_list) {
            let hurt = remove_list[i];
            for(let j in this.hurt_group) {
                if(hurt === this.hurt_group[j]) {
                    this.hurt_group.splice(j, 1);
                    break;
                }
            }
        }
        
        this.checkGameState();
        this.draw(ctx);
    }
    
    getActiveEntity() {
        let entity1 = this.group1.getActiveEntity();
        let entity2 = this.group2.getActiveEntity();
        let result = undefined;
        
        if(entity1 != undefined && entity2 != undefined ) {
            if(entity1.attr.speed >= entity2.attr.speed) {
                result = [entity1, this.group1];
            }
            else {
                result = [entity2, this.group2];
            }    
        }
        else if(entity1 != undefined) {
            result = [entity1, this.group1];
        }
        else if(entity2 != undefined) {
            result = [entity2, this.group2];
        }
        return result;
    }
    
    mouseClick(mouse_pos) {
        if(this.map.checkMouseClick(mouse_pos.x, mouse_pos.y)) {
            this.map.resetBackGround();
            this.state = ENTITY_ACT;
        }
    }
    
    addHurtShow(hurt) {
        this.hurt_group.push(hurt);
    }
    
    checkGameState() {
        if(this.group1.isEmpty() || this.group2.isEmpty()) {
            this.done = true;
            if(this.group1.isEmpty()) {
                this.next = LEVEL_WIN;
            }
            else {
                this.next = LEVEL_LOSE;
            }
        }
    }
    
    draw(ctx) {
       this.map.drawBackground(ctx);
       this.group1.draw(ctx);
       this.group2.draw(ctx);
       
       this.hurt_group.forEach(function(hurt) {
           hurt.draw(ctx);
       });
    }
}

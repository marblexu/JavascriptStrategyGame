
class FireBall{
    constructor(x, y, enemy, hurt) {
        this.loadImage();
        this.pos = {'x':x, 'y':y};
        this.enemy = enemy;
        this.hurt = hurt;
        this.done = false;
        this.calVelocity();
    }
    
    loadImage() {
        let rect = [0, 0, 14, 14];
        this.img = new ImageWrapper(FIREBALL, rect);
    }
    
    getRect() {
        return [this.pos.x - 7, this.pos.y - 7, 14, 14];
    }
    
    calVelocity() {
        let dis_x = this.enemy.pos.x - this.pos.x;
        let dis_y = this.enemy.pos.y - this.pos.y;
        this.x_vel = dis_x / 50;
        this.y_vel = dis_y / 50;
    }
    
    update(level) {
        this.pos.x += this.x_vel;
        this.pos.y += this.y_vel;
        let distance = Math.abs(this.pos.x - this.enemy.pos.x) + Math.abs(this.pos.y - this.enemy.pos.y);
        let [, , enemy_width, _] = this.enemy.getRect();
        if(distance < enemy_width / 2) {
            this.enemy.setHurt(this.hurt, level);
            this.done = true;
        }
    }
    
    draw(ctx) {
        this.img.draw(ctx, this.getRect());
    }
}

class EntityAttr{
    constructor(data) {
        this.max_health = data[ATTR_HEALTH];
        this.distance = data[ATTR_DISTANCE];
        this.damage = data[ATTR_DAMAGE];
        this.attack = data[ATTR_ATTACK];
        this.defense = data[ATTR_DEFENSE];
        this.speed = data[ATTR_SPEED];
        if(data[ATTR_REMOTE] == 0) {
            this.remote = false;
        }
        else {
            this.remote = true;
        }
    }
    
    getHurt(enemy_attr, damage_half=false) {
        let offset = 0;
        if(this.attack > enemy_attr.defense) {
            offset = (this.attack - enemy_attr.defense) * 0.05;
        }
        else if(this.attack < enemy_attr.defense) {
            offset = (this.attack - enemy_attr.defense) * 0.025;
        }
        
        let damage = this.damage;
        if(damage_half) {
            damage = damage / 2;
        }
        let hurt = parseInt(damage * (1 + offset));
        
        if(hurt > this.damage * 4) {
            hurt = this.damage * 4;
        }
        else if(hurt < this.damage / 4) {
            hurt = parseInt(this.damage / 4);
        }
        return hurt;
    }
}

class Entity{
    constructor(group, name, map_x, map_y, data) {
        this.group = group;
        this.group_id = group.group_id;
        this.map_x = map_x;
        this.map_y = map_y;
        this.imgs = [];
        this.img_index = 0;
        this.loadImages(name);
        this.img = this.imgs[this.img_index];
        this.pos = this.getPos(map_x, map_y);
        
        this.attr = new EntityAttr(data);
        this.health = this.attr.max_health;
        this.enemy = undefined;
        
        this.state = IDLE;
        this.animate_timer = 0;
        this.attack_timer = 0;
        this.current_time = 0;
        this.move_speed = 2;
        this.walk_path = undefined;
        
        this.remote_attack = false;
        this.weapon = undefined;
    }
    
    loadImages(name) {
        let rect_list = [[64, 0, 32, 32], [96, 0, 32, 32]];
        for(let i in rect_list) {
            this.imgs.push(new ImageWrapper(name, rect_list[i]));
        }
    }
    
    getMapIndex() {
        return [this.map_x, this.map_y];
    }
    
    getRect() {
        return [this.pos.x - parseInt(this.pos.width / 2), this.pos.y - parseInt(this.pos.height / 2), 
                this.pos.width, this.pos.height];
    }
    
    getPos(map_x, map_y) {
        return {x:map_x * REC_SIZE + REC_SIZE/2, y:map_y * REC_SIZE + REC_SIZE/2 + 2,
                width:43, height:43};
    }
    
    setDestination(MAP, map_x, map_y, enemy=undefined) {
        let path = getPath(MAP, this.map_x, this.map_y, map_x, map_y);
        if(path != undefined) {
            this.walk_path = path;
            this.dest = this.getPos(map_x, map_y);
            this.next = this.pos;
            this.enemy = enemy;
            this.state = WALK;
        }
        else if(enemy != undefined) {
            this.enemy = enemy;
            this.state = ATTACK;
        }
    }
    
    setRemoteTarget(enemy) {
        this.enemy = enemy;
        this.remote_attack = true;
        this.state = ATTACK;
    }
    
    canRemoteAttack(MAP) {
        if(this.attr.remote) {
            let dir_list = getAttackPositions(this.map_x, this.map_y);
            for(let i in dir_list) {
                let [offset_x, offset_y] = dir_list[i];
                let tmp_x = this.map_x + offset_x;
                let tmp_y = this.map_y + offset_y;
                if(MAP.isValid(tmp_x, tmp_y)) {
                    let entity = MAP.entity_map[tmp_y][tmp_x];
                    if(entity != undefined && entity.group_id != this.group_id) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }
    
    getNextPosition() {
        if(this.walk_path.length > 0) {
            return this.walk_path.pop();    
        }
        return undefined;
    }
    
    walkToDestination() {
        if(this.pos.x == this.next.x && this.pos.y == this.next.y) {
            let point = this.getNextPosition();
            if(point == undefined) {
                this.state = IDLE;
            } 
            else {
                this.next = this.getPos(point.x, point.y);
            }
        }
        
        if(this.pos.x != this.next.x) {
            if(this.pos.x < this.next.x) {
                this.pos.x += this.move_speed;
                if(this.pos.x > this.next.x) {
                    this.pos.x = this.next.x;
                }
            }
            else {
                this.pos.x -= this.move_speed;
                if(this.pos.x < this.next.x) {
                    this.pos.x = this.next.x;
                }
            }
        }
        if(this.pos.y != this.next.y) {
            if(this.pos.y < this.next.y) {
                this.pos.y += this.move_speed;
                if(this.pos.y > this.next.y) {
                    this.pos.y = this.next.y;
                }
            }
            else {
                this.pos.y -= this.move_speed;
                if(this.pos.y < this.next.y) {
                    this.pos.y = this.next.y;
                }
            }
        }
    }
    
    attack(enemy, level) {
        let damage_half = false;
        if(this.attr.remote) {
            damage_half = true;
        }        
        let hurt = this.attr.getHurt(enemy.attr, damage_half);
        enemy.setHurt(hurt, level);
    }
    
    setHurt(hurt, level) {
        this.health -= hurt;
        level.addHurtShow(new HurtShow(this.pos.x, this.pos.y, hurt));
        
        if(this.health <= 0) {
            level.map.setEntity(this.map_x, this.map_y, undefined);
            this.group.removeEntity(this);
        }
    }
    
    shoot(enemy) {
        let hurt = this.attr.getHurt(enemy.attr);
        this.weapon = new FireBall(this.pos.x, this.pos.y - parseInt(this.pos.width / 2 + 5),
                                   this.enemy, hurt);
    }
    
    update(current_time, ctx, level) {
        let MAP = level.map;
        this.current_time = current_time;
        if(this.state == WALK) {
            if((this.current_time - this.animate_timer) > 200) {
                if(this.img_index == 0) {
                    this.img_index = 1;
                }
                else {
                    this.img_index = 0;
                }
                this.animate_timer =  this.current_time;
            }
            
            if(this.pos.x != this.dest.x || this.pos.y != this.dest.y) {
                this.walkToDestination();
            }
            else {
                MAP.setEntity(this.map_x, this.map_y, undefined);
                let [map_x, map_y] = MAP.getMapIndex(this.dest.x, this.dest.y);
                this.map_x = map_x;
                this.map_y = map_y;
                MAP.setEntity(this.map_x, this.map_y, this);
                this.walk_path = undefined;
                if(this.enemy == undefined) {
                    this.state = IDLE;
                }
                else {
                    this.state = ATTACK;
                }
            }
        }
        else if(this.state == ATTACK) {
            if(this.attr.remote && this.remote_attack) {
                if(this.weapon == undefined) {
                    this.shoot(this.enemy);
                }
                else {
                    this.weapon.update(level);
                    if(this.weapon.done) {
                        this.weapon = undefined;
                        this.enemy = undefined;
                        this.remote_attack = false;
                        this.state = IDLE;
                    }
                }
            }
            else {
                if(this.attack_timer == 0) {
                    this.attack(this.enemy, level);
                    this.enemy = undefined;
                    this.attack_timer = this.current_time;
                }
                else if((this.current_time - this.attack_timer) > 500) {
                    this.attack_timer = 0;
                    this.state = IDLE;
                }
            }
        }
        if(this.state != WALK) {
            this.img_index = 0;
        }
    }
    
    draw(ctx) {
        this.img = this.imgs[this.img_index];
        this.img.draw(ctx, this.getRect());
        if(this.health > 0) {
            let [x, y, entity_width, _] = this.getRect();
            let width = parseInt(entity_width * this.health / this.attr.max_health);
            let height = 5;
            drawRect(ctx, 'red', x, y - height - 1, width, height);
        }
        if(this.weapon != undefined) {
            this.weapon.draw(ctx);
        }
    } 
}

class EntityGroup{
    constructor(group_id) {
        this.group = [];
        this.group_id = group_id;
        this.entity_index = 0;
    }
    
    createEntity(entity_list, map) {
        for(let i in entity_list) {
            let {name, map_x, map_y} = entity_list[i];
            
            let entity = new Entity(this, name, map_x, map_y, ENTITY_ATTR[name]);
            this.group.push(entity);
            map.setEntity(map_x, map_y, entity);
        }
        this.group.sort(function(a, b){
            return b.attr.speed - a.attr.speed;
        });
    }
    
    removeEntity(entity) {
        for(let index in this.group) {
            if(this.group[index] === entity) {
                if(this.entity_index > index) {
                    this.entity_index -= 1;
                }
                this.group.splice(index, 1);
                break;
            }
        }
    }
    
    isEmpty() {
        if(this.group.length == 0) {
            return true;
        }
        return false;
    }
    
    nextTurn() {
        this.entity_index = 0;
    }
    
    getActiveEntity() {
        if(this.entity_index >= this.group.length) {
            return undefined;
        }
        else {
            return this.group[this.entity_index];
        }
    }
    
    consumeEntity() {
        this.entity_index += 1;
    }
    
    update(current_time, ctx, level) {
        this.group.forEach(function(entity) {
            entity.update(current_time, ctx, level);
        });
    }
    
    draw(ctx) {
        this.group.forEach(function(entity) {
            entity.draw(ctx);
        });
    }
}

class HurtShow{
    constructor(x, y, hurt) {
        this.y = y - 20;
        this.font = 'bold 20px Arial';
        this.str = hurt.toString();
        this.pos = {'x':x-10, 'y':this.y};
        this.y_vel = -1;
        this.distance = 40;
    }
    
    shouldRemove() {
        if((this.y - this.pos.y) > this.distance) {
            return true;
        }
        return false;
    }
    
    update() {
        this.pos.y += this.y_vel;
    }
    
    draw(ctx) {
        drawText(ctx, 'red', this.str, this.font, this.pos.x, this.pos.y);
    }
}

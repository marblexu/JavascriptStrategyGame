const START_BUTTON_NAME = 'Start Game';

class Button{
    constructor(color, x, y, width, height, str, str_color) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.str = str;
        this.str_color = str_color;
        this.font = 'bold 36px Arial';
    }
    
    click(x, y) {
        if(x >= this.x && x <= (this.x + this.width) &&
           y >= this.y && y <= (this.y + this.height)) {
               return true;
        }
        return false;
    }
    
    draw(ctx) {
        drawRect(ctx, this.color, this.x, this.y, this.width, this.height);
        drawText(ctx, this.str_color, this.str, this.font, this.x + 5, this.y + 36);
    }
}

class MainMenu extends State{
    constructor() {
        super();
    }
    
    startup(current_time, game_info) {
        this.game_info = game_info;
        this.name = 'My Strategy Game';
        this.font = 'bold 40px Arial';
        this.setupButtons();
    }
    
    setupButtons() {
        this.buttons = [];
        this.buttons.push(new Button('#9ED99D', 150, 250, 200, 50, START_BUTTON_NAME, '#1AAD19'));
    }
    
    update(ctx, current_time, mouse_pos, mouse_down) {
        if(mouse_down) {
            let x = mouse_pos.x, y = mouse_pos.y;
            for(let i in this.buttons) {
                let b = this.buttons[i];
                if(b.click(x, y)) {
                    if(b.str == START_BUTTON_NAME) {
                        this.done = true;
                        this.next = LEVEL_START;
                    }
                }
            }
        }
        drawRect(ctx, LIGHTYELLOW, 0, 0, MAP_WIDTH, MAP_HEIGHT);
        drawText(ctx, SKYBLUE, this.name, this.font, 90, 100);
        for(let i in this.buttons) {
            this.buttons[i].draw(ctx);
        }
    }
}

class Screen extends State{
    constructor(str=undefined) {
        super();
        this.end_timer = 2000;
        this.str = str;
    }

    startup(current_time, game_info) {
        this.start_time = current_time;
        this.game_info = game_info;
        this.name = 'Level - ' + this.game_info[LEVEL_NUM];
        this.name_font = 'bold 40px Arial';
        
        if(this.str != undefined) {
            this.str_color = 'black';
            this.str_font = 'bold 36px Arial';
        }
    }

    update(ctx, current_time, mouse_pos, mouse_down) {
        if((current_time - this.start_time) < this.end_timer) {
            drawRect(ctx, LIGHTYELLOW, 0, 0, MAP_WIDTH, MAP_HEIGHT);
            drawText(ctx, SKYBLUE, this.name, this.name_font, 170, 100);
            if(this.str != undefined) {
                drawText(ctx, this.str_color, this.str, this.str_font, 180, 250);
            }
        }
        else {
            this.done = true;
        }
    }
}

class LevelStartScreen extends Screen{
    constructor(str) {
        super(str);
    }

    startup(current_time, game_info) {
        super.startup(current_time, game_info);
        this.next = LEVEL;
    }
}

class LevelLoseScreen extends Screen{
    constructor(str) {
        super(str);
    }

    startup(current_time, game_info) {
        super.startup(current_time, game_info);
        this.next = MAIN_MENU;
    }
}

class LevelWinScreen extends Screen{
    constructor(str) {
        super(str);
    }

    startup(current_time, game_info){
        super.startup(current_time, game_info);
        this.game_info[LEVEL_NUM] += 1;
        if(this.game_info[LEVEL_NUM] <= MAX_LEVEL_NUM) {
            this.next = LEVEL_START;
        }
        else {
            this.game_info[LEVEL_NUM] = START_LEVEL_NUM;
            this.next = MAIN_MENU;
        }
    }
}

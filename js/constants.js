const GRID_X_LEN = 10;
const GRID_Y_LEN = 12;
const REC_SIZE = 50;
const MAP_WIDTH = GRID_X_LEN * REC_SIZE;
const MAP_HEIGHT = GRID_Y_LEN * REC_SIZE;

// COLOR LIST
const LIGHTYELLOW = '#F7EED6';
const SKYBLUE = '#2791FB';
const NAVYBLUE = '#3C3C64';
const GOLD = '#FFD700';

// MAP GRID TYPE
const MAP_EMPTY = 0;
const MAP_STONE = 1;
const MAP_GRASS = 2;

// MAP BACKGROUND STATE
const BG_EMPTY = 0;
const BG_ACTIVE = 1;
const BG_RANGE = 2;
const BG_SELECT = 3;
const BG_ATTACK = 4;

// STATES FOR ENTIRE GAME
const MAIN_MENU = 'main menu';
const LEVEL_START = 'level start';
const LEVEL_LOSE = 'level lose';
const LEVEL_WIN = 'level win';
const LEVEL = 'level';
const EXIT = 'exit';

// GAME INFO
const LEVEL_NUM = 'level_num';
const START_LEVEL_NUM = 1;
const MAX_LEVEL_NUM = 2;

const LEVEL_LOSE_INFO = 'You Lose';
const LEVEL_WIN_INFO = 'You Win';

// LEVEL DATA CONFIG
const MAP_GRID = 'mapgrid';
const GROUP1 = 'group1';
const GROUP2 = 'group2';

// IMAGE NAME
const GRID_IMAGE = 'tile.png';
const DEVIL = 'devil';
const FOOTMAN = 'footman';
const MAGICIAN = 'magician';
const EVILWIZARD = 'evilwizard';
const FIREBALL = 'fireball';

var IMAGE_SRC_MAP = new Map([
    [GRID_IMAGE, 'images/tile.png'],
    [DEVIL,      'images/devil.png'],
    [FOOTMAN,    'images/footman.png'],
    [MAGICIAN,   'images/magician.png'],
    [EVILWIZARD, 'images/evilwizard.png'],
    [FIREBALL,   'images/fireball.png']
]);

// LEVEL STATES
const IDLE = 'idle';
const SELECT = 'select';
const ENTITY_ACT = 'entity act';

// ENTITY STATES
const WALK = 'walk';
const ATTACK = 'attack';

// ENTITY ATTRIBUTES
const ATTR_HEALTH = 'health';
const ATTR_DISTANCE = 'distance';
const ATTR_DAMAGE = 'damage';
const ATTR_ATTACK = 'attack';
const ATTR_DEFENSE = 'defense';
const ATTR_SPEED = 'speed';
const ATTR_REMOTE = 'remote';

var level_1 = {
    'mapgrid':[{x:3, y:5, type:1}, {x:5, y:5, type:1}, 
               {x:4, y:4, type:2}, {x:4, y:6, type:2}],
    'group1':[{name:'devil', map_x:1, map_y:1},
              {name:'devil', map_x:4, map_y:1},
              {name:'devil', map_x:7, map_y:1}],
    'group2':[{name:'footman', map_x:2, map_y:10},
              {name:'magician', map_x:4, map_y:10},
              {name:'footman', map_x:6, map_y:10}]
};

var level_2 = {
    'mapgrid':[{x:2, y:5, type:1}, {x:6, y:5, type:1}, 
               {x:4, y:4, type:1}, {x:4, y:6, type:1}],
    'group1':[{name:'devil', map_x:1, map_y:1},
              {name:'evilwizard', map_x:4, map_y:1},
              {name:'devil', map_x:7, map_y:1}],
    'group2':[{name:'footman', map_x:2, map_y:10},
              {name:'magician', map_x:4, map_y:10},
              {name:'footman', map_x:6, map_y:10}]
};

var LEVEL_MAP = new Map();
LEVEL_MAP.set('level_1', level_1);
LEVEL_MAP.set('level_2', level_2);

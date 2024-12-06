// board dimension constants [ mines, width, height ]
var BEGINNER = [10, 9, 9];
var INTERMEDIATE = [40, 16, 16];
var EXPERT = [99, 30, 16];
var CUSTOM_MIN = [10, 9, 9];
var CUSTOM_MAX = [667, 30, 24];

var mines, width, height, game, timer;

$("#difficulty").on("change", function() {
  if ( $(this).val() == "custom" ) {
    $(".custom_input").removeClass("hidden")
  } else {
    $(".custom_input").addClass("hidden")
  };
});

$("#new").on("click", function() {
  var difficulty = $("#difficulty").val();
  if ( difficulty == "beginner" ) {
    mines = BEGINNER[0];
    width = BEGINNER[1];
    height = BEGINNER[2];
  } else if ( difficulty == "intermediate" ) {
    mines = INTERMEDIATE[0];
    width = INTERMEDIATE[1];
    height = INTERMEDIATE[2];
  } else if ( difficulty == "expert" ) {
    mines = EXPERT[0];
    width = EXPERT[1];
    height = EXPERT[2];
  } else {
    if ( $("#mines").val() < CUSTOM_MIN[0] ) { $("#mines").val( CUSTOM_MIN[0] ) }
    if ( $("#width").val() > CUSTOM_MAX[1] ) { $("#width").val( CUSTOM_MAX[1] ) }
    if ( $("#width").val() < CUSTOM_MIN[1] ) { $("#width").val( CUSTOM_MIN[1] ) }
    if ( $("#height").val() > CUSTOM_MAX[2] ) { $("#height").val( CUSTOM_MAX[2] ) }
    if ( $("#height").val() < CUSTOM_MIN[2] ) { $("#height").val( CUSTOM_MIN[2] ) }
    if ( $("#mines").val() > ($("#width").val()-1)*($("#height").val()-1) ) {
      $("#mines").val( ($("#width").val()-1)*($("#height").val()-1) );
    }; 
    mines = $("#mines").val();
    width = $("#width").val();
    height = $("#height").val();
  };
  stop_timer();
  $("#timer").html(0);
  game = "new";
  $("#board").removeClass("disabled");
  generate_board();
});

function generate_board() {
  $("#board").empty();
  var board_string = '<table>';
  for ( i=0; i<height; i++ ) {
    board_string += '<tr>';
      for ( j=0; j<width; j++ ) {
        board_string += '<td data-position-x="'+j+'" data-position-y="'+i+'" data-mine="false" class="tile unclicked">';
        board_string += '</td>';
      }
    board_string += '</tr>';
  }
  board_string += '</table>';
  $("#board").append(board_string);
  $("#counter").html(mines);
};

//mouse variables
var left = false, right = false;

$("#board").on("mousedown", ".tile", function(event) {
  // console.log($(this).data("position-x")+","+$(this).data("position-y"));
  if ( event.which === 1) { left = true }; 
  if ( event.which === 3) { 
    if ( !(left) ) { flag(this); }
    right = true;
  };
});

$("#board").on("mouseup", ".tile", function(event) {
  // console.log($(this).data("position-x")+","+$(this).data("position-y"));
  if ( event.which === 2) { surrounding(this); } 
  if ( event.which === 1) {
    if ( left && right) { surrounding(this); }
    else { uncover(this); };
    left = false;
  } 
  if ( event.which === 3) { 
    if ( left && right) { surrounding(this); };
    right = false;
  }
});

function get_tile(x,y) { return $(".tile[data-position-x='"+x+"'][data-position-y='"+y+"']") };

function get_neighbors(tile) {  
  var x = $(tile).data("position-x");
  var y = $(tile).data("position-y");
  var neighbors = [];
  if ( ( x != 0 ) && ( y != 0 ) ) { neighbors.push([x-1,y-1]) };
  if ( ( x != 0 ) && ( y != height-1 ) ) { neighbors.push([x-1,y+1]) };
  if ( ( x != 0 ) ) { neighbors.push([x-1,y]) };
  if ( ( x != width-1 ) && ( y != 0 ) ) { neighbors.push([x+1,y-1]) };
  if ( ( x != width-1 ) && ( y != height-1 ) ) { neighbors.push([x+1,y+1]) };
  if ( ( x != width-1 ) ) { neighbors.push([x+1,y]) };
  if ( ( y != 0 ) ) { neighbors.push([x,y-1]) };
  if ( ( y != height-1 ) ) { neighbors.push([x,y+1]) };
  return neighbors;
};

function neighboring_mines(neighbors) {
  var mine_count =0;
  $.each(neighbors, function(index,value) { if ( get_tile(value[0],value[1]).data("mine") == "true" ) { mine_count++; }; });
  return mine_count;
}

function neighboring_flags(neighbors) {
  var flag_count =0;
  $.each(neighbors, function(index,value) { if ( get_tile(value[0],value[1]).hasClass("flagged") ) { flag_count++; }; });
  return flag_count;
}

function uncover(tile) {
  if ( game == "over" ) { return }
  if ( $(tile).hasClass("flagged") ) { return }
  if ( !($(tile).hasClass("unclicked")) ) { return }
  if (game == "new") {
    populate_board([$(tile).data("position-x") , $(tile).data("position-y")]);
    game = "running";
    start_timer();
  }
  $(tile).removeClass("unclicked");
  $(tile).removeClass("marker");
  if ($(tile).hasClass("question")) { $(tile).html(""); };
  $(tile).removeClass("question");
  if ( $(tile).data("mine") == "true" ) { end_game(); }
  else {
    var neighbors = get_neighbors(tile);
    var mine_count = neighboring_mines(neighbors);
    if ( mine_count > 0 ) { $(tile).html( mine_count ); }
    else { $.each(neighbors, function(index,value) { uncover(get_tile(value[0],value[1])); }); };
    check_win();
  };
};

function surrounding(tile) {
  if ( game == "over" ) { return }
  if ( $(tile).hasClass("unclicked") ) { return }
  var neighbors = get_neighbors(tile);
  var mine_count = neighboring_mines(neighbors);
  var flag_count = neighboring_flags(neighbors);
  if ( mine_count != flag_count ) { return }
  $.each(neighbors, function(index,value) {
    var tile = get_tile(value[0],value[1]);
    if ( !(tile.hasClass("flagged")) ) { uncover(tile); };
  });
};

function flag(tile) {
  if ( game == "over" ) { return }
  if ( !($(tile).hasClass("unclicked")) ) { return }
  if ( $(tile).hasClass("flagged") ) {
    $(tile).removeClass("flagged")
    $(tile).addClass("question")
    $(tile).html("?")
    $("#counter").html( parseInt($("#counter").html())+1 );
  } else if ( $(tile).hasClass("question") ) {
    $(tile).removeClass("question")
    $(tile).html("")
  } else {
    $(tile).addClass("flagged")
    $(tile).html("!")
    $("#counter").html( parseInt($("#counter").html())-1 );
  };
};

function populate_board(first_tile) { 
  for( i=0; i<mines; i++ ) {
    var random_tile = $(".tile").eq( Math.floor(Math.random()*(width*height-i)) );
    if ( ( random_tile.data("position-x") == first_tile[0] ) && ( random_tile.data("position-y") == first_tile[1] )  ) { i--; }
    else if ( random_tile.data("mine") == "true" ) { i--; }
    else { random_tile.data("mine", "true"); };
  };
};

function start_timer() {
  timer = window.setInterval( function() { 
    $("#timer").html( parseInt( $("#timer").html() )+1 ); 
    if ( parseInt( $("#timer").html() ) === 999 ) { stop_timer(); };
  } , 1000);
};
function stop_timer() { 
  window.clearInterval(timer); 
};

function check_win() {
  if ( game != "running" ) { return };
  if ( $(".unclicked").length > mines ) { return; };
  end_game();    
  alert("You win!");
};

function end_game() {
  if ( game != "running" ) { return };
  $(".tile").each( function() {
    if ( $(this).data("mine") == "true" ) { 
      $(this).addClass("mine");
      $(this).append("X");
    }
  });
  stop_timer();
  game = "over";
  $("#board").addClass("disabled");
};

$("#board").on("mouseover", ".tile", function() { if ( $(this).hasClass("unclicked") ) { $(this).addClass('marker'); } })
$("#board").on("mouseout", ".tile", function() { $(this).removeClass('marker'); })

$( window ).load(function() {
 $("#new").trigger("click");
});
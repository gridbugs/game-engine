
function rand() {return Math.random()-0.5};
function randp() {return Math.random()};

const N_RANDS = 100;
var rand_arr = new Array(N_RANDS);
var randp_arr = new Array(N_RANDS);

function rand_regenerate() {
    for (var i = 0;i<N_RANDS;i++) {
        rand_arr[i] = rand();
        randp_arr[i] = randp();
    }
}

function rand_sine_sum(x, freq){
    var ret = 0;
    for (var i = 0;i<N_RANDS;i++) {
        ret += 0.5*rand_arr[i]*Math.sin(x*randp_arr[i]*freq);
    }
    return ret;
    return Math.sin(x) * ret;
}

const init = require('./init');
const nvtree = require("ndtreejs").ndcls;
const nao = require("not-and-or")
const cond_util = require('./cond')
const cmmn = require('./cmmn')




/////

function instance_to_history(instance) {
    let history = JSON.stringify(instance)
    if(history.state === 'rejected') {
        history.exception = cmmn.copy_error(instance)
    } else {
    }
    return(history)
}


////Cycler

const CYCLER_SYM_DICT = {
    sym_ready:Symbol('cycler_ready'),
    sym_exec:Symbol('cycler_exec'),
    sym_reset:Symbol('cycler_reset')
}

const CYCLER_ACTION_DICT = {
    aggregator:'aggregator',
    round_timeout:'round_timeout'
}

const CYCLER_ERROR_DICT = {
    round_timeout:new Error('round_timeout')
}

function release_round_timeouter(instance) {
    if(instance.round_timeouter === null) {
    } else {
        clearTimeout(instance.round_timeouter);
        instance.round_timeouter = null;
    }
}


function cycler_stop_others(instance) {
    //stop controller
    instance.controller[CONTROLLER_SYM_DICT.sym_stop]();
    //stop tasks
    instance.controller.$sdfs.slice(1).forEach(
        r => r[TASK_SYM_DICT.sym_stop]();
    )
    //stop aggregator
    instance.aggregator[AGGREGATOR_SYM_DICT.sym_stop]();
    //stop 之后 不会再导致aggregator 触发cycler
}


function cycler_push_history(instance,action) {
    if(action === CYCLER_ACTION_DICT.aggregator) {
        instance.hisroty.push({
            round:instance.curr_round,
            data:instance_to_history(instance.aggregator),
            extra_err:undefined,
        })    
    } else if(action === CYCLER_ACTION_DICT.round_timeout) {
        instance.hisroty.push({
            round:instance.curr_round,
            data:instance_to_history(instance.aggregator),
            extra_err:CYCLER_ERROR_DICT.round_timeout
        })        
    } else {
    }
}


function cycler_launch_new_round(instance,action) {
    if(instance.curr_round + 1 < instance.total_round) {
        //添加历史记录
        cycler_push_history(instance,action); 
        //更新round
        instance.curr_round = instance.curr_round + 1;        
        //重新启动新一轮任务
        instance.controller[CONTROLLER_SYM_DICT.reset]();
        instance.controller[CONTROLLER_SYM_DICT.launch]();
    } else {
        //循环结束触发p
    }
}

function set_new_round_timeouter(instance) {
    release_round_timeouter(instance);
    instance.curr_round_tmout = instance.orig_round_tmout;
    instance.round_timeouter = setTimeout(
        function() {
            cycler_stop_others(instance);
            cycler_launch_new_round(instance,CYCLER_ACTION_DICT.round_timeout);
        },
        instance.curr_round_tmout
    )
}


class Cycler extends nvtree.Node {
}


module.exports = {
    Controller,
    Task,
    Aggregator,
    Cycler,
}



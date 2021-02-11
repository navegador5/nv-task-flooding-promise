const cmmn = require('./cmmn');
const shared = require('./shared');
const task = require('./task');
const condutil = require('./cond');

function construct_aggregator(instance,task_func,task_params,cond_func_or_str,cond_func_params) {
    cond_func_or_str = (cond_func_or_str === undefined)?'aggregator_all':cond_func_or_str;
    task.construct_task(instance,undefined,task_func,task_params,cond_func_or_str,cond_func_params);
    instance.tag = "@aggregator@",
    instance.cycler = undefined;
    instance.inlets = [];
}


function ready_aggregator(instance,cycler) {
    instance.state = 'ready';
    instance.cycler = cycler;
    //链接leaf_task的动作在 ready_task中完成
}


function reset_aggregator(instance) {
    task.reset_task(instance);
}

function stop_aggregator(instance) {
    //不清除数据
    task.stop_task(instance);
}


function aggregator_finally_factory(instance) {
    let aggregator_finally = f() {
        //触发cycler
        let cycler = instance.cycler;
        cycler[shared.CYCLER_SYM_DICT.sym_exec](shared.CYCLER_ACTION_DICT.aggregator);
    }
    return(aggregator_finally)
}

function get_early_reject(cond_func_or_str) {
    if(cmmn.is_function(cond_func_or_str)) {
        early_reject = {exist:false,cond_func:undefined}
    } else {
        early_reject = condutil.get_real_early_reject_cond_func(cond_func_or_str)
    }
    return(early_reject)
}


function exec_aggregator(instance) {
    let early_reject = get_early_reject(instance.cond_func_or_str)
    if(early_reject.exist) {
        let early_reject_cond_func = early_reject.cond_func;
        let erj = early_reject_cond_func(instance,...instance.cond_func_params);
        let cond = (erj.exception !== undefined)
        if(cond) {
            instance.state = "rejected";
            instance.exception = erj.exception;
            instance.extra_err_msg = erj.extra_err_msg;
            aggregator_finally_factory(instance)(); 
        } else {}
    } else {
       let aggregator_finally = aggregator_finally_factory(instance);
       shared.exec_engine(instance,aggregator_finally);
    }
}


class Aggregator extends nvtree.Node {
    constructor(...params) {super();construct_aggregator(this);}
    [shared.AGGREGATOR_SYM_DICT.sym_ready](cycler) {ready_aggregator(this,cycler)};
    [shared.AGGREGATOR_SYM_DICT.sym_exec]() {exec_aggregator(this)};
    [shared.AGGREGATOR_SYM_DICT.sym_reset]() {reset_aggregator(this)};
    [shared.AGGREGATOR_SYM_DICT.sym_stop]() {stop_aggregator(this)};
}


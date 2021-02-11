const cmmn = require('./cmmn');
const Dtb = require("nvdtb").Cudtb;
const cond_util = require('./cond');


function creat_reftbl() {
    let dtb = new Dtb(4,'state','anti_state','key','anti_key')
    dtb.state = ['undefined','ready','pending','resolved','rejected','stopped']
    dtb.anti_state = ['undefined','ready','pending','rejeted','resolved','stopped']
    dtb.key = ['undefined','ready','pending','rslt','exception','stopped']
    dtb.anti_key = ['undefined','ready','pending','exception','rslt','stopped']
    return(dtb)
}


const REFTBL = creat_reftbl();


function state_to_anti_state(state) {return(REFTBL.cvc('state',state,'anti_state'))}
function state_to_key(state) {return(REFTBL.cvc('state',state,'key'))}
function state_to_anti_key(state) {return(REFTBL.cvc('state',state,'anti_key'))}
function key_to_state(key){return(REFTBL.cvc('key',key,'state'))}
function key_to_anti_state(key){return(REFTBL.cvc('key',key,'anti_state'))}
function key_to_anti_key(key){return(REFTBL.cvc('key',key,'anti_key'))}


const RESERVED_TAGS = ["@controller@","@agregator@","@cycler@"]

function hide_props(instance,props=HIDDEN_TASK_PROPS) {
    props.forEach(
        prop=> Object.defineProperty(instance,prop,{enumerable:false,configurable:false})
    )
}

function set_condition(instance) {
    instance.condition = cmmn.is_function(instance.cond_func_or_str)? instance.cond_func_or_str.toString(): instance.cond_func_or_str;
    instance.condition = instance.condition + ((instance.cond_func_arguments.length>0)?'\n arguments: '+instance.cond_func_arguments.toString():'')
}


function is_execable(instance) {
    let cond0 = (this.state === 'ready');
    let cond1 = (this.aggregator.state === 'ready');
    return(cond0 && cond1)
}

function is_savable(instance,p) {
    let cond0 = (this.state === 'pending'); //必须是进行中的,才可以被 save-resolved or save-rejected
    let cond1 = (instance.promise === p);
    return(cond0)
}


function exec_engine(instance,finally_func) {
    let cond = is_execable(instance);
    if(cond) {
        //是否可触发 ,可触发的条件是当前任务完成了初始化
        //并且最终任务 处于完成初始化的状态
        let cond_func = cond_util.get_real_cond_func(instance.cond_func_or_str);
        let cond = cond_func(instance,...instance.cond_func_arguments);
        if(cond) {
            //是否满足当前执行条件
            instance.state = "pending"
            instance.started_at = (new Date()).getTime();
            ////如果不支持early-reject ,某些提前reject的逻辑需要在task_func中实现
            let p = instance.task_func(instance,...instance.task_arguments);
            instance.promise = p;
            p.then(
               r=> {
                   if(is_savable(instance,p)){
                       instance.rslt = r
                       instance.state = "resolved"
                   }
               }
            ).catch(
               err=>{
                   if(is_savable(instance,p)){
                       instance.exception = err
                       instance.state = "rejected"
                   }
               }
            ).finally(
                function() {
                    if(is_savable(instance,p)) {
                        instance.ended_at = (new Date()).getTime();
                        instance.costed_time = instance.ended_at - instance.started_at;
                        finally_func(instance);
                    } else {
                    }
                }
            )
        } else {
            //不满足的话 空触发
            //
        }
    } else {
        //最终任务已经 是pending,resolved,rejected之一
        //什么也不做
    }
}


const TASK_SYM_DICT = {
    sym_ready:Symbol('task_ready'),
    sym_exec:Symbol('task_exec'),
    sym_reset:Symbol('task_reset'),
    sym_stop:Symbol('task_stop'),
}


const AGGREGATOR_SYM_DICT = {
    sym_ready:Symbol('aggregator_ready'),
    sym_exec:Symbol('aggregator_exec'),
    sym_reset:Symbol('aggregator_reset'),
    sym_stop:Symbol('aggregator_stop'),
}



module.exports = {
    REFTBL,
    state_to_anti_state,
    state_to_key,
    state_to_anti_key,
    key_to_state,
    key_to_anti_state,
    key_to_anti_key,
    ////
    RESERVED_TAGS,
    ////
    hide_props,
    set_condition,
    ////
    is_execable,
    is_savable,
    exec_engine,
    TASK_SYM_DICT,
    AGGREGATOR_SYM_DICT,
}

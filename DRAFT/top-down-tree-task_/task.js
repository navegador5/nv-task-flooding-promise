const cmmn = require('./cmmn');
const shared = require('./shared');

const ERROR_DICT = {
    internal_tag:new Error("@controller@,@agregator@,@cycler@ are internal Tag!!!"),
}

const HIDDEN_TASK_PROPS = [
    "task_func",
    "task_arguments",
    "cond_func_or_str",
    "cond_func_arguments",
    "promise",           //本轮promise,用来实现stop,pause,continue
    "aggregator"
]


//// task-constructor
function construct_task(instance,tag,task_func,task_params,cond_func_or_str,cond_func_params) {
    ////-不可见
    instance.task_func = task_func;
        //必需 return promise ; 
        //参数task_func(instance,...task_params);
        //parent 参数:
        //    instance.$parent().state
        //    instance.$parent().rslt
        //    instance.$parent().exception
        //自定义其他参数:
        //    ...task_params
    instance.task_arguments = (task_params===undefined)?[]:task_params;
    ////-不可见
    instance.cond_func_or_str = cond_func_or_str = (cond_func_or_str === undefined)?'task_parent_resolved':cond_func_or_str; 
        //默认 "task_parent_resolved" 见 cond.js
    instance.cond_func_arguments = (cond_func_params===undefined)?[]:cond_func_params;
    ////-可见, 上述汇总
    shared.set_condition(instance);
    ////--可见
    instance.state = undefined;
    instance.rslt = undefined;
    instance.exception = undefined;
    instance.extra_err_msg = undefined;
    ////--可见
    instance.started_at = undefined;
    instance.ended_at = undefined;
    insance.costed_time = undefined;
    ////--可见,须在controller ready时候检查
    if(shared.RESERVED_TAGS.includes(tag)) { throw(ERROR_DICT.internal_tag)}
    instance.tag = (tag === undefined)?instance.$guid:tag;
    ////--不可见
    instance.aggregator = undefined;
    instance.promise = null;
    ////
    shared.hide_props(instance,HIDDEN_TASK_PROPS);
}


//// task-ready
function ready_task(instance,aggregator) {
    instance.state = 'ready';
    if(instance.$is_leaf()) {
        //叶子节点链接Aggreator,互连
        instance.aggregator = aggregator;
        instance.aggregator.inlets.push(instance);
    } else {}
}

//// task-reset
function reset_task(instance) {
    instance.state = 'ready';
    instance.rslt = undefined;
    instance.exception = undefined;
    instance.extra_err_msg = undefined;
    instance.started_at = undefined;
    instance.ended_at = undefined;
    insance.costed_time = undefined;
    instance.promise = null;
}

//// task-stop
function stop_task(instance) {
    //不清除数据
    instance.state = 'stopped';
    instance.promise = null;
}


function task_finally_factory(instance) {
    let task_finally = f() {
        //触发所有下游执行
        let children = instance.$children();
        children.forEach(child=>child[shared.TASK_SYM_DICT.sym_exec]());
        if(instance.$is_leaf()) {
            //leaf 触发aggregator 执行
            instance.aggerator[shared.AGGREGATOR_SYM_DICT.sym_exec]();
        } else {
        }
    }
    return(task_finally)
}

function exec_task(instance) {
    let task_finally = task_finally_factory(instance);
    shared.exec_engine(instance,task_finally);
}

class Task extends nvtree.Node {
    constructor(...params) {super();construct_task(this);}
    [shared.TASK_SYM_DICT.sym_ready](aggregator) {ready_task(this,aggregator)}
    //上游触发,不允许手动调用
    //为了维持正确状态
    [shared.TASK_SYM_DICT.sym_exec]() {exec_task(this);}
    //由controller的reset 动作触发,不允许手动调用
    //为了维持正确状态
    [shared.TASK_SYM_DICT.sym_reset]() {reset_task(this);}
    //由controller的stop 动作触发,不允许手动调用
    //为了维持正确状态
    [shared.TASK_SYM_DICT.sym_stop]() {stop_task(this);}
}


module.exports = {
    HIDDEN_TASK_PROPS,
    ERROR_DICT,
    construct_task,
    ready_task,
    reset_task,
    stop_task,
    task_finally_factory,
    exec_task,
    Task,
}

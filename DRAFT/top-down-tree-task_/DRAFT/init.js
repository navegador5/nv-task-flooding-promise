const cmmn = require('./cmmn');
const Dtb = require("nvdtb").Cudtb


const ERROR_DICT = {
    internal_tag:new Error("@controller@,@agregator@,@cycler@ are internal Tag!!!"),
    duplidate_tag:new Error("duplicate Tag, change another one!!")
}


function check_tag(sdfs) {
    let tags = sdfs.map(r=>r.tag);
    let st = new Set(tags)
    let d = {}
    st.forEach(tag=>d[tag]=[])
    sdfs.forEach(
        (r,i)=>{
            d[r.tag].push(i)
        }
    )
    let rslt = {}
    for(let tag in d) {
        if(d[tag].length>2){
            rslt[tag] = d[tag]
        }
    }
    let cond = (Object.keys(rslt).length > 0)
    if(cond) {
        throw(new Error("tag must be unique: "+JSON.stringify(rslt)+" use controller.$sdfs[i].tag to change"))
    } else {
    }
}


////

////Cycler


/////

const HIDDEN_ROUNDP_PROPS = ["$resolve","$reject","cond_func_or_str","cond_func_arguments"]

function creat_round_promise(round,agg_cond_func_or_str,agg_cond_func_arguments) {
    //单轮的结果搜集器
    //每轮把上一轮的存入Aggregator 的 logger
    let $resolve;
    let $reject;
    let p = new Promise(
        (rs,rj) => {
            $resolve = rs;
            $reject = rj;
        }
    )
    p.$resolve = $resolve;
    p.$reject = $reject;
    p.state = undefined  //undefined [ready,pending] resolved rejected
    p.exception = undefined
    p.extra_err_msg = undefined
    p.cond_func_or_str = agg_cond_func_or_str;
    p.cond_func_arguments = (agg_cond_func_arguments === undefined)?[]:agg_cond_func_arguments;
    p.condition = set_instance(p);
    p.rslt = undefined
    hide_props(p,HIDDEN_ROUNDP_PROPS)
    p.started_at = undefined
    p.ended_at = undefined
    p.costed_time = undefined
    p.round = round
    return(p)
}



/////


function construct_controller(instance,tag,aggregator,round,tmout) {
    instance.state = undefined; // undefined [ready,pending] resolved 没有rejected
    instance.tag = (tag === undefined)?'@controller@':tag ;
    instance.aggregator = undefined;
    instance.cycler = undefined;
}

function reset_controller(instance) {
    instance.state = 'ready'; //controller 没有undefined pending
    Object.defineProperty(instance,"round_promise",{enumerable:false,configurable:false,writable:false});
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
    ERROR_DICT,
    ////
    hide_props,
    set_condition,
    ////
    construct_task,
    ready_task,
    reset_task,
    ////
    construct_controller,
    reset_controller,
}

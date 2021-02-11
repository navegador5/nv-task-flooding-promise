const nao = require("not-and-or");
const cmmn = require('./cmmn');

function is_settled_with_state(state) {
    return((state!=='pending') && (state!==undefined) && (state !== 'stopped') &&(state!=='ready'))
}

function is_settled(instance) {
    let state = instance.state;
    return(is_settled_with_state(state))
}

////
const ERROR_DICT = {
    no_str_cond_found:new Error(`
the supported str-condition is in ${Object.keys(STR_CONDS)};
you cant use a customer defined function cond_func(task,...cond_func_params);
or  use add_str_cond(name,<you function>) to add the str-condition;
`),
    no_early_reject_str_cond_found:new Error(`
the supported early-reject-str-condition is in ${Object.keys(EARLY_REJECT_STR_CONDS)};
you cant implement it in  customer defined function task_func(task,...task_func_params);
or  use add_early_reject_str_cond(name,<you function>) to add the early-reject-str-condition;
`),
}

////

function task_parent_resolved(instance) {
    let parent = instance.$parent()
    return(parent.state === 'resolved')
}

function task_parent_rejected(instance) {
    let parent = instance.$parent()
    return(parent.state === 'rejected')
}

function task_parent_settled(instance) {
    let parent = instance.$parent()
    return(is_settled(parent))
}

function aggregator_all(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.all(...conds))
}

function aggregator_all_not(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.all(...conds))
}

function aggregator_any(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.any(...conds))
}

function aggregator_any_not(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.any_not(...conds))
}


function aggregator_at_least_some(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.at_least_some(params[0],...conds))
}

function aggregator_at_least_some_not(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.at_least_some_not(params[0],...conds))
}

function aggregator_must_some(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.must_some(params[0],...conds))
}

function aggregator_must_some_not(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.must_some_not(params[0],...conds))
}

function aggregator_one(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.one(params[0],...conds))
}

function aggregator_one_not(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.one_not(params[0],...conds))
}

function aggregator_at_least_certain(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.at_least_certain(params,...conds))
}

function aggregator_at_least_certain_not(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.at_least_certain_not(params,...conds))
}

function aggregator_must_certain(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='resolved')
    return(nao.must_certain(params,...conds))
}

function aggregator_must_certain_not(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>r.state==='rejected')
    return(nao.must_certain_not(params,...conds))
}

function aggregator_all_settled(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>is_settled_with_state(r.state))
    return(nao.all(...conds))
}

function aggregator_any_settled(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>is_settled_with_state(r.state))
    return(nao.any(...conds))
}

function aggregator_at_least_some_settled(instance) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>is_settled_with_state(r.state))
    return(nao.at_least_some(...conds))
}


function aggregator_at_least_certain_settled(instance,...params) {
    let inlets = instance.inlets
    let conds = instance.inlets.map(r=>is_settled_with_state(r.state))
    return(nao.at_least_certain(params,...conds))
}




let STR_CONDS = {
    task_parent_resolved,
    task_parent_rejected,
    task_parent_settled,
    aggregator_all,
    aggregator_all_not,
    aggregator_any,
    aggregator_any_not,
    aggregator_at_least_some,
    aggregator_at_least_some_not,
    aggregator_must_some,
    aggregator_must_some_not,
    aggregator_one,
    aggregator_one_not,
    aggregator_at_least_certain,
    aggregator_at_least_certain_not,
    aggregator_must_certain,
    aggregator_must_certain_not,
    aggregator_all_settled,
    aggregator_any_settled,
    aggregator_at_least_some_settled,
    aggregator_at_least_certain_settled,
}

////

function get_real_cond_func(cond_func_or_str) {
    let cond = cmmn.is_function(cond_func_or_str);
    if(cond) {
        return(cond_func_or_str)
    } else {
        let cond_func = STR_CONDS[cond_func_or_str]
        if(cond_func === undefined) {
             throw(ERROR_DICT.no_str_cond_found)
        } else {
            return(cond_func)
        }
    }
}

function is_supported_str_cond(o) {
    let cond  =  (typeof(o) ==='string')
    return(cond && Object.keys(STR_CONDS).includes(o))
}


function add_str_cond(name,f) {
    STR_CONDS[name] = f,
}

////

function early_reject_task_parent_resolved(instance) { return({exception:undefined,extra_err_msg:undefined})}
function early_reject_task_parent_rejected(instance) {return({exception:undefined,extra_err_msg:undefined})}
function early_reject_task_parent_settled(instance) {return({exception:undefined,extra_err_msg:undefined})}

function early_reject_aggregator_all(instance) {
    let inlets = instance.inlets
    let index = inlets.findIndex(r=>r.state==='rejected')
    if(index > 0) {
        return({
            exception:inlets[index].exception,
            extra_err_msg:`required-all-resolved:but-inlets[${index}]-rejected`
        })
    } else {
        return({
            exception:undefined,
            extra_err_msg:undefined
        })
    }
}

function early_reject_aggregator_all_not(instance) {

}

/*
 * TODO:
 *     把这里补充完毕,early-reject
 *
 */


////
let EARLY_REJECT_STR_CONDS = {
    task_parent_resolved:early_reject_task_parent_resolved,
    task_parent_rejected:early_reject_task_parent_rejected,
    task_parent_settled:early_reject_task_parent_settled,
    aggregator_all:early_reject_aggregator_all,
    aggregator_all_not:early_reject_aggregator_all_not,
    aggregator_any:early_reject_aggregator_any,
    aggregator_any_not:early_reject_aggregator_any_not,
    aggregator_at_least_some:early_reject_aggregator_at_least_some,
    aggregator_at_least_some_not:early_reject_aggregator_at_least_some_not,
    aggregator_must_some:early_reject_aggregator_must_some,
    aggregator_must_some_not:early_reject_aggregator_must_some_not,
    aggregator_one:early_reject_aggregator_one,
    aggregator_one_not:early_reject_aggregator_one_not,
    aggregator_at_least_certain:early_reject_aggregator_at_least_certain,
    aggregator_at_least_certain_not:early_reject_aggregator_at_least_certain_not,
    aggregator_must_certain:early_reject_aggregator_must_certain,
    aggregator_must_certain_not:early_reject_aggregator_must_certain_not,
    aggregator_all_settled:early_reject_aggregator_all_settled,
    aggregator_any_settled:early_reject_aggregator_any_settled,
    aggregator_at_least_some_settled:early_reject_aggregator_at_least_some_settled,
    aggregator_at_least_certain_settled:early_reject_aggregator_at_least_certain_settled,
}


////
function get_real_early_reject_cond_func(cond_func_or_str) {
    let cond_func = EARLY_REJECT_STR_CONDS[cond_func_or_str]
    if(cond_func === undefined) {
        //throw(ERROR_DICT.no_early_reject_str_cond_found)
        return({
            exist:false,
            cond_func:undefined
        })
    } else {
        return({
            exist:true,
            cond_func:cond_func
        })
    }
}

function is_supported_early_reject_str_cond(o) {
    let cond  =  (typeof(o) ==='string')
    return(cond && Object.keys(EARLY_REJECT_STR_CONDS).includes(o))
}


function add_early_reject_str_cond(name,f) {
    EARLY_REJECT_STR_CONDS[name] = f,
}

////

module.exports = {
    is_settled_with_state,
    is_settled,
    //
    is_supported_str_cond,
    add_str_cond,
    get_real_cond_func,
    STR_CONDS,
    //
    is_supported_early_reject_str_cond,
    add_early_reject_str_cond,
    get_real_early_reject_cond_func,
    EARLY_REJECT_STR_CONDS,    
}

















const {Root} = require("ndtreejs").ndcls
const fac_bsc = require("nv-facutil-basic");
const {Cfg,load_to_sdfs} = require("nv-facutil-cfg");

const STATE_DICT = {
    init:"init",
    pending:"pending",
    resolved:"resolved",
    rejected:"rejected",
    impossible:"impossible",
    paused:"paused",
    stopped:"stopped"
}

/*
class Init { [util.inspect.custom] () { return("<init>")}}
const INIT = new Init();
class Pending { [util.inspect.custom] () { return("<pending>")}}
const PENDING = new Pending();
*/

const ERROR_DICT = {
    resolved:new Error("use-rslt-or-final"),
    rejected:new Error("use-rejected-or-final"),
    in_executing:new Error("still-in-executing-use-force-reset"),
    need_reset:new Error("reset-before-relaunch"),
    must_set_controller:new Error("(rs,rj,sdfs)=>{...}")
}

const DFLT_OPTIONS = {
    ignore_error:false
}


const DFLT_EXEC = (rs,rj,that)=>{}
const SYM_EXEC = Symbol("exec")
const SYM_TASK_NAME = Symbol("task_name")
const SYM_TYPE = Symbol("type")
const SYM_PROMISE = Symbol("promise");

const TYPE_DICT = {
    root:"root",
    nonroot:"nonroot"
}


const SYM_CONTROLLER = Symbol("controller")

const SYM_RESET = Symbol("reset")
const SYM_RESET_EXEC = Symbol("reset_exec")
//with controller ,this is NOT needed
//const SYM_READY = Symbol("ready")
//[SYM_READY]() {this.#state = "pending"}

const SYM_IMPOSSIBLE = Symbol("impossible")
const SYM_SET_IMPOSSIBLE = Symbol("set_impossible")
const SYM_UNSET_IMPOSSIBLE = Symbol("unset_impossible")


function _set_impossible(nd) {
    let sdfs = nd.$sdfs()
    sdfs.forEach(nd=>nd[SYM_SET_IMPOSSIBLE]())
}


function _run_children(that) {
    if(that.options.ignore_error || that.is_resolved()) {
        let children = that.$children();
        children.forEach(child=>{child[SYM_EXEC]()})
    } else {
        let sdfs = that.$sdfs();
        sdfs = sdfs.slice(1);  //not include self
        sdfs.forEach(des=>{_set_impossible(des)})
        //通知controller 检查
        that[SYM_CONTROLLER][SYM_RECV_FROM](that);
    }
}


function _is_in_executing(sdfs) {
    for(let nd of sdfs) {
        if(nd.state === 'pending') {return(true)}
    } 
    return(false)
}

function _check_one_state(nd) {
    let name = nd[SYM_TASK_NAME]
    let state = nd.state 
    let indent = "    ".repeat(nd.$depth())
    let data;
    if(state === "resolved") {
        data = nd.rslt
    } else if(state === "rejected") {
        data = nd.exception
    } else {
        data = ""
    }
    let tem = `${indent}${name}[${data}] Promise \{ <${state}> \} `
    return(tem)
}


function _get_cfg(cfg) {
    let handler = (cfg.handler === undefined)?DFLT_EXEC:cfg.handler
    let options = JSON.parse(JSON.stringify(DFLT_OPTIONS))
    Object.assign(options,cfg.options);
    let d = {handler,options}
    return(d)
}

class _FPromise extends Root {
    #type = "root"
    #tag = ""
    #controller
    #p
    #rs
    #rj
    #exec
    #state = "init"
    #rslt
    #exception
    #opt
    constructor(tag,cfg,controller) {
        let {handler,options} = _get_cfg(cfg);
        super();
        this.#exec = handler 
        this.#opt = options
        this.#p = new Promise((rs,rj)=>{this.#rs = rs;this.#rj = rj});
        this.#controller = controller;
        this.#tag = tag
    }
    get [SYM_CONTROLLER]() {return(this.#controller)}
    get [SYM_PROMISE]() {return(this.#p)}
    [SYM_RESET_EXEC] (f) {this.#exec = f}
    [SYM_RESET]() {
        this.#p = new Promise((rs,rj)=>{this.#rs = rs;this.#rj = rj});
        this.#rslt = undefined;
        this.#exception = undefined;
        this.#state = "init"
        delete this.#p[SYM_IMPOSSIBLE]
    }
    set [SYM_TYPE](typ) { this.#type = typ}
    get [SYM_TYPE]()    {return(this.#type)}
    [SYM_SET_IMPOSSIBLE]() {
        this.#p[SYM_IMPOSSIBLE]=true;
        this.#state = "impossible"
    }
    [SYM_UNSET_IMPOSSIBLE]() {
        delete this.#p[SYM_IMPOSSIBLE]
        this.#state = "init"
    }
    set options(opt) {Object.assign(this.#opt,opt);}
    get options() { return(this.#opt)}
    set task(f) {
        this[SYM_RESET]();
        this[SYM_RESET_EXEC](f);
    }
    get task()  {return(this.#exec)}
    finally(f) {this.#p.finally(f)}
    get [SYM_TASK_NAME] () {return(this.#tag===""?this.#exec.name:this.#tag)}
    [SYM_EXEC]() {
        if(this.#state === 'init') {
            this.#state = 'pending';
            this.#exec(this.#rs,this.#rj,this);
            this.#p.then(
                r=>{
                    this.#state = "resolved";
                    this.#rslt = r;
                    this.#controller[SYM_RECV_FROM](this);
                    _run_children(this);
                }
            ).catch(
                err=>{
                    this.#state="rejected"
                    this.#exception = err
                    this.#controller[SYM_RECV_FROM](this);
                    _run_children(this);
                }
            )
        } else {
            //pending,resolved,rejected,impossible
        }
    }
    get rslt() {
        if(this.#state === "resolved") {
            return(this.#rslt)
        } else if(this.#state === "rejected") {
            throw(ERROR_DICT.rejected)
        } else {

        }
    }
    get exception() {
        if(this.#state === "rejected") {
            return(this.#exception)
        } else if(this.#state === "resolved"){
            throw(ERROR_DICT.resolved)
        } else {
        }
    }
    get final() {
        if(this.#state === "resolved") {
            return(this.#rslt)
        } else if(this.#state === "rejected") {
            return(this.#exception)
        } else {
        }
    }
    get state() {return(this.#state)}
    is_settled() {return(this.#state !== "pending" && this.#state !== "init")}
    is_pending() {return(this.#state === "pending")}
    is_resolved() {return(this.#state === "resolved")}
    is_rejected() {return(this.#state === "rejected")}
    disconn() {this.$disconn()}
    append_child(tag,cfg) {
        cfg = _get_cfg(cfg);
        let child = new _FPromise(tag,cfg,this.#controller);
        child[SYM_TYPE] = 'nonroot';
        this.$append_child(child);
        return(child);
    }
    insert_child(tag,index,cfg) {
        cfg = _get_cfg(cfg);
        let child = new _FPromise(tag,cfg,this.#controller);
        child[SYM_TYPE] = 'nonroot';
        this.$insert_child(index,child);
        return(child);
    }
}

function _repr(that) {
    return({promise:that[SYM_PROMISE],task:that[SYM_TASK_NAME]})
}

fac_bsc.add_repr(_FPromise,_repr)


function _construct_from_sdfs_cfg(that,sdfs) {
    let cfgrt = sdfs[0]
    let mp = new Map();
    let rt = new _FPromise(cfgrt.key,cfgrt.val,that)
    mp.set(cfgrt,rt);
    let cfgnd = cfgrt.$sdfs_next()
    while(cfgnd!==null) {
        let cfgp = cfgnd.$parent();
        let p = mp.get(cfgp);
        let nd = p.append_child(cfgnd.key,cfgnd.val);
        mp.set(cfgnd,nd);
        cfgnd = cfgnd.$sdfs_next();
    }
    mp = null;
    return(rt)
}

const SYM_RECV_FROM = Symbol("recv-from")

function _check_controller(cexec) {
    if(typeof(cexec)!=='function') {throw(ERROR_DICT.must_set_controller)}
}

function _cfg_to_sdfs(cfg) {
    if(cfg instanceof Cfg) {
        return(cfg.sdfs())
    } else {
        return(load_to_sdfs(cfg))
    }
}

class FPromise {
    #rt
    #p
    #crs
    #crj
    #cexec
    constructor(cexec,cfg) {
        _check_controller(cexec);
        let sdfs = _cfg_to_sdfs(cfg);
        this.#rt = _construct_from_sdfs_cfg(this,sdfs);
        this.#p = new Promise((rs,rj)=>{this.#crs = rs;this.#crj = rj});
        this.#cexec = cexec;
    }
    launch() {
        if(!_is_in_executing(this.#rt.$sdfs())){
            let sdfs = this.#rt.$sdfs();
            sdfs.forEach(nd=>nd[SYM_RESET]());
            this.#p = new Promise((rs,rj)=>{this.#crs = rs;this.#crj = rj});
            this.#rt[SYM_EXEC]();
        } else {
            throw(ERROR_DICT.need_reset);
        }
    }
    reset(force=false) {
        let sdfs = this.#rt.$sdfs()
        if(force) {
            sdfs.forEach(nd=>nd[SYM_RESET]())
            this.#p = new Promise((rs,rj)=>{this.#crs = rs;this.#crj = rj});
        } else {
            let cond = _is_in_executing(sdfs)
            if(cond) {
                throw(ERROR_DICT.in_executing)
            } else {
                sdfs.forEach(nd=>nd[SYM_RESET]())
                this.#p = new Promise((rs,rj)=>{this.#crs = rs;this.#crj = rj});
            }
        }
    }
    is_in_executing() { return(_is_in_executing(this.#rt.$sdfs()))}
    check_state() {
        let sdfs = this.#rt.$sdfs()
        for(let i=0;i<sdfs.length;i++) {console.log(_check_one_state(sdfs[i]))}
    }
    get exec_routes() {
        let sdfs = this.#rt.$sdfs()
        sdfs = sdfs.filter(nd=>nd.state!=="impossible")
        sdfs = sdfs.filter(nd=>nd.$is_leaf())
        let routes =sdfs.map(
            nd=>{
                let route = nd.$ances(true);
                route.reverse();
                return(route)
            }
        );
        return(routes)
    }
    [Symbol.iterator]() { return(this.#rt.$sdfs()[Symbol.iterator]())}
    [SYM_RECV_FROM](src,data) {
        let sdfs = this.#rt.$sdfs();
        let lefted = sdfs.filter(r=>(r.state==="pending") ||(r.state==="init"));
        if(lefted.length === 0) {
            this.#cexec(this.#crs,this.#crj,sdfs);
        }
    }
    get controller() {return(this.#p)}
    set controller(cexec) {
        let sdfs = this.#rt.$sdfs();
        let cond = _is_in_executing(sdfs)
        if(cond) {
            throw(ERROR_DICT.in_executing)
        } else {
            _check_controller(cexec);
            sdfs.forEach(nd=>nd[SYM_RESET]());
            this.#p = new Promise((rs,rj)=>{this.#crs = rs;this.#crj = rj});
            this.#cexec = cexec;
        }
    }
    then(f) {return(this.#p.then(r=>f(r)))}
    catch(f) {return(this.#p.catch(err=>f(err)))}
    finally(f) {return(this.#p.finally(r=>f(r)))}
}

function repr(that) {return(that.controller)}

fac_bsc.add_repr(FPromise,repr)



const DFLT_CFG = {
    handler:DFLT_EXEC,
    options:DFLT_OPTIONS
}


module.exports = {
    FPromise,
    ERROR_DICT,
    STATE_DICT,
    DFLT_CFG,
}

function _web_export_cfg() {
    if(fac_bsc.is_node()) {
    } else {
        module.exports.Cfg = Cfg
    }
}

_web_export_cfg();


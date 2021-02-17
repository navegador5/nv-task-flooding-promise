const {FPromise} = require("./index");

const {Cfg} = require("nv-facutil-cfg")

var cfg = new Cfg() 
cfg.$$.task_root.task_a.task_d.task_g.task_i
cfg.$$.task_root.task_a.task_e
cfg.$$.task_root.task_b.task_f.task_h
cfg.$$.task_root.task_c


function creat_succ_tsk_template(name) {
    function _tsk(rs,rj,self) {
        let delay = Math.random() * 5000;
        setTimeout(
            ()=>{
                console.log("after " + delay + " seconds->"+name+" triggered");
                    let p = self.$parent();  //get rslt from parent
                    if(p===null) {
                        rs(0);
                    } else {
                        rs(p.rslt + 1)
                    }
                },
                delay
            )
        }
        Object.defineProperty(_tsk,"name",{value:name})
        return({
            handler:_tsk,
            options:{ignore_error:false}
        })
}

cfg.$$.task_root = creat_succ_tsk_template('task_root')
cfg.$$.task_root.task_a = creat_succ_tsk_template('task_a')
cfg.$$.task_root.task_a.task_d = creat_succ_tsk_template('task_d')
cfg.$$.task_root.task_a.task_d.task_g = creat_succ_tsk_template('task_g')
cfg.$$.task_root.task_a.task_d.task_g.task_i = creat_succ_tsk_template('task_i')
cfg.$$.task_root.task_a.task_e = creat_succ_tsk_template('task_e')
cfg.$$.task_root.task_b = creat_succ_tsk_template('task_b')
cfg.$$.task_root.task_b.task_f = creat_succ_tsk_template('task_f')
cfg.$$.task_root.task_b.task_f.task_h = creat_succ_tsk_template('task_h')
cfg.$$.task_root.task_c = creat_succ_tsk_template('task_c')


var p = new FPromise(
    function controller(rs,rj,sdfs) {//sdfs is all task-nodes in dfs sequence
        let rslvs =  sdfs.filter(r=>r.state === "resolved");
        let rjcts =  sdfs.filter(r=>r.state === "rejected");
        let impossibles = sdfs.filter(r=>r.state === "impossible");
        //impossibles is the descendants of rejected-task-nodes
        if(rjcts.length +impossibles.length<5) {
            rs(rslvs.map(r=>r.rslt));
        }  else {
            rj(rjcts.map(r=>r.exception))
        }
    },
    cfg,   
);

p.launch();

p.controller.then(rslts=>console.log(rslts)).catch(errs=>{console.log(errs)})

p.exec_routes

p.check_state()

Array.from(p)


var cfg = new Cfg()
cfg.$$.task_root.task_a.task_d.task_g.task_i
cfg.$$.task_root.task_a.task_e
cfg.$$.task_root.task_b.task_f.task_h
cfg.$$.task_root.task_c

function creat_random_tsk_template(name,ignore_error) {
    function _tsk(rs,rj,self) {
        let delay = Math.random() * 5000;
        setTimeout(
            ()=>{
                let p = self.$parent();  //get rslt from parent
                if(p===null) {
                    console.log("after " + delay + " seconds->"+name+" triggered");
                    rs(0);
                } else {
                    if(delay>3500){
                        console.log("after " + delay + " seconds->"+name+" fail");
                        rj(p.final + 1) //final used when ignore_error ,means rslt-or-exception 
                    } else {
                        console.log("after " + delay + " seconds->"+name+" succ");
                        rs(p.final + 1)
                    }
                }
            },
            delay
        )
    }
    Object.defineProperty(_tsk,"name",{value:name})
    return({
        handler:_tsk,
        options:{ignore_error:ignore_error}
    })
}


cfg.$$.task_root = creat_random_tsk_template('task_root',false)
cfg.$$.task_root.task_a = creat_random_tsk_template('task_a',false)
cfg.$$.task_root.task_a.task_d = creat_random_tsk_template('task_d',false)
cfg.$$.task_root.task_a.task_d.task_g = creat_random_tsk_template('task_g',false)
cfg.$$.task_root.task_a.task_d.task_g.task_i = creat_random_tsk_template('task_i',false)
cfg.$$.task_root.task_a.task_e = creat_random_tsk_template('task_e',false)
cfg.$$.task_root.task_b = creat_random_tsk_template('task_b',false)
cfg.$$.task_root.task_b.task_f = creat_random_tsk_template('task_f',false)
cfg.$$.task_root.task_b.task_f.task_h = creat_random_tsk_template('task_h',false)
cfg.$$.task_root.task_c = creat_random_tsk_template('task_c',false)


var p = new FPromise(
     function controller(rs,rj,sdfs) {//sdfs is all task-nodes in dfs sequence
         let rslvs =  sdfs.filter(r=>r.state === "resolved");
         let rjcts =  sdfs.filter(r=>r.state === "rejected");
         let impossibles = sdfs.filter(r=>r.state === "impossible");
         //impossibles is the descendants of rejected-task-nodes
         if(rjcts.length +impossibles.length<5) {
             rs(rslvs.map(r=>r.rslt));
         }  else {
             rj(rjcts.map(r=>r.exception))
         }
     },
     cfg,
);

p.launch();
//use controller to finish then and catch
p.controller.then(rslts=>console.log(rslts)).catch(errs=>{console.log(errs)})

p.check_state()

p.reset()
Array.from(p).forEach(tsk=>{tsk.options.ignore_error = true})
p.controller.then(rslts=>console.log(rslts)).catch(errs=>{console.log(errs)})
p.launch()

p
p.check_state()



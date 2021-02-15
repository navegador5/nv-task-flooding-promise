const child_process = require('child_process')
child_process.execSync("npm install ndtreejs")
child_process.execSync("npm install nv-facutil-basic")
child_process.execSync("npm install nv-facutil-cfg")
child_process.execSync("npm install nvjson")


const {FPromise} = require("../index");
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




nv-task-flooding-promise
==================
- nv-task-flooding-promise  is for flooding tasks from root
- original-promise or async/await doing this need much manual-coding
- with original-promise if the task-tree is very big, 
- such as 100-200 tasks,7-8 levels automation is hard


install
=======
- npm install nv-task-flooding-promise 

usage
=====
    
    for exzample, you have many tasks involved in your application:
    and they all triggered from a root-task:


        task_root->
            ->task_a
                ->task_d
                    ->task_g
                        ->task_i
                ->task_e
            ->task_b
                ->task_f
                    ->task_h
            ->task_c

     
     root triggered a,b,c
     and then a triggered d,e;
              b trigered f;
     and then d->g->i;
              b->f->h;


     if only 10~20 such tasks, manually coding is OK.
     if 100~200, and the depth 5~10 , the original-promise will be boring


     
example
-------

    const {FPromise} = require("nv-task-flooding-promise");

    //this is for config
    const {Cfg} = require("nv-facutil-cfg")
    
    var cfg = new Cfg() 

    //config task relations
    cfg.$$.task_root.task_a.task_d.task_g.task_i
    cfg.$$.task_root.task_a.task_e
    cfg.$$.task_root.task_b.task_f.task_h
    cfg.$$.task_root.task_c
    
    /*
    > cfg.relation()
    {
      task_root: {
        task_a: { task_d: [Object], task_e: {} },
        task_b: { task_f: [Object] },
        task_c: {}
      }
    }
    >
    */    


###get your tasks ready

     //config task 
     //each task is a function as : (rs,rj,self) => {/*....*/}
     //self is the internal node
  
      
     for example, we prepare a function  to create serveral tasks:
         
     
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



### add them to promise-tree


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


    //you can also just use a json with the following format if you dont use
    //nv-facutil-cfg
    /*
    {
      relation: { task_root: { task_a: [Object], task_b: [Object], task_c: {} } },
      data: {
        task_root: [Function: task_root],
        'task_root.task_a': [Function: task_a],
        'task_root.task_a.task_d': [Function: task_d],
        'task_root.task_a.task_d.task_g': [Function: task_g],
        'task_root.task_a.task_d.task_g.task_i': [Function: task_i],
        'task_root.task_a.task_e': [Function: task_e],
        'task_root.task_b': [Function: task_b],
        'task_root.task_b.task_f': [Function: task_f],
        'task_root.task_b.task_f.task_h': [Function: task_h],
        'task_root.task_c': [Function: task_c]
      }
    }
    */



### launch it


    // new FPromise((resolve,reject,sdfs)=>{/*...*/}, cfg) 
    // sdfs is all internal-task-nodes in dfs sequence

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
         

     /*
      after 2112.7272304468934 seconds->task_root triggered
         after 1964.9761881692352 seconds->task_c triggered
         after 2285.3940128385584 seconds->task_a triggered
         after 4669.763423147677 seconds->task_b triggered
           after 2965.1637361948024 seconds->task_e triggered
           after 3987.381625156461 seconds->task_d triggered
             after 2402.162036014821 seconds->task_g triggered
           after 4050.0846986378037 seconds->task_f triggered
               after 1743.311241456683 seconds->task_i triggered
             after 4737.448583353438 seconds->task_h triggered
     
     */


### check the exec\_routes

    /*
    > p.exec_routes
    [
      [
        { promise: [Promise], task: 'task_root' },
        { promise: [Promise], task: 'task_a' },
        { promise: [Promise], task: 'task_d' },
        { promise: [Promise], task: 'task_g' },
        { promise: [Promise], task: 'task_i' }
      ],
      [
        { promise: [Promise], task: 'task_root' },
        { promise: [Promise], task: 'task_a' },
        { promise: [Promise], task: 'task_e' }
      ],
      [
        { promise: [Promise], task: 'task_root' },
        { promise: [Promise], task: 'task_b' },
        { promise: [Promise], task: 'task_f' },
        { promise: [Promise], task: 'task_h' }
      ],
      [
        { promise: [Promise], task: 'task_root' },
        { promise: [Promise], task: 'task_c' }
      ]
    ]
    >
    
    */


### check the state and tree-relaion at any time

- currently support 5 states
- pending       same as original promise
- resolved      same as original promise
- rejected      same as original promise
- impossible    if ignore\_error === false,which is default, the descendants of a rejected node
- init          normally USELESS , it means you forget to use p.launch()

- other states currently not supported, coz the API is not easy to design

     /*
     > p.check_state()
     task_root[0] Promise { <resolved> }
         task_a[1] Promise { <resolved> }
             task_d[2] Promise { <resolved> }
                 task_g[3] Promise { <resolved> }
                     task_i[4] Promise { <resolved> }
             task_e[2] Promise { <resolved> }
         task_b[1] Promise { <resolved> }
             task_f[2] Promise { <resolved> }
                 task_h[3] Promise { <resolved> }
         task_c[1] Promise { <resolved> }
     undefined
     >
     
     */


### iterator of all tasks (based on dfs-sequence)

    /*
    [
      { promise: Promise { 0 }, task: 'task_root' },
      { promise: Promise { 1 }, task: 'task_a' },
      { promise: Promise { 2 }, task: 'task_d' },
      { promise: Promise { 3 }, task: 'task_g' },
      { promise: Promise { 4 }, task: 'task_i' },
      { promise: Promise { 2 }, task: 'task_e' },
      { promise: Promise { 1 }, task: 'task_b' },
      { promise: Promise { 2 }, task: 'task_f' },
      { promise: Promise { 3 }, task: 'task_h' },
      { promise: Promise { 1 }, task: 'task_c' }
    ]
    >
    
    */


### task with errors(catch)

     var cfg = new Cfg()
     
     //config task relations
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
     
     
     
     /*
     > after 600.3101318812753 seconds->task_root triggered
     after 1158.1606700378122 seconds->task_c succ
     after 3162.7679099796915 seconds->task_b succ
     after 3564.666749607096 seconds->task_a fail
     after 4234.846389022151 seconds->task_f fail
     */
     
     
     > p.check_state()
     task_root[0] Promise { <resolved> }
         task_a[1] Promise { <rejected> }
             task_d[] Promise { <impossible> }
                 task_g[] Promise { <impossible> }
                     task_i[] Promise { <impossible> }
             task_e[] Promise { <impossible> }
         task_b[1] Promise { <resolved> }
             task_f[2] Promise { <rejected> }
                 task_h[] Promise { <impossible> }
         task_c[1] Promise { <resolved> }
     undefined
     >


### reset and ignore-error

     p.reset()
     Array.from(p).forEach(tsk=>{tsk.options.ignore_error = true})
     p.controller.then(rslts=>console.log(rslts)).catch(errs=>{console.log(errs)})
     p.launch()
     
     /*
     > p
     Promise { [
         0, 1, 2, 4,
         2, 1, 1
       ] }
     >
     > p.check_state()
     task_root[0] Promise { <resolved> }
         task_a[1] Promise { <resolved> }
             task_d[2] Promise { <resolved> }
                 task_g[3] Promise { <rejected> }
                     task_i[4] Promise { <resolved> }
             task_e[2] Promise { <resolved> }
         task_b[1] Promise { <resolved> }
             task_f[2] Promise { <rejected> }
                 task_h[3] Promise { <rejected> }
         task_c[1] Promise { <resolved> }
     undefined
     >
     
     */



METHODS
=======

    p.catch                 p.check_state           p.constructor           p.controller
    p.exec_routes           p.finally               p.is_in_executing       p.launch
    p.reset                 p.then
    p[Symbol.iterator]


TASK METHODS
============

    tsk.append_child                   tsk.constructor
    tsk.disconn                        tsk.exception
    tsk.final                          tsk.finally
    tsk.insert_child                   tsk.is_pending
    tsk.is_rejected                    tsk.is_resolved
    tsk.is_settled                     tsk.options
    tsk.rslt                           tsk.state
    tsk.task


APIS
====

- FPromise,
- ERROR\_DICT,
- STATE\_DICT,
- DFLT\_CFG,        


LICENSE
=======
- ISC 

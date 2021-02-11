function is_function(o) {return(typeof(o) === 'function')}

function copy_error(err) {
    let nerr = new globalThis[err.name](err.message)
    nerr.stack = err.stack
    return(nerr)
}


module.exports = {
    is_function,
    copy_error,
}

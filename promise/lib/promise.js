/**
 * 自定义promise函数模块:IIFE
 */
(function (window) {
  // 定义常量
  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  // Promise构造函数 executor:执行器函数（同步执行）
  function Promise(executor) {
    // 将当前promise对象保存起来
    const _this = this
    _this.status = PENDING //给promise对象指定status属性值，出视为PENDING
    _this.data = undefined   //给promise对象指定一个用于存储结果数据的属性
    _this.callbacks = []     //缓存回调函数，每个元素的结构{onRESOLVED(){},onREJECTED(){}}
    function resolve(value) {
      // 状态只能改变一次
      if (_this.status !== PENDING) {
        return
      }
      // 将状态改为RESOLVED
      _this.status = RESOLVED
      // 保存data数据
      _this.data = value
      // 如果有待执行callback函数，立即异步执行回调函数onRESOLVED
      if (_this.callbacks.length > 0) {
        setTimeout(() => {  //放入队列中执行所有成功的回调
          _this.callbacks.forEach(callbacksObj => {
            callbacksObj.onRESOLVED(value)
          });
        })
      }
    }
    function reject(reason) {
      if (_this.status !== PENDING) {
        return
      }
      // 将状态改为REJECTED
      _this.status = REJECTED
      // 保存data数据
      _this.data = reason
      // 如果有待执行callback函数，立即异步执行回调函数onRejected
      if (_this.callbacks.length > 0) {
        setTimeout(() => {  //放入队列中执行所有成功的回调
          _this.callbacks.forEach(callbacksObj => {
            callbacksObj.onRejected(reason)
          });
        })
      }
    }
    // 立即同步执行executor
    try {
      executor(resolve, reject)
    } catch (error) { //如果执行器抛出异常，promise对象变为REJECTED状态
      reject(error)
    }
  }

  // promise原型对象对象的then():指定成功和失败的回调函数，返回一个新的promise对象
  Promise.prototype.then = function (onResolved, onRejected) {
    const _this = this
    // 返回一个新的promise
    return new Promise((resolve,reject) => {
      if (_this.status === PENDING) {
        // 假设当前还是PENDING状态，将回调函数保存起来
        _this.callbacks.push({
          onResolved,
          onRejected
        })
      }else if(_this.status === RESOLVED){
        setTimeout(() => {
          /**
           * 1.如果抛出异常，return的promise就会失败，reason就是error
           * 2.如果回调函数返回不是promise，return的promise就会成功，value就是返回的值
           * 3.如果回调函数返回是promise,return的promise结果就是这个promise的结果
           */
          try{
            const result =  onResolved(_this.data)
            if(result instanceof Promise){
              // result.then(resolve,reject)
              result.then(
                value => {  //当result成功时，让return的promise也成功
                  resolve(value)
                },
                reason => { //当result失败时，让return的promise也失败
                  reject(reason)
                }
              )
            }
          }catch(error){
            reject(error)
          }

        })
      }else{  //_this.status === REJECTED
        setTimeout(() => {
          setTimeout(() => {
            /**
             * 1.如果抛出异常，return的promise就会失败，reason就是error
             * 2.如果回调函数返回不是promise，return的promise就会成功，value就是返回的值
             * 3.如果回调函数返回是promise,return的promise结果就是这个promise的结果
             */
            try{
              const result =  onRejected(_this.data)
              if(result instanceof Promise){
                // result.then(resolve,reject)
                result.then(
                  value => {  //当result成功时，让return的promise也成功
                    resolve(value)
                  },
                  reason => { //当result失败时，让return的promise也失败
                    reject(reason)
                  }
                )
              }
            }catch(error){
              reject(error)
            }
          })
        })
      }
    })
    
  }

  // promise原型对象对象的catch()：指定失败的回调函数，返回一个新的promise对象
  Promise.prototype.catch = function (onREJECTED) {

  }

  // promise函数对象的方法resolve：返回一个指定结果的成功的promise
  Promise.resolve = function (value) {

  }

  // promise函数对象的方法reject：返回一个指定reason的失败的promise
  Promise.reject = function (reason) {

  }

  // promise函数对象的方法all：返回一个promise，只有当所有promise都成功时才成功，否则失败
  Promise.all = function (promises) {

  }

  // promise函数对象的方法race：返回一个promise，其结果由第一个完成的promise来决定
  Promise.race = function (promises) {

  }

  // 向外暴露Promise函数
  window.Promise = Promise
})(window)
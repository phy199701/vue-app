import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

let router = new Router({
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/login') },
    { path: '/home', name: 'home', component: () => import('@/views/home') }
  ]
})
router.beforeEach((to, from, next) => {
  // to and from are both route objects. must call `next`.
  let token = window.sessionStorage.getItem('token')
  if (!token && to.path !== '/login') {
    return next('/login')
  }
  next()
})

export default router

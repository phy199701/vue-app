<template>
  <div class="login-container">
    <div class="login-box">
      <!-- login的图片 -->
      <div class="box-trans">
        <img src="./logo_index.png" alt>
        <!--组件中的 属性绑定 和 v-model 必须要有对应的data成员支持配合-->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
          <el-form-item prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="请输入手机号码" >
            <i slot="prefix" class="el-icon-mobile"></i>
            </el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input v-model="loginForm.code" placeholder="请输入验证码">
            <i slot="prefix" class="el-icon-set-up"></i>
            </el-input>
          </el-form-item>
          <el-form-item prop="xieyi">
            <el-checkbox v-model="loginForm.xieyi"></el-checkbox>
            <span>我已阅读并同意用户协议和隐私条款</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width:100%;" @click="login()" v-loading="btnLoading">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import '@/assets/js/gt.js'

export default {
  data () {
    var checkMobile = function (rule, value, callback) {
      // value:被校验的数据
      // callback：回调函数，无论校验成功与否，该函数都需要调用
      var reg = /^1[356789]\d{9}$/
      // 校验
      if (!reg.test(value)) {
        // 失败
        return callback(new Error('手机号码格式不正确！'))
      }
      callback()
    }
    var checkXieyi = function (rule, value, callback) {
      if (Number(value) === 0) {
        // 没有勾选协议，就报错
        return callback(new Error('请遵守协议！'))
      }
      callback()
    }
    return {
      loginForm: {
        mobile: '13911111111',
        code: '246810',
        xieyi: false
        // btnLoading: false
      },
      catpchaObject: null,
      btnLoading: false,
      loginFormRules: {
        mobile: [{ required: true, message: '手机号码必填', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }],
        code: [{ required: true, message: '密码必填', trigger: 'blur' }],
        xieyi: [
          // 布尔值 需要通过自定义方式实现校验
          { validator: checkXieyi }
        ]
      }
    }
  },
  methods: {
    login () {
      // 只允许建立一个div
      if (this.catpchaObject) {
        return this.catpchaObject.verify()
      }
      // 登陆等待
      this.btnLoading = true
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          let pro = this.$http.get(`/captchas/${this.loginForm.mobile}`)
          pro
            .then((result) => {
              let { data } = result.data
              // 显示人机交互的窗口
              window.initGeetest({
                // 以下配置参数来自服务端 SDK
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success,
                new_captcha: true,
                product: 'bind' // 隐藏"人机按钮"
              }, captchaObj => {
                captchaObj.onReady(() => {
                  captchaObj.verify()
                  this.btnLoading = false
                }).onSuccess(() => {
                  // this.btnLoading = false
                  this.loginAct()
                }).onError(() => {
                  // 失败
                })
              }
              )
            })
          // 登陆
          // this.loginAct()
        }
      })
    },
    loginAct () {
      let pro = this.$http.post('/authorizations', this.loginForm)
      pro
        .then((result) => {
          // 设置token
          let { name, token, photo } = result.data
          window.sessionStorage.setItem('name', name)
          window.sessionStorage.setItem('token', token)
          window.sessionStorage.setItem('photo', photo)
          // 跳转到home后台
          this.$router.push({ name: 'home' })
        })
        .catch((err) => {
          // 报错信息
          console.log('ac', err)
          return this.$message.error('用户名错误')
        })
    }
  }
}
</script>

<style lang="less">
.login-container {
  height: 100%;
  // background-color: gray;
  background-image: url(log-bg.jpg);
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-box {
    width: 410px;
    height: 345px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    .el-form {
      width: 100%;
    }
    .box-trans {
      width: 75%;
      text-align: center;
      img {
        width: 60%;
        margin: 20px 0;
      }
    }
  }
}
</style>
